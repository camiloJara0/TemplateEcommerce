<?php

namespace App\Services\Integration;

use App\Services\Integration\Normalizers\InventoryNormalizer;
use App\Services\Integration\Normalizers\ProductNormalizer;

/**
 * ERP de prueba externo (C:\Proyectos\PruebaAPI\ERP, escuchando en
 * 127.0.0.1:8001). La URL base, la API key y las rutas NO se piden en el
 * panel: se leen de la configuración del backend (.env →
 * ERP_PRUEBA_URL / ERP_PRUEBA_API_KEY / ERP_PRUEBA_RUTA_*).
 *
 * Contrato HTTP (middleware `api.key` del ERP):
 *   GET {base}{ruta.productos}     header X-API-KEY → {success, data:[{id, nombre, sku, stock, descripcion, categoria, marca, precios:[{tipo,precio}]}]}
 *   GET {base}{ruta.inventario}    header X-API-KEY → {success, data:[{product_id, sku, stock}]}
 */
class ErpPruebaProvider extends AbstractIntegrationProvider
{
    public function name(): string
    {
        return 'erp_prueba';
    }

    public function probarConexion(array $credenciales): array
    {
        $items = $this->get($this->ruta('productos'), $credenciales);

        return [
            'success' => true,
            'message' => 'Conexión exitosa con ERP Prueba (' . count($items) . ' productos disponibles).',
        ];
    }

    public function obtenerProductos(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        // El ERP de prueba no expone timestamps: siempre entrega el catálogo
        // completo y la idempotencia (hash) se encarga de omitir sin cambios.
        return $this->paginar($this->get($this->ruta('productos'), $credenciales), $pagina);
    }

    public function obtenerInventario(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        return $this->paginar($this->get($this->ruta('inventario'), $credenciales), $pagina);
    }

    public function normalizarProducto(array $registro): array
    {
        // El ERP expone `precios` (minorista/mayorista); el normalizador
        // canónico espera un único `precio`. Se toma el minorista (o el
        // primero) y se delega al normalizador compartido.
        if (!isset($registro['precio'])) {
            $precios = (array) ($registro['precios'] ?? []);
            $precio = null;

            foreach ($precios as $p) {
                if ((string) ($p['tipo'] ?? '') === 'minorista') {
                    $precio = $p['precio'] ?? null;
                    break;
                }
            }

            if ($precio === null && $precios !== []) {
                $precio = $precios[array_key_first($precios)]['precio'] ?? null;
            }

            if ($precio !== null) {
                $registro['precio'] = $precio;
            }
        }

        return app(ProductNormalizer::class)->normalizar($registro);
    }

    public function normalizarInventario(array $registro): array
    {
        // El ERP usa `product_id`; el normalizador canónico espera `producto_id`.
        if (!isset($registro['producto_id']) && isset($registro['product_id'])) {
            $registro['producto_id'] = $registro['product_id'];
        }

        return app(InventoryNormalizer::class)->normalizar($registro);
    }

    /**
     * GET autenticado con X-API-KEY. Lanza IntegrationException clasificada
     * (401/403/4xx = permanente; 5xx/429 = transitorio para backoff).
     *
     * @return array<int, array>
     */
    private function get(string $ruta, array $credenciales): array
    {
        $config = $this->resolverConfig($credenciales);
        $url = rtrim($config['base_url'], '/') . '/' . ltrim($ruta, '/');

        $response = $this->http()
            ->withHeaders(['X-API-KEY' => $config['api_key']])
            ->get($url);

        if ($response->failed()) {
            $status = $response->status();
            $transitorio = $response->serverError() || in_array($status, [429, 408], true);

            if ($status === 401 || $status === 403) {
                throw new IntegrationException(
                    'API key del ERP Prueba rechazada (HTTP ' . $status . '). Revisa ERP_PRUEBA_API_KEY en el .env del backend.',
                    false
                );
            }

            throw new IntegrationException(
                "El ERP Prueba respondió HTTP {$status} en {$ruta}.",
                $transitorio
            );
        }

        $json = $response->json();

        if (!is_array($json) || empty($json['success'])) {
            throw new IntegrationException(
                "Respuesta inesperada del ERP Prueba en {$ruta} (falta success=true).",
                false
            );
        }

        return array_values((array) ($json['data'] ?? []));
    }

    /**
     * URL base + API key: del backend (.env vía config) siempre que el panel
     * no haya guardado un valor puntual (RN-04: HTTPS obligatorio en prod).
     *
     * @return array{base_url: string, api_key: string}
     */
    private function resolverConfig(array $credenciales): array
    {
        $baseUrl = $credenciales['base_url'] ?? config('integrations.providers.erp_prueba.base_url');
        $apiKey = $credenciales['api_key'] ?? config('integrations.providers.erp_prueba.api_key');

        if (empty($baseUrl)) {
            throw new IntegrationException(
                'Falta la URL del ERP Prueba: define ERP_PRUEBA_URL en el .env del backend.',
                false
            );
        }

        if (empty($apiKey)) {
            throw new IntegrationException(
                'Falta la API key del ERP Prueba: define ERP_PRUEBA_API_KEY en el .env del backend.',
                false
            );
        }

        if (app()->environment('production') && !str_starts_with((string) $baseUrl, 'https://')) {
            throw new IntegrationException('La URL base del ERP Prueba debe usar HTTPS en producción.', false);
        }

        return [
            'base_url' => (string) $baseUrl,
            'api_key' => (string) $apiKey,
        ];
    }

    private function ruta(string $clave): string
    {
        $default = $clave === 'productos' ? '/api/productsERP' : '/api/inventarioERP';

        return (string) config("integrations.providers.erp_prueba.rutas.{$clave}", $default);
    }

    /**
     * El ERP devuelve todo en una sola respuesta; se pagina localmente con
     * batch_size (página fuera de rango → items vacíos corta el loop del sync).
     *
     * @param array<int, array> $items
     * @return array{items: array<int, array>, total: int, next_desde: null}
     */
    private function paginar(array $items, int $pagina): array
    {
        $perPage = (int) config('integrations.sync.batch_size', 100);

        return [
            'items' => array_slice($items, max(0, $pagina - 1) * $perPage, $perPage),
            'total' => count($items),
            'next_desde' => null,
        ];
    }
}

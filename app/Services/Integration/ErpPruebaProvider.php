<?php

namespace App\Services\Integration;

use App\Services\Integration\Normalizers\InventoryNormalizer;
use App\Services\Integration\Normalizers\ProductNormalizer;
use App\Services\Integration\Normalizers\OrderNormalizer;

use App\Services\Integration\FederationAuthException;
/**
 * ERP de prueba externo (p. ej. C:\Proyectos\PruebaAPI\ERP en
 * http://127.0.0.1:8001). La URL base y la API key se registran desde el
 * panel (credenciales cifradas en la tabla `integrations`); las rutas son
 * fijas del contrato y viven en config/integrations.php.
 *
 * Contrato HTTP (middleware `api.key` del ERP):
 *   GET  {base}{ruta.productos}     header X-API-KEY → {success, data:[{id, nombre, sku, stock, descripcion, categoria, marca, precios:[{tipo,precio}]}]}
 *   GET  {base}{ruta.inventario}    header X-API-KEY → {success, data:[{product_id, sku, stock}]}
 *   GET  {base}{ruta.compras}       header X-API-KEY → {success, data:[{numero, fecha, proveedor, lineas:[{sku,cantidad,costo}]}]}
 *   POST {base}{ruta.ventas}        header X-API-KEY → {success, data:{id_externo}} (id determinístico por número de pedido)
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

    public function obtenerCompras(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        // El ERP de prueba no expone timestamps de compra: entrega todo y la
        // idempotencia (documento externo ya aplicado) omite lo reprocesado.
        return $this->paginar($this->get($this->ruta('compras'), $credenciales), $pagina);
    }

    public function normalizarCompra(array $registro): array
    {
        $externalId = trim((string) ($registro['numero'] ?? ($registro['id'] ?? '')));

        if ($externalId === '') {
            throw new IntegrationException('Compra externa sin número de documento (numero).', false);
        }

        $lineas = [];
        foreach ((array) ($registro['lineas'] ?? []) as $linea) {
            $sku = trim((string) ($linea['sku'] ?? ''));
            $cantidad = (int) ($linea['cantidad'] ?? 0);

            if ($sku === '' || $cantidad <= 0) {
                throw new IntegrationException(
                    "Compra {$externalId}: línea con SKU o cantidad inválida.",
                    false
                );
            }

            $lineas[] = [
                'sku' => $sku,
                'cantidad' => $cantidad,
                'costo' => round((float) ($linea['costo'] ?? 0), 4),
            ];
        }

        if ($lineas === []) {
            throw new IntegrationException("Compra {$externalId}: sin líneas.", false);
        }

        return [
            'external_id' => $externalId,
            'fecha' => $registro['fecha'] ?? null,
            'proveedor' => $registro['proveedor'] ?? null,
            'lineas' => $lineas,
        ];
    }

    public function crearVenta(array $credenciales, array $documento): array
    {
        $config = $this->resolverConfig($credenciales);
        $ruta = $this->ruta('ventas');

        $response = $this->http()
            ->withHeaders(['X-API-KEY' => $config['api_key']])
            ->post(rtrim($config['base_url'], '/') . '/' . ltrim($ruta, '/'), $documento);

        $this->lanzarSiFalla($response, $ruta);

        $json = $response->json();

        if (!is_array($json) || empty($json['success'])) {
            throw new IntegrationException(
                "Respuesta inesperada del ERP Prueba en {$ruta} (falta success=true).",
                false
            );
        }

        $externalId = (string) ($json['data']['id_externo'] ?? '');

        if ($externalId === '') {
            $numeroVenta = (string) ($documento['numero'] ?? '');
            throw new IntegrationException(
                "El ERP Prueba no devolvió id_externo para la venta {$numeroVenta}.",
                false
            );
        }

        return [
            'external_id' => $externalId,
            'estado' => (string) ($json['data']['estado'] ?? 'aceptado'),
        ];
    }

    public function login(array $credenciales, array $datosUsuario): array
    {
        $config = $this->resolverConfig($credenciales);
        $ruta = $this->ruta('login');
        $identificador = (string) ($datosUsuario['email'] ?? '');
        $clave = (string) ($datosUsuario['password'] ?? '');

        if ($identificador === '' || $clave === '') {
            throw FederationAuthException::invalidas('Faltan credenciales de usuario para el login federado.');
        }

        try {
            $response = $this->http()
                ->withHeaders(['X-API-KEY' => $config['api_key']])
                ->post(rtrim($config['base_url'], '/') . '/' . ltrim($ruta, '/'), [
                    'nombre' => $identificador,
                    'contraseña' => $clave,
                ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            throw FederationAuthException::indisponible(
                'El ERP Prueba no responde para validar el inicio de sesión: ' . $e->getMessage()
            );
        }

        // 401/403 = el externo rechazó las credenciales del usuario: nunca
        // se aceptan localmente (RN-14 desviada, evita bypass).
        if ($response->status() === 401 || $response->status() === 403) {
            $mensaje = (string) ($response->json('message') ?? 'Credenciales inválidas en el ERP Prueba.');
            throw FederationAuthException::invalidas($mensaje);
        }

        $this->lanzarSiFalla($response, $ruta);

        $json = $response->json();

        if (!is_array($json) || empty($json['success'])) {
            $mensaje = (string) ($json['message'] ?? 'Credenciales inválidas en el ERP Prueba.');
            throw FederationAuthException::invalidas($mensaje);
        }

        return [
            'token' => (string) ($json['data']['token'] ?? ''),
            'user' => [
                'nombre' => (string) ($json['data']['nombre'] ?? ''),
                'email' => (string) ($json['data']['email'] ?? ''),
                'estado' => (string) ($json['data']['estado'] ?? 'activo'),
            ],
        ];
    }

    public function obtenerPedidos(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        return $this->paginar($this->get($this->ruta('pedidos'), $credenciales), $pagina);
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

    public function normalizarPedidos(array $registro): array
    {
        // El ERP usa `product_id`; el normalizador canónico espera `producto_id`.
        if (!isset($registro['id']) && isset($registro['numero'])) {
            $registro['id'] = $registro['numero'];
        }

        return app(OrderNormalizer::class)->normalizar($registro);
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

        $this->lanzarSiFalla($response, $ruta);

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
     * Clasificación de fallos HTTP: 401/403 permanentes (credenciales);
     * 5xx/429/408 transitorios (backoff); el resto permanente.
     */
    private function lanzarSiFalla(\Illuminate\Http\Client\Response $response, string $ruta): void
    {
        if (!$response->failed()) {
            return;
        }

        $status = $response->status();
        $transitorio = $response->serverError() || in_array($status, [429, 408], true);

        if ($status === 401 || $status === 403) {
            throw new IntegrationException(
                'API key del ERP Prueba rechazada (HTTP ' . $status . '). Revisa la API key en Admin → Integraciones.',
                false
            );
        }

        throw new IntegrationException(
            "El ERP Prueba respondió HTTP {$status} en {$ruta}.",
            $transitorio
        );
    }

    /**
     * URL base + API key: solo desde las credenciales guardadas en la
     * integración (RN-01/RN-04: cifradas en BD; HTTPS obligatorio en prod).
     *
     * @return array{base_url: string, api_key: string}
     */
    private function resolverConfig(array $credenciales): array
    {
        $this->requireCredenciales($credenciales, ['base_url', 'api_key']);

        return [
            'base_url' => rtrim((string) $credenciales['base_url'], '/'),
            'api_key' => (string) $credenciales['api_key'],
        ];
    }

    private function ruta(string $clave): string
    {
        $defaults = [
            'productos' => '/api/productsERP',
            'inventario' => '/api/inventarioERP',
            'compras' => '/api/comprasERP',
            'ventas' => '/api/ventasERP',
        ];

        return (string) config(
            "integrations.providers.erp_prueba.rutas.{$clave}",
            $defaults[$clave] ?? '/'
        );
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

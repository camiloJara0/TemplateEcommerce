<?php

namespace App\Services\Integration;

use App\Services\Integration\Normalizers\InventoryNormalizer;
use App\Services\Integration\Normalizers\ProductNormalizer;

class ErpDemoProvider extends AbstractIntegrationProvider
{
    public const FIXTURE_PRODUCTOS = 'fixtures/erp_demo/productos.json';
    public const FIXTURE_INVENTARIO = 'fixtures/erp_demo/inventario.json';

    public function name(): string
    {
        return 'erp_demo';
    }

    public function probarConexion(array $credenciales): array
    {
        $this->requireCredenciales($credenciales, ['usuario', 'clave']);
        $this->leerFixture(self::FIXTURE_PRODUCTOS);

        return [
            'success' => true,
            'message' => 'Conexión exitosa con ERP Demo (fixtures locales).',
        ];
    }

    public function obtenerProductos(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        $this->requireCredenciales($credenciales, ['usuario', 'clave']);

        return $this->paginarFixture($this->leerFixture(self::FIXTURE_PRODUCTOS), $desde, $pagina);
    }

    public function obtenerInventario(array $credenciales, ?string $desde = null, int $pagina = 1): array
    {
        $this->requireCredenciales($credenciales, ['usuario', 'clave']);

        return $this->paginarFixture($this->leerFixture(self::FIXTURE_INVENTARIO), $desde, $pagina);
    }

    public function normalizarProducto(array $registro): array
    {
        return app(ProductNormalizer::class)->normalizar($registro);
    }

    public function normalizarInventario(array $registro): array
    {
        return app(InventoryNormalizer::class)->normalizar($registro);
    }

    private function leerFixture(string $ruta): array
    {
        $path = resource_path($ruta);

        if (!is_file($path)) {
            throw new IntegrationException("Fixture no encontrada: {$ruta}", false);
        }

        $datos = json_decode((string) file_get_contents($path), true);

        if (!is_array($datos)) {
            throw new IntegrationException("Fixture inválida: {$ruta}", false);
        }

        return $datos;
    }

    private function paginarFixture(array $items, ?string $desde, int $pagina): array
    {
        if ($desde) {
            $items = array_values(array_filter(
                $items,
                fn (array $item) => !empty($item['actualizado_en']) && $item['actualizado_en'] > $desde
            ));
        }

        $total = count($items);
        $nextDesde = null;

        foreach ($items as $item) {
            $fecha = $item['actualizado_en'] ?? null;
            if ($fecha !== null && ($nextDesde === null || $fecha > $nextDesde)) {
                $nextDesde = $fecha;
            }
        }

        $perPage = (int) config('integrations.sync.batch_size', 100);
        $items = array_slice($items, max(0, ($pagina - 1)) * $perPage, $perPage);

        return [
            'items' => $items,
            'total' => $total,
            'next_desde' => $nextDesde,
        ];
    }
}

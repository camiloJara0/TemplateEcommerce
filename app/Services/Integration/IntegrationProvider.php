<?php

namespace App\Services\Integration;

interface IntegrationProvider
{
    public function name(): string;

    /**
     * Probar credenciales contra el sistema externo.
     *
     * @param array<string, mixed> $credenciales
     *
     * @return array{success: bool, message: string}
     */
    public function probarConexion(array $credenciales): array;

    /**
     * Página de productos con soporte de incremental (`desde` = timestamp).
     *
     * @return array{items: array<int, array>, total: int, next_desde: ?string}
     */
    public function obtenerProductos(array $credenciales, ?string $desde = null, int $pagina = 1): array;

    /**
     * Página de movimientos/estados de inventario incremental.
     *
     * @return array{items: array<int, array>, total: int, next_desde: ?string}
     */
    public function obtenerInventario(array $credenciales, ?string $desde = null, int $pagina = 1): array;

    /**
     * Traduce un registro crudo del proveedor a la estructura canónica
     * de producto (ver docs/06 Anexo A).
     */
    public function normalizarProducto(array $registro): array;

    /**
     * Traduce un registro crudo de inventario a la estructura canónica.
     */
    public function normalizarInventario(array $registro): array;

    /**
     * Página de compras/entradas de mercancía incremental desde el externo.
     *
     * @return array{items: array<int, array>, total: int, next_desde: ?string}
     */
    public function obtenerCompras(array $credenciales, ?string $desde = null, int $pagina = 1): array;

    /**
     * Traduce un registro crudo de compra a la estructura canónica
     * {external_id, fecha, proveedor, lineas: [{sku, cantidad, costo}]}.
     */
    public function normalizarCompra(array $registro): array;

    /**
     * Envía la venta de la tienda al sistema externo (HU-045).
     * Lanza IntegrationException ante cualquier fallo (el llamador decide
     * reintento).
     *
     * @param array<string, mixed> $documento Venta canónica normalizada
     *
     * @return array{external_id: string, estado: string}
     */
    public function crearVenta(array $credenciales, array $documento): array;

    /**
     * Clasifica un error para backoff/alertas.
     *
     * @return array{transitorio: bool, mensaje: string}
     */
    public function describirError(\Throwable $e): array;

    /**
     * Login federado (solo si el proveedor declara supports_login).
     *
     * @return array{token: string, user: array}
     */
    public function login(array $credenciales, array $datosUsuario): array;
}

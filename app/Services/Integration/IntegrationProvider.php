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

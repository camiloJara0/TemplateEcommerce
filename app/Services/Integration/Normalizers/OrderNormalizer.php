<?php

namespace App\Services\Integration\Normalizers;

use App\Services\Integration\IntegrationException;

/**
 * Mapea un pedido de la tienda → documento de venta canónico para el
 * sistema externo (REQ-06 salida: moneda, impuestos y líneas normalizadas).
 */
class OrderNormalizer
{
    /**
     * @param array<string, mixed> $pedido
     *
     * @return array{numero: string, fecha: ?string, moneda: string, subtotal: float, impuestos: float, descuento: float, envio: float, total: float, cliente: array, lineas: array<int, array{sku: string, cantidad: int, precio_unitario: float, nombre: string}>}
     */
    public function normalizar(array $pedido): array
    {
        $numero = isset($pedido['numero']) ? trim((string) $pedido['numero']) : '';

        if ($numero === '') {
            throw new IntegrationException('Documento de venta inválido: falta el número de pedido.', false);
        }

        $lineas = [];
        foreach ((array) ($pedido['items'] ?? []) as $item) {
            $sku = trim((string) ($item['sku'] ?? ''));
            $cantidad = (int) ($item['cantidad'] ?? 0);

            if ($sku === '' || $cantidad <= 0) {
                throw new IntegrationException(
                    "Documento de venta inválido (pedido {$numero}): línea sin SKU o cantidad inválida.",
                    false
                );
            }

            $lineas[] = [
                'sku' => $sku,
                'cantidad' => $cantidad,
                'precio_unitario' => round((float) ($item['precio_unitario'] ?? 0), 2),
                'nombre' => (string) ($item['nombre'] ?? $sku),
            ];
        }

        if ($lineas === []) {
            throw new IntegrationException("Documento de venta inválido (pedido {$numero}): sin líneas.", false);
        }

        return [
            'numero' => $numero,
            'fecha' => $pedido['fecha'] ?? null,
            'moneda' => (string) ($pedido['moneda'] ?? 'COP'),
            'subtotal' => round((float) ($pedido['subtotal'] ?? 0), 2),
            'impuestos' => round((float) ($pedido['impuestos'] ?? 0), 2),
            'descuento' => round((float) ($pedido['descuento'] ?? 0), 2),
            'envio' => round((float) ($pedido['envio'] ?? 0), 2),
            'total' => round((float) ($pedido['total'] ?? 0), 2),
            'cliente' => (array) ($pedido['cliente'] ?? []),
            'lineas' => $lineas,
        ];
    }
}

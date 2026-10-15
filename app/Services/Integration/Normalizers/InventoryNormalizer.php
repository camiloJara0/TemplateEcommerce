<?php

namespace App\Services\Integration\Normalizers;

use App\Services\Integration\IntegrationException;

class InventoryNormalizer
{
    /**
     * @return array{external_id: ?string, sku: ?string, stock: int, updated_at: ?string}
     */
    public function normalizar(array $registro): array
    {
        $externalId = isset($registro['producto_id']) ? (string) $registro['producto_id']
            : (isset($registro['id']) ? (string) $registro['id'] : null);
        $sku = isset($registro['sku']) ? (string) $registro['sku'] : null;

        if (($externalId === null || $externalId === '') && ($sku === null || $sku === '')) {
            throw new IntegrationException(
                "Registro de inventario inválido: faltan 'producto_id' o 'sku'.",
                false
            );
        }

        if (!array_key_exists('stock', $registro) && !array_key_exists('cantidad', $registro)) {
            throw new IntegrationException(
                "Registro de inventario inválido: falta 'stock' (cantidad absoluta).",
                false
            );
        }

        return [
            'external_id' => $externalId,
            'sku' => $sku,
            'stock' => max(0, (int) ($registro['stock'] ?? $registro['cantidad'])),
            'updated_at' => $registro['actualizado_en'] ?? $registro['updated_at'] ?? null,
        ];
    }
}

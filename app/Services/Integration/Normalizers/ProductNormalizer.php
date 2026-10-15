<?php

namespace App\Services\Integration\Normalizers;

use App\Services\Integration\IntegrationException;
use Illuminate\Support\Str;

class ProductNormalizer
{
    /**
     * @return array{external_id: string, sku: string, name: string, slug: string,
     *   description: ?string, price: float, price_discount: ?float, weight: ?float,
     *   stock: int, category: ?string, brand: ?string, images: array<int, string>,
     *   estado: string, updated_at: ?string, variantes: array<int, array>}
     */
    public function normalizar(array $registro): array
    {
        $externalId = (string) ($registro['id'] ?? $registro['external_id'] ?? '');
        $sku = (string) ($registro['sku'] ?? '');
        $nombre = (string) ($registro['nombre'] ?? $registro['name'] ?? '');

        if ($externalId === '' || $sku === '' || $nombre === '') {
            throw new IntegrationException(
                "Registro de producto inválido: faltan 'id', 'sku' o 'nombre'.",
                false
            );
        }

        $precio = $registro['precio'] ?? $registro['price'] ?? null;
        $precioLista = $registro['precio_lista'] ?? $registro['price_discount'] ?? null;

        $variantes = [];
        foreach ((array) ($registro['variantes'] ?? $registro['variants'] ?? []) as $variante) {
            $skuVariante = (string) ($variante['sku'] ?? '');
            if ($skuVariante === '') {
                continue;
            }

            $atributos = [];
            foreach ((array) ($variante['atributos'] ?? $variante['attributes'] ?? []) as $clave => $valor) {
                $atributos[] = ['nombre' => (string) $clave, 'valor' => (string) $valor];
            }

            $variantes[] = [
                'external_id' => (string) ($variante['id'] ?? $skuVariante),
                'sku' => $skuVariante,
                'price' => (float) ($variante['precio'] ?? $variante['price'] ?? $precio ?? 0),
                'price_discount' => isset($variante['precio_lista'])
                    ? (float) $variante['precio_lista']
                    : (isset($variante['price_discount']) ? (float) $variante['price_discount'] : null),
                'stock' => (int) ($variante['stock'] ?? 0),
                'atributos' => $atributos,
            ];
        }

        $estadoExterno = strtolower((string) ($registro['estado'] ?? 'activo'));

        return [
            'external_id' => $externalId,
            'sku' => $sku,
            'name' => $nombre,
            'slug' => Str::slug($nombre) . '-' . Str::lower(Str::substr($sku, 0, 24)),
            'description' => $registro['descripcion'] ?? $registro['description'] ?? null,
            'price' => round((float) ($precio ?? 0), 2),
            'price_discount' => $precioLista !== null && (float) $precioLista > 0 ? round((float) $precioLista, 2) : null,
            'weight' => isset($registro['peso_kg']) ? round((float) $registro['peso_kg'], 3) : (isset($registro['weight']) ? round((float) $registro['weight'], 3) : null),
            'stock' => (int) ($registro['stock'] ?? 0),
            'category' => $registro['categoria'] ?? $registro['category'] ?? null,
            'brand' => $registro['marca'] ?? $registro['brand'] ?? null,
            'images' => array_values(array_filter(array_map(
                'strval',
                (array) ($registro['imagenes'] ?? $registro['images'] ?? [])
            ))),
            'estado' => in_array($estadoExterno, ['inactivo', 'disabled', 'archived'], true) ? 'inactivo' : 'activo',
            'updated_at' => $registro['actualizado_en'] ?? $registro['updated_at'] ?? null,
            'variantes' => $variantes,
        ];
    }
}

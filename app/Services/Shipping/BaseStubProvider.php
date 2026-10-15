<?php

namespace App\Services\Shipping;

use App\Models\Shipment;
use Illuminate\Support\Str;

abstract class BaseStubProvider extends AbstractShippingProvider
{
    public function cotizar(array $datos): array
    {
        $pesoReal = max((float) ($datos['weight'] ?? 0), 0);
        $pesoVolumetrico = $this->pesoVolumetrico($datos);
        $pesoCobrable = max($pesoReal, $pesoVolumetrico, 0.1);

        $zona = $this->resolverZona($datos['ciudad'] ?? '', $datos['pais'] ?? 'Colombia');
        $multiplicadorZona = (float) config("shipping.zones.{$zona}.multiplier", 1.0);
        $diasZona = (int) config("shipping.zones.{$zona}.estimated_days", 3);
        $multiplicadorCarrier = (float) config('shipping.rate_multipliers.' . $this->name(), 1.0);

        $base = (float) config('shipping.base_cost', 10000);
        $porKg = (float) config('shipping.cost_per_kg', 3000);

        $costo = ($base + ($pesoCobrable * $porKg)) * $multiplicadorZona * $multiplicadorCarrier;

        return [
            'carrier' => $this->name(),
            'cost' => round($costo, 2),
            'estimated_days' => $this->estimatedDays($diasZona),
            'zone' => $zona,
            'chargeable_weight' => round($pesoCobrable, 2),
            'breakdown' => [
                'base' => $base,
                'real_weight' => round($pesoReal, 2),
                'volumetric_weight' => round($pesoVolumetrico, 2),
                'cost_per_kg' => $porKg,
                'zone_multiplier' => $multiplicadorZona,
                'carrier_multiplier' => $multiplicadorCarrier,
            ],
        ];
    }

    public function crearEnvio(Shipment $shipment): array
    {
        $tracking = strtoupper(substr($this->name(), 0, 4)) . '-' . Str::upper(Str::random(10));

        $shipment->update([
            'tracking_number' => $tracking,
            'status' => 'en_preparacion',
            'estimated_delivery' => now()->addDays($this->estimatedDays())->toDateString(),
            'payload' => array_merge($shipment->payload ?? [], ['created' => now()->toDateTimeString()]),
        ]);

        return [
            'tracking_number' => $tracking,
            'status' => 'en_preparacion',
            'estimated_delivery' => $shipment->estimated_delivery,
        ];
    }

    public function consultarTracking(string $trackingNumber): array
    {
        $shipment = Shipment::where('tracking_number', $trackingNumber)->with('events')->first();

        if (!$shipment) {
            return [
                'tracking_number' => $trackingNumber,
                'status' => null,
                'updated_at' => now()->toDateTimeString(),
            ];
        }

        return [
            'tracking_number' => $shipment->tracking_number,
            'status' => $shipment->status,
            'estimated_delivery' => $shipment->estimated_delivery?->toDateString(),
            'delivered_at' => $shipment->delivered_at?->toDateTimeString(),
            'updated_at' => $shipment->updated_at?->toDateTimeString(),
        ];
    }

    public function cancelarEnvio(Shipment $shipment): array
    {
        $shipment->update(['status' => 'cancelado']);

        return ['cancelled' => true, 'status' => 'cancelado'];
    }

    protected function pesoVolumetrico(array $datos): float
    {
        $largo = (float) ($datos['largo'] ?? 0);
        $ancho = (float) ($datos['ancho'] ?? 0);
        $alto = (float) ($datos['alto'] ?? 0);

        if ($largo <= 0 || $ancho <= 0 || $alto <= 0) {
            return 0.0;
        }

        $divisor = (float) config('shipping.volumetric_divisor', 5000);

        return ($largo * $ancho * $alto) / $divisor;
    }

    protected function resolverZona(string $ciudad, string $pais): string
    {
        $paisNormalizado = mb_strtolower(trim($pais));
        $paisesLocales = array_map('mb_strtolower', config('shipping.local_countries', ['colombia']));

        if (!in_array($paisNormalizado, $paisesLocales, true)) {
            return 'internacional';
        }

        $ciudadNormalizada = mb_strtolower(trim($ciudad));
        $ciudadesLocales = array_map('mb_strtolower', config('shipping.local_cities', []));

        if ($ciudadNormalizada !== '' && in_array($ciudadNormalizada, $ciudadesLocales, true)) {
            return 'local';
        }

        return 'nacional';
    }

    protected function estimatedDays(?int $diasBase = null): int
    {
        return $diasBase ?? (3 + random_int(1, 5));
    }
}

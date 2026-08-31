<?php

namespace App\Services\Shipping;

use App\Models\Shipment;
use Illuminate\Support\Str;

abstract class BaseStubProvider extends AbstractShippingProvider
{
    public function cotizar(array $datos): array
    {
        $peso = (float) ($datos['weight'] ?? 0);
        $base = (float) config('shipping.base_cost', 10000);
        $porKg = (float) config('shipping.cost_per_kg', 3000);

        $costo = $base + ($peso * $porKg);

        return [
            'carrier' => $this->name(),
            'cost' => round($costo, 2),
            'estimated_days' => $this->estimatedDays(),
        ];
    }

    public function crearEnvio(Shipment $shipment): array
    {
        $tracking = strtoupper(substr($this->name(), 0, 4)) . '-' . Str::upper(Str::random(10));

        $shipment->update([
            'tracking_number' => $tracking,
            'status' => 'en_preparacion',
            'estimated_delivery' => now()->addDays($this->estimatedDays())->toDateString(),
            'payload' => ['created' => now()->toDateTimeString()],
        ]);

        return [
            'tracking_number' => $tracking,
            'status' => 'en_preparacion',
            'estimated_delivery' => $shipment->estimated_delivery,
        ];
    }

    public function consultarTracking(string $trackingNumber): array
    {
        return [
            'tracking_number' => $trackingNumber,
            'status' => 'en_transito',
            'updated_at' => now()->toDateTimeString(),
        ];
    }

    public function cancelarEnvio(Shipment $shipment): array
    {
        $shipment->update(['status' => 'cancelado']);

        return ['cancelled' => true, 'status' => 'cancelado'];
    }

    protected function estimatedDays(): int
    {
        return 3 + random_int(1, 5);
    }
}
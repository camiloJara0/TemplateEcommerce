<?php

namespace App\Services\Shipping;

use App\Models\Shipment;

interface ShippingProvider
{
    public function name(): string;

    public function cotizar(array $datos): array;

    public function crearEnvio(Shipment $shipment): array;

    public function consultarTracking(string $trackingNumber): array;

    public function cancelarEnvio(Shipment $shipment): array;
}
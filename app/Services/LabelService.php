<?php

namespace App\Services;

use App\Models\Shipment;
use App\Support\Code128;
use Barryvdh\DomPDF\Facade\Pdf;

class LabelService
{
    public function etiqueta(Shipment $shipment)
    {
        $shipment->load(['order:id,numero']);

        if (!$shipment->tracking_number) {
            throw new \DomainException('El envío aún no tiene número de guía');
        }

        return Pdf::loadView('pdf.etiqueta', [
            'shipment' => $shipment,
            'tienda' => app(InvoiceService::class)->datosTienda(),
            'barcode' => Code128::bars($shipment->tracking_number),
        ])
            ->setPaper([0, 0, 419, 284])
            ->download('etiqueta-' . $shipment->tracking_number . '.pdf');
    }
}

<?php

namespace App\Services;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    public function emitir(Order $order): Order
    {
        if ($order->numero_factura) {
            return $order;
        }

        if ($order->payment_status !== PaymentStatusEnum::APROBADO->value) {
            throw new \DomainException('La factura se emite únicamente para pedidos pagados');
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($order) {
            $anio = now()->year;
            $ultima = Order::where('numero_factura', 'like', "FAC-{$anio}-%")
                ->lockForUpdate()
                ->max('numero_factura');

            $correlativo = 1;

            if ($ultima) {
                $partes = explode('-', $ultima);
                $correlativo = (int) end($partes) + 1;
            }

            $direccion = $order->address;

            $order->update([
                'numero_factura' => sprintf('FAC-%d-%06d', $anio, $correlativo),
                'fecha_emision' => $order->fecha_emision ?? now(),
                'paid_at' => $order->paid_at ?? now(),
                'billing_nombre' => $order->billing_nombre ?? $order->user?->nombre,
                'billing_direccion' => $order->billing_direccion ?? ($direccion
                    ? trim($direccion->direccion . ', ' . $direccion->ciudad)
                    : null),
            ]);

            return $order->fresh();
        });
    }

    public function pdf(Order $order)
    {
        $order = $this->emitir($order);
        $order->load(['items', 'user:id,nombre,email', 'address', 'payments']);

        return Pdf::loadView('pdf.factura', [
            'order' => $order,
            'tienda' => $this->datosTienda(),
        ])
            ->setPaper('letter')
            ->download('factura-' . $order->numero_factura . '.pdf');
    }

    public function datosTienda(): array
    {
        return [
            'nombre' => Setting::obtener('store_name', config('app.name')),
            'tagline' => Setting::obtener('store_tagline'),
            'logo' => Setting::obtener('logo'),
            'email' => Setting::obtener('support_email'),
            'telefono' => Setting::obtener('support_phone'),
            'direccion' => Setting::obtener('store_address'),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'numero_factura' => $this->numero_factura,
            'fecha_emision' => $this->fecha_emision,
            'billing_nit' => $this->billing_nit,
            'billing_razon_social' => $this->billing_razon_social,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'shipping_status' => $this->shipping_status,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shipping_cost' => (float) $this->shipping_cost,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'currency' => $this->currency,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'address' => $this->whenLoaded('address', fn () => $this->address ? [
                'id' => $this->address->id,
                'label' => $this->address->label,
                'pais' => $this->address->pais,
                'ciudad' => $this->address->ciudad,
                'direccion' => $this->address->direccion,
                'codigo_postal' => $this->address->codigo_postal,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'sku' => $item->sku,
                'price' => (float) $item->price,
                'quantity' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
            ])),
            'status_histories' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($h) => [
                'status' => $h->status,
                'comment' => $h->comment,
                'created_at' => $h->created_at,
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($p) => [
                'id' => $p->id,
                'provider' => $p->provider,
                'status' => $p->status,
                'amount' => (float) $p->amount,
                'created_at' => $p->created_at,
            ])),
            'shipment' => $this->whenLoaded('shipment', fn () => $this->shipment ? [
                'id' => $this->shipment->id,
                'carrier' => $this->shipment->carrier,
                'tracking_number' => $this->shipment->tracking_number,
                'status' => $this->shipment->status,
                'estimated_delivery' => $this->shipment->estimated_delivery?->toDateString(),
                'delivered_at' => $this->shipment->delivered_at,
            ] : null),
        ];
    }
}
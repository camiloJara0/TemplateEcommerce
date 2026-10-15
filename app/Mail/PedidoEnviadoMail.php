<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PedidoEnviadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public ?Shipment $shipment;

    public function __construct(Order $order, ?Shipment $shipment = null)
    {
        $this->order = $order;
        $this->shipment = $shipment;
    }

    public function build()
    {
        return $this->subject('Tu pedido ' . $this->order->numero . ' está en camino')
            ->view('emails.pedido-enviado')
            ->with([
                'order' => $this->order,
                'shipment' => $this->shipment,
            ]);
    }
}

<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PagoReembolsadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public float $monto;

    public function __construct(Order $order, float $monto)
    {
        $this->order = $order;
        $this->monto = $monto;
    }

    public function build()
    {
        return $this->subject('Reembolso procesado — Pedido ' . $this->order->numero)
            ->view('emails.pago-reembolsado')
            ->with([
                'order' => $this->order,
                'monto' => $this->monto,
            ]);
    }
}

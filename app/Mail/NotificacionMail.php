<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificacionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $asunto;
    public $cuerpo;
    public $detalles;

    public function __construct(string $asunto, string $cuerpo, array $detalles = [])
    {
        $this->asunto = $asunto;
        $this->cuerpo = $cuerpo;
        $this->detalles = $detalles;
    }

    public function build()
    {
        return $this->subject($this->asunto)
                    ->view('emails.notificacion')
                    ->with([
                        'asunto' => $this->asunto,
                        'cuerpo' => $this->cuerpo,
                        'detalles' => $this->detalles,
                    ]);
    }
}
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReplyContactMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mensaje;
    public $contact_message;

    public function __construct(string $mensaje, $contact_message)
    {
        $this->mensaje = $mensaje;
        $this->contact_message = $contact_message;
    }

    public function build()
    {
        return $this->subject('Respuesta a su mensaje de contacto')
                    ->view('emails.reply_contact')
                    ->with([
                        'mensaje' => $this->mensaje,
                        'contact_message' => $this->contact_message,
                    ]);
    }
}

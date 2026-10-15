<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactoAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public ContactMessage $mensaje;

    public function __construct(ContactMessage $mensaje)
    {
        $this->mensaje = $mensaje;
    }

    public function build()
    {
        return $this->subject('Nuevo mensaje de contacto: ' . $this->mensaje->asunto)
            ->view('emails.contacto-admin')
            ->with(['mensaje' => $this->mensaje]);
    }
}

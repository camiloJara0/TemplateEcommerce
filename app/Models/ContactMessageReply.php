<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessageReply extends Model
{
    use HasFactory;

    protected $table = 'contact_messages_replies';

    protected $fillable = [
        'contact_message_id',
        'user_id',
        'respuesta',
        'correo_enviado',
        'fecha_envio',
    ];

    public function contactMessage()
    {
        return $this->belongsTo(ContactMessage::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

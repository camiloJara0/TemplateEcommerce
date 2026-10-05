<?php

namespace App\Http\Controllers;

use App\Models\ContactMessageReply;
use Illuminate\Http\Request;
use App\Models\ContactMessage;
use App\Mail\ReplyContactMail;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class ContactMessageReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_message_id' => 'required|exists:contact_messages,id',
            'respuesta' => 'required|string'
        ]);

        $contact_message = ContactMessage::where('id', $validated['contact_message_id'])->first();
        $user_id = auth()->user()->id;

        try {
            DB::beginTransaction();
            $contact_messages_replie = ContactMessageReply::create([
                'contact_message_id' => $validated['contact_message_id'],
                'user_id' => $user_id,
                'respuesta' => $validated['respuesta'],
            ]);

            // Enviar mensaje de respuesta al cliente
            Mail::to($contact_message->correo)->send(new ReplyContactMail($validated['respuesta'], $contact_message));
    
            $contact_messages_replie->update([
                'correo_enviado' => true,
                'fecha_envio' => now()
            ]);

            $contact_message->update([
                'estado' => 'Respondido',
            ]);

            DB::commit();
            return ApiResponse::success($contact_messages_replie, 'Mensaje creado', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Error al enviar el correo: ' . $e->getMessage(), 500);
        }

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ContactMessageReply  $contact_messages_replie
     * @return \Illuminate\Http\Response
     */
    public function show(ContactMessageReply $contact_messages_replie)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ContactMessageReply  $contact_messages_replie
     * @return \Illuminate\Http\Response
     */
    public function edit(ContactMessageReply $contact_messages_replie)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ContactMessageReply  $contact_messages_replie
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ContactMessageReply $contact_messages_replie)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ContactMessageReply  $contact_messages_replie
     * @return \Illuminate\Http\Response
     */
    public function destroy(ContactMessageReply $contact_messages_replie)
    {
        //
    }
}

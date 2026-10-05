<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use App\Support\ApiResponse;

class ContactMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $filtros = $request->only([
            'correo',
            'accion',
            'fecha',
        ]);

        $messages = ContactMessage::with('user')
            ->when($filtros['usuario'] ?? null, function ($query, $usuario) {
                $query->whereHas('usuario', function ($q) use ($usuario) {
                    $q->where('nombre', 'like', "%{$usuario}%");
                });
            })
            ->when($filtros['accion'] ?? null, function ($query, $accion) {
                $query->where('accion', 'like', "%{$accion}%");
            })
            ->when($filtros['fecha'] ?? null, function ($query, $fecha) {
                $query->whereDate('created_at', $fecha);
            })
            ->paginate($request->get('per_page', 12));

        return ApiResponse::success([
            'data' => $messages,
            'pagination' => [
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
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
            'nombre' => 'nullable|string|max:100',
            'correo' => 'required|email|max:255',
            'nit' => 'nullable|string|max:50',
            'asunto' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $contact_message = ContactMessage::create([
            'nombre' => $validated['nombre'] ?? null,
            'correo' => $validated['correo'],
            'nit' => $validated['nit'] ?? null,
            'asunto' => $validated['asunto'],
            'mensaje' => $validated['mensaje'],
            'user_id' => $validated['user_id'] ?? null,
        ]);

        return ApiResponse::success($contact_message, 'Mensaje creado', 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ContactMessage  $contact_message
     * @return \Illuminate\Http\Response
     */
    public function show(ContactMessage $contact_message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ContactMessage  $contact_message
     * @return \Illuminate\Http\Response
     */
    public function edit(ContactMessage $contact_message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ContactMessage  $contact_message
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ContactMessage $contact_message)
    {
        $contact_message = ContactMessage::where('id', $request->id)->first();
        if(!$contact_message) {
            return response()->json([
                'success' => false,
                'message' => 'no se encontro el mensaje'
            ]);
        }

        $validated = $request->validate([
            'estado' => 'required|string',
        ]);
        
        $contact_message->update([
            'estado' => $validated['estado'],
            'fecha_lectura' => now(),
        ]);

        return ApiResponse::success($contact_message, 'Estado de mensaje actualizado');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ContactMessage  $contact_message
     * @return \Illuminate\Http\Response
     */
    public function destroy(ContactMessage $contact_message)
    {
        //
    }
}

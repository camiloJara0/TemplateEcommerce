<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Support\ApiResponse;
use App\Mail\SubscribeMail;

class NewsletterSubscriberController extends Controller
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

        $messages = NewsletterSubscriber::with('user')
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
            'correo' => 'required|email|max:255|unique:newsletter_subscribers,correo',
            'user_id' => 'nullable|exists:users,id',
        ]);

        DB::beginTransaction();
        try {
            $user = [];

            if($request->user_id){
                $user = User::where('id', $validated['user_id'])->first();
            }

            // Enviar correo al cliente
            $token = Str::uuid();
            $verificationUrl = rtrim(env('FRONT_URL'), '/') . "/auth/login?token={$token}";

            $contact_message = NewsletterSubscriber::create([
                'correo' => $validated['correo'],
                'user_id' => $validated['user_id'] ?? null,
                'estado' => 'Inactivo',
                'token_aprobacion' => $token
            ]);

            Mail::to($validated['correo'])->send(new SubscribeMail($validated['correo'], $user, $verificationUrl));

            DB::commit();
            return ApiResponse::success($validated['correo'], 'Correo registrado', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Error al enviar el correo: ' . $e->getMessage(), 500);
        }


    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\NewsletterSubscriber  $newsletterSubscriber
     * @return \Illuminate\Http\Response
     */
    public function show(NewsletterSubscriber $newsletterSubscriber)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\NewsletterSubscriber  $newsletterSubscriber
     * @return \Illuminate\Http\Response
     */
    public function edit(NewsletterSubscriber $newsletterSubscriber)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\NewsletterSubscriber  $newsletterSubscriber
     * @return \Illuminate\Http\Response
     */
    public function confirmarSubscripcion(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $solicitud = NewsletterSubscriber::where('token_aprobacion', $validated['token'])->first();

            if(!$solicitud){
                throw new \Exception("Solicitud inválida");
            }

            $solicitud->update([
                'fecha_confirmacion' => now(),
                'estado' => 'Activo'
            ]);

            DB::commit();
            return ApiResponse::success($solicitud, 'Correo registrado', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Error en subscripción: ' . $e->getMessage(), 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\NewsletterSubscriber  $newsletterSubscriber
     * @return \Illuminate\Http\Response
     */
    public function destroy(NewsletterSubscriber $newsletterSubscriber)
    {
        //
    }
}

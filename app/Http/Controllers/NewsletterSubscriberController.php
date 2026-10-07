<?php

namespace App\Http\Controllers;

use App\Mail\SubscribeMail;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->only(['correo', 'estado', 'fecha', 'busqueda']);

        $suscriptores = NewsletterSubscriber::with('user:id,nombre,email')
            ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->where('estado', $v))
            ->when($filtros['fecha'] ?? null, fn ($q, $v) => $q->whereDate('created_at', $v))
            ->when($filtros['correo'] ?? $filtros['busqueda'] ?? null, function ($q, $v) {
                $q->where('correo', 'like', "%{$v}%");
            })
            ->when($filtros['nombre'] ?? null, fn ($q, $v) => $q->where('nombre', 'like', "%{$v}%"))
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 12));

        return ApiResponse::success([
            'items' => $suscriptores->items(),
            'pagination' => [
                'total' => $suscriptores->total(),
                'per_page' => $suscriptores->perPage(),
                'current_page' => $suscriptores->currentPage(),
                'last_page' => $suscriptores->lastPage(),
            ],
            'resumen' => [
                'activos' => NewsletterSubscriber::activos()->count(),
                'cancelados' => NewsletterSubscriber::where('estado', NewsletterSubscriber::ESTADO_CANCELADO)->count(),
                'pendientes' => NewsletterSubscriber::where('estado', NewsletterSubscriber::ESTADO_INACTIVO)->count(),
            ],
        ]);
    }

    /**
     * Alta de suscripción (doble confirmación por correo).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'correo' => 'required|email|max:255',
            'nombre' => 'nullable|string|max:120',
            'user_id' => 'nullable|integer|exists:users,id',
        ], [
            'correo.required' => 'El correo es obligatorio',
            'correo.email' => 'Ingresa un correo válido',
        ]);

        $correo = Str::lower(trim($validated['correo']));

        DB::beginTransaction();

        try {
            $user = !empty($validated['user_id'])
                ? User::find($validated['user_id'])
                : User::where('email', $correo)->first();

            $token = (string) Str::uuid();

            $suscriptor = NewsletterSubscriber::updateOrCreate(
                ['correo' => $correo],
                [
                    'nombre' => $validated['nombre'] ?? optional($user)->nombre,
                    'user_id' => $user?->id,
                    // Un suscriptor cancelado que vuelve a suscribirse requiere confirmar de nuevo
                    'estado' => NewsletterSubscriber::ESTADO_INACTIVO,
                    'token_aprobacion' => $token,
                    'fecha_baja' => null,
                    'fecha_confirmacion' => null,
                    'origen' => 'web',
                ]
            );

            $verificationUrl = rtrim((string) config('app.front_url'), '/') . "/auth/login?token={$token}";

            Mail::to($correo)->send(new SubscribeMail($correo, $user, $verificationUrl));

            DB::commit();

            return ApiResponse::success([
                'correo' => $correo,
                'estado' => $suscriptor->estado,
            ], 'Registro recibido. Confirma tu suscripción desde el correo', 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            return ApiResponse::error('No fue posible registrar la suscripción: ' . $e->getMessage(), 500);
        }
    }

    public function confirmarSubscripcion(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $suscriptor = NewsletterSubscriber::where('token_aprobacion', $validated['token'])->first();

        if (!$suscriptor) {
            return ApiResponse::error('Enlace de confirmación inválido o expirado', 404, 'INVALID_TOKEN');
        }

        $suscriptor->update([
            'fecha_confirmacion' => now(),
            'fecha_baja' => null,
            'estado' => NewsletterSubscriber::ESTADO_ACTIVO,
        ]);

        return ApiResponse::success([
            'correo' => $suscriptor->correo,
            'estado' => $suscriptor->estado,
        ], 'Suscripción confirmada correctamente');
    }

    /**
     * GET público: información mínima para la página de baja.
     */
    public function baja(string $token)
    {
        $suscriptor = NewsletterSubscriber::where('token_aprobacion', $token)->first();

        if (!$suscriptor) {
            return ApiResponse::error('Enlace de baja inválido o expirado', 404, 'INVALID_TOKEN');
        }

        return ApiResponse::success([
            'correo' => $suscriptor->correo,
            'estado' => $suscriptor->estado,
            'cancelado' => $suscriptor->cancelado(),
        ]);
    }

    /**
     * POST público: cancela la suscripción con el token del correo.
     */
    public function cancelar(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $suscriptor = NewsletterSubscriber::where('token_aprobacion', $validated['token'])->first();

        if (!$suscriptor) {
            return ApiResponse::error('Enlace de baja inválido o expirado', 404, 'INVALID_TOKEN');
        }

        if ($suscriptor->cancelado()) {
            return ApiResponse::success([
                'correo' => $suscriptor->correo,
                'estado' => $suscriptor->estado,
            ], 'Tu suscripción ya estaba cancelada');
        }

        $suscriptor->update([
            'estado' => NewsletterSubscriber::ESTADO_CANCELADO,
            'fecha_baja' => now(),
        ]);

        return ApiResponse::success([
            'correo' => $suscriptor->correo,
            'estado' => $suscriptor->estado,
        ], 'Suscripción cancelada. No volverás a recibir nuestros correos');
    }

    /**
     * Cambio de estado desde el panel (reactivar o pausar).
     */
    public function update(Request $request, NewsletterSubscriber $subscriber)
    {
        $validated = $request->validate([
            'estado' => 'required|in:Activo,Inactivo,Cancelado',
        ]);

        $subscriber->update([
            'estado' => $validated['estado'],
            'fecha_baja' => $validated['estado'] === NewsletterSubscriber::ESTADO_CANCELADO
                ? ($subscriber->fecha_baja ?? now())
                : null,
        ]);

        return ApiResponse::success($subscriber->fresh(), 'Estado del suscriptor actualizado');
    }

    public function destroy(NewsletterSubscriber $subscriber)
    {
        $subscriber->delete();

        return ApiResponse::success(null, 'Suscriptor eliminado');
    }
}

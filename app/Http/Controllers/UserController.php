<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Auditoria;
use App\Models\CodigoVerificacion;
use App\Mail\CodigoVerificacionMail;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function usuarios()
    {
        $usuarios = User::where('estado', 'activo')->select('id', 'nombre', 'email', 'foto')->get();

        return ApiResponse::success($usuarios);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'nombre' => $validated['nombre'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'idioma' => 'es',
                'estado' => 'activo',
            ]);

            Auditoria::registrar($user, 'crear', 'Se registró en la plataforma');

            app(\App\Services\NotificationService::class)->registro($user);

            DB::commit();

            return ApiResponse::success(
                $user->only(['id', 'nombre', 'email', 'zona_horaria', 'idioma', 'tema']),
                'Usuario registrado exitosamente',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Error al registrar usuario', 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return ApiResponse::error('El correo no está registrado', 403, 'USER_NOT_FOUND');
        }

        if ($user->estado === 'inactivo') {
            return ApiResponse::error('Usuario deshabilitado', 403, 'USER_INACTIVE');
        }

        if (!Hash::check($validated['password'], $user->password)) {
            return ApiResponse::error('Contraseña incorrecta', 403, 'INVALID_PASSWORD');
        }

        $tokenResult = $user->createToken('auth_token');
        $accessToken = $tokenResult->accessToken;
        $accessToken->expires_at = now()->addHours(16);
        $accessToken->save();
        $token = $tokenResult->plainTextToken;

        $user->ultimo_login = now();
        $user->save();

        Auditoria::registrar($user, 'login', 'Inició sesión');

        return ApiResponse::success([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 16 * 3600,
            'user' => $user->only(['id', 'nombre', 'email', 'foto', 'estado', 'idioma', 'rol']),
        ], 'Login exitoso');
    }

    public function enviarCodigo(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        CodigoVerificacion::create([
            'correo' => $validated['email'],
            'codigo' => $codigo,
            'expira_en' => now()->addMinutes(15),
        ]);

        Mail::to($validated['email'])->send(new CodigoVerificacionMail($validated['email'], $codigo));

        return ApiResponse::success(null, 'Código de verificación enviado al correo');
    }

    public function verificarCodigoCambio(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'codigo' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $registro = CodigoVerificacion::valido($validated['email'], $validated['codigo'])->first();

        if (!$registro) {
            return ApiResponse::error('Código inválido o expirado', 401, 'INVALID_CODE');
        }

        DB::beginTransaction();
        try {
            $user = User::where('email', $validated['email'])->first();
            $user->password = Hash::make($validated['password']);
            $user->save();

            $registro->usado = true;
            $registro->save();

            Auditoria::registrar($user, 'editar', 'Cambió su contraseña');

            app(\App\Services\NotificationService::class)->recuperacion($user);

            DB::commit();

            return ApiResponse::success(null, 'Contraseña actualizada correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Error al cambiar contraseña', 500);
        }
    }

    public function perfil()
    {
        $user = Auth::user();
        return ApiResponse::success(
            $user->only(['id', 'nombre', 'email', 'foto', 'estado', 'ultimo_login', 'idioma'])
        );
    }

    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'telefono' => 'sometimes|string|max:30',
            'archivo' => 'nullable|file|max:102400',
            'idioma' => 'sometimes|string|max:10',
        ]);

        unset($validated['archivo']);

        $user->update($validated);

        if ($request->hasFile('archivo')) {
            if ($user->foto) {
                $oldPath = str_replace('/storage/', '', parse_url($user->foto, PHP_URL_PATH));
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('archivo');
            $path = $file->store('perfiles/' . $user->id, 'public');

            $user->foto = Storage::url($path);
            $user->save();
        }

        return ApiResponse::success(
            $user->only(['id', 'nombre', 'email', 'foto', 'estado', 'zona_horaria', 'idioma', 'tema']),
            'Perfil actualizado'
        );
    }

    public function logout(Request $request)
    {
        $user = Auth::user();

        Auditoria::registrar($user, 'logout', 'Cerró sesión');

        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Sesión cerrada exitosamente');
    }
}

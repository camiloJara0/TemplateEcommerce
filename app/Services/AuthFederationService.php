<?php

namespace App\Services;

use App\Models\Auditoria;
use App\Models\Integration;
use App\Models\IntegrationEvent;
use App\Models\Role;
use App\Models\User;
use App\Services\Integration\FederationAuthException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Login federado contra un sistema externo (REQ-15 / HU-052).
 *
 * Si hay una integración activa con `soporta_login`, las credenciales se
 * validan primero en el externo antes de tocar el login local:
 *  - externo acepta  → usuario local mapeado por email (se crea con el rol
 *    configurado si no existe) y sesión Sanctum normal;
 *  - externo rechaza → 401, nunca se cae al login local (evita bypass);
 *  - externo caído   → contingencia por integración (login_fallback_local).
 */
class AuthFederationService
{
    public function __construct(
        private readonly IntegrationCredentialService $credentials
    ) {
    }

    /**
     * Primera integración activa con login federado habilitado y con
     * credenciales registradas (sin credenciales no hay contra qué validar).
     */
    public function integracionFederada(): ?Integration
    {
        return Integration::query()
            ->where('activa', true)
            ->where('soporta_login', true)
            ->where('estado', '!=', 'sin_credenciales')
            ->orderBy('id')
            ->first();
    }

    /**
     * Valida las credenciales contra el sistema externo y resuelve el
     * usuario local correspondiente (REQ-15).
     *
     * @param string $email identificador digitado (email en el formulario)
     * @param string $password contraseña digitada
     *
     * @return array{estado: string, user: ?User}
     *   - federado:     externo OK, usuario local listo (o recién creado)
     *   - invalido:     externo rechazó credenciales → 401, nunca local
     *   - inactivo:     usuario local deshabilitado → 403
     *   - indisponible: el externo no pudo validar → contingencia RN-14
     */
    public function intentar(Integration $integration, string $email, string $password): array
    {
        try {
            $credenciales = $this->credentials->obtener($integration);
            $provider = $this->credentials->proveedor($integration);

            $resultado = $provider->login($credenciales, [
                'email' => $email,
                'password' => $password,
            ]);
        } catch (\Throwable $e) {
            if ($e instanceof FederationAuthException && $e->esInvalidas()) {
                $this->evento($integration, 'login.federado_fallo', $e->getMessage(), 'error', ['email' => $email]);

                return ['estado' => 'invalido', 'user' => null];
            }

            $this->evento($integration, 'login.federado_indisponible', $e->getMessage(), 'warning', ['email' => $email]);

            return ['estado' => 'indisponible', 'user' => null];
        }

        $user = $this->resolverUsuario($integration, $email, (array) ($resultado['user'] ?? []));

        if ($user->estado === 'inactivo') {
            $this->evento($integration, 'login.federado_fallo', 'Usuario local deshabilitado.', 'error', [
                'email' => $email,
                'usuario_id' => $user->id,
            ]);

            return ['estado' => 'inactivo', 'user' => $user];
        }

        Auditoria::registrar(
            $user,
            'login',
            'Inició sesión con credenciales de ' . $integration->nombre . ' (login federado)'
        );

        $this->evento($integration, 'login.federado', 'Login federado aceptado por el sistema externo.', 'info', [
            'email' => $email,
            'externo' => (string) ($resultado['user']['nombre'] ?? ''),
            'usuario_id' => $user->id,
        ]);

        return ['estado' => 'federado', 'user' => $user];
    }

    /**
     * Usuario local por email; si no existe se crea con el rol que defina
     * la integración (default `cliente`, decisión F6).
     */
    private function resolverUsuario(Integration $integration, string $email, array $externo): User
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            return $user;
        }

        $user = User::create([
            'nombre' => ($externo['nombre'] ?? '') !== '' ? $externo['nombre'] : Str::before($email, '@'),
            'email' => $email,
            // Clave inutilizable localmente: el acceso federado solo se
            // valida contra el sistema externo.
            'password' => Hash::make(Str::random(32)),
            'idioma' => 'es',
            'estado' => 'activo',
        ]);

        $slug = $integration->rol_login_federado ?: 'cliente';
        $role = Role::where('slug', $slug)->first();

        if ($role) {
            $user->roles()->attach($role->id);
        } else {
            Log::warning("Login federado: rol '{$slug}' de la integración '{$integration->nombre}' no existe; usuario creado sin rol.");
        }

        return $user;
    }

    private function evento(
        Integration $integration,
        string $tipo,
        string $mensaje,
        string $severidad,
        array $payload = []
    ): void {
        IntegrationEvent::create([
            'integration_id' => $integration->id,
            'tipo' => $tipo,
            'severidad' => $severidad,
            'mensaje' => mb_substr($mensaje, 0, 1000),
            'payload' => $payload,
        ]);

        if ($severidad === 'error') {
            Log::warning("Login federado ({$integration->nombre}): {$tipo}", ['mensaje' => $mensaje]);
        }
    }
}

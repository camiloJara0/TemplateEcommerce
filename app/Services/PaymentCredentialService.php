<?php

namespace App\Services;

use App\Models\Setting;
use App\Services\Payment\PaymentException;
use App\Services\Payment\PaymentProvider;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class PaymentCredentialService
{
    private const GROUP = 'pagos';

    /**
     * Guardar credenciales encriptadas de un proveedor.
     */
    public function guardar(string $provider, array $credentials): void
    {
        $encrypted = [];
        foreach ($credentials as $key => $value) {
            if ($value === null || $value === '') {
                $encrypted[$key] = '';
                continue;
            }
            $encrypted[$key] = Crypt::encryptString((string) $value);
        }

        Setting::establecer(
            "payment_{$provider}_credentials",
            $encrypted,
            self::GROUP
        );

        // Actualizar config runtime
        foreach ($credentials as $key => $value) {
            config(["payments.providers.{$provider}.{$key}" => $value]);
        }
    }

    /**
     * Obtener credenciales desencriptadas de un proveedor.
     */
    public function obtener(string $provider): array
    {
        $raw = Setting::obtener("payment_{$provider}_credentials");

        if (!$raw) {
            return $this->credencialesDefault($provider);
        }

        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        if (!is_array($decoded)) {
            return $this->credencialesDefault($provider);
        }

        $decrypted = [];
        foreach ($decoded as $key => $encryptedValue) {
            if ($encryptedValue === null || $encryptedValue === '') {
                $decrypted[$key] = '';
                continue;
            }
            try {
                $decrypted[$key] = Crypt::decryptString((string) $encryptedValue);
            } catch (\Throwable $e) {
                Log::warning("Error desencriptando credencial {$provider}.{$key}", [
                    'error' => $e->getMessage(),
                ]);
                $decrypted[$key] = '';
            }
        }

        return $decrypted;
    }

    /**
     * Obtener todas las credenciales de todos los proveedores.
     */
    public function obtenerTodas(): array
    {
        $providers = config('payments.class_map', []);
        $result = [];

        foreach (array_keys($providers) as $provider) {
            $result[$provider] = $this->obtener($provider);
        }

        return $result;
    }

    /**
     * Verificar si un proveedor tiene credenciales configuradas.
     */
    public function estaConfigurado(string $provider): bool
    {
        $creds = $this->obtener($provider);

        return !empty(array_filter($creds));
    }

    /**
     * Eliminar credenciales de un proveedor.
     */
    public function eliminar(string $provider): void
    {
        $setting = Setting::where('key', "payment_{$provider}_credentials")
            ->where('group', self::GROUP)
            ->first();

        if ($setting) {
            $setting->delete();
        }

        // Limpiar config runtime
        $defaultCreds = $this->credencialesDefault($provider);
        foreach (array_keys($defaultCreds) as $key) {
            config(["payments.providers.{$provider}.{$key}" => null]);
        }
    }

    /**
     * Probar conexión de un proveedor con su API.
     */
    public function probarConexion(string $provider): array
    {
        $classMap = config('payments.class_map', []);
        $class = $classMap[$provider] ?? null;

        if (!$class || !class_exists($class)) {
            return [
                'success' => false,
                'message' => "Proveedor '{$provider}' no soportado",
            ];
        }

        // Asegurar que la config runtime tenga las credenciales actualizadas
        $creds = $this->obtener($provider);
        foreach ($creds as $key => $value) {
            config(["payments.providers.{$provider}.{$key}" => $value]);
        }

        $instance = app($class);

        if (!$instance instanceof PaymentProvider) {
            return [
                'success' => false,
                'message' => "Clase '{$class}' no implementa PaymentProvider",
            ];
        }

        if (method_exists($instance, 'testConnection')) {
            try {
                return $instance->testConnection();
            } catch (\Throwable $e) {
                Log::error("Error probando conexión {$provider}", [
                    'error' => $e->getMessage(),
                ]);
                return [
                    'success' => false,
                    'message' => 'Error al probar conexión: ' . $e->getMessage(),
                ];
            }
        }

        // Fallback: verificar que las credenciales no estén vacías
        return [
            'success' => !empty(array_filter($creds)),
            'message' => !empty(array_filter($creds))
                ? 'Credenciales configuradas (sin prueba de API)'
                : 'Credenciales no configuradas',
        ];
    }

    /**
     * Cargar credenciales de la DB al config runtime.
     * Llamar al iniciar la app.
     */
    public function cargarEnConfig(): void
    {
        $providers = config('payments.class_map', []);

        foreach (array_keys($providers) as $provider) {
            $creds = $this->obtener($provider);
            foreach ($creds as $key => $value) {
                if ($value !== null && $value !== '') {
                    config(["payments.providers.{$provider}.{$key}" => $value]);
                }
            }
        }

        // Cargar provider default
        $default = Setting::obtener('payment_default_provider');
        if ($default) {
            config(['payments.default' => $default]);
        }
    }

    private function credencialesDefault(string $provider): array
    {
        $providers = config('payments.providers', []);
        $default = $providers[$provider] ?? [];

        return array_fill_keys(array_keys($default), '');
    }
}

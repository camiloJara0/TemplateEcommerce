<?php

namespace App\Services;

use App\Models\Integration;
use App\Services\Integration\IntegrationException;
use App\Services\Integration\IntegrationProvider;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class IntegrationCredentialService
{
    /**
     * Guardar credenciales cifradas en la fila de la integración (RN-01/RN-06).
     */
    public function guardar(Integration $integration, array $credenciales): void
    {
        $encriptadas = [];
        foreach ($credenciales as $clave => $valor) {
            if ($valor === null || $valor === '') {
                $encriptadas[$clave] = '';
                continue;
            }
            $encriptadas[$clave] = Crypt::encryptString((string) $valor);
        }

        $integration->update(['credenciales' => json_encode($encriptadas)]);
    }

    /**
     * Obtener credenciales desencriptadas de una integración.
     */
    public function obtener(Integration $integration): array
    {
        $raw = $integration->credenciales;

        if (!$raw) {
            return [];
        }

        $decoded = is_string($raw) ? json_decode($raw, true) : $raw;

        if (!is_array($decoded)) {
            return [];
        }

        $desencriptadas = [];
        foreach ($decoded as $clave => $valorCifrado) {
            if ($valorCifrado === null || $valorCifrado === '') {
                $desencriptadas[$clave] = '';
                continue;
            }
            try {
                $desencriptadas[$clave] = Crypt::decryptString((string) $valorCifrado);
            } catch (\Throwable $e) {
                Log::warning("Error desencriptando credencial de integración {$integration->id}.{$clave}", [
                    'error' => $e->getMessage(),
                ]);
                $desencriptadas[$clave] = '';
            }
        }

        return $desencriptadas;
    }

    /**
     * ¿Tiene al menos los campos requeridos por el proveedor?
     *
     * Los proveedores con `credenciales_desde_backend` (url/api key en .env)
     * no piden nada en el panel: se consideran configurados si el backend
     * trae sus valores de configuración.
     */
    public function estaConfigurado(Integration $integration): bool
    {
        $meta = config("integrations.providers.{$integration->provider}", []);

        if (!empty($meta['credenciales_desde_backend'])) {
            return !empty($meta['base_url']) && !empty($meta['api_key']);
        }

        $credenciales = $this->obtener($integration);
        $requeridos = $this->camposRequeridos($integration->provider);

        if (empty($requeridos)) {
            return !empty(array_filter($credenciales));
        }

        foreach ($requeridos as $campo) {
            if (empty($credenciales[$campo])) {
                return false;
            }
        }

        return true;
    }

    public function eliminar(Integration $integration): void
    {
        $integration->update(['credenciales' => null]);
    }

    /**
     * Instanciar el adaptador del proveedor declarado en class_map (RN-18).
     */
    public function proveedor(Integration $integration): IntegrationProvider
    {
        $class = config("integrations.class_map.{$integration->provider}");

        if (!$class || !class_exists($class)) {
            throw new IntegrationException("Proveedor '{$integration->provider}' no soportado.");
        }

        $instance = new $class();

        if (!$instance instanceof IntegrationProvider) {
            throw new IntegrationException("La clase '{$class}' no implementa IntegrationProvider.");
        }

        return $instance;
    }

    /**
     * Probar conexión con las credenciales guardadas de la integración.
     *
     * @return array{success: bool, message: string}
     */
    public function probarConexion(Integration $integration): array
    {
        try {
            $provider = $this->proveedor($integration);

            return $provider->probarConexion($this->obtener($integration));
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Error al probar la conexión: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<int, string>
     */
    public function camposRequeridos(string $provider): array
    {
        $fields = config("integrations.providers.{$provider}.fields", []);

        return array_keys(array_filter($fields, fn (array $field) => !empty($field['required'])));
    }
}

<?php

namespace App\Services\Integration;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

abstract class AbstractIntegrationProvider implements IntegrationProvider
{
    protected function timeout(): int
    {
        return (int) config('integrations.sync.timeout_seconds', 15);
    }

    protected function http(): PendingRequest
    {
        return Http::timeout($this->timeout())->withHeaders([
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Valida credenciales mínimas y aplica RN-04 (HTTPS obligatorio en
     * producción cuando se declara una URL base).
     */
    protected function requireCredenciales(array $credenciales, array $requeridas): void
    {
        foreach ($requeridas as $clave) {
            if (empty($credenciales[$clave])) {
                throw new IntegrationException(
                    "Falta la credencial '{$clave}' de la integración. Edítala en Admin → Integraciones."
                );
            }
        }

        $baseUrl = $credenciales['base_url'] ?? null;
        if (!empty($baseUrl) && app()->environment('production') && !str_starts_with((string) $baseUrl, 'https://')) {
            throw new IntegrationException('La URL base de la integración debe usar HTTPS en producción.');
        }
    }

    public function describirError(\Throwable $e): array
    {
        $ex = IntegrationException::desdeThrowable($e);

        return [
            'transitorio' => $ex->esTransitorio(),
            'mensaje' => $ex->getMessage(),
        ];
    }

    /**
     * Implementación genérica de prueba de conexión: GET {url}/api/health.
     * Los proveedores con otro contrato la sobrescriben (ErpDemoProvider,
     * ErpPruebaProvider).
     */
    public function probarConexion(array $credenciales): array
    {
        $url = $credenciales['url'] ?? $credenciales['base_url'] ?? null;

        if (empty($url)) {
            throw new IntegrationException(
                "Falta la URL de conexión de '{$this->name()}'. Edítala en Admin → Integraciones."
            );
        }

        $response = $this->http()->get(rtrim((string) $url, '/') . '/api/health');

        if (!$response->successful()) {
            throw new IntegrationException(
                "Error al conectar con {$this->name()} (HTTP {$response->status()}).",
                true
            );
        }

        return [
            'success' => true,
            'message' => "Conexión exitosa con {$this->name()}.",
        ];
    }

    public function login(array $credenciales, array $datosUsuario): array
    {
        throw new IntegrationException("El proveedor '{$this->name()}' no soporta login federado.");
    }
}

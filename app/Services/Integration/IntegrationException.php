<?php

namespace App\Services\Integration;

use RuntimeException;

class IntegrationException extends RuntimeException
{
    protected bool $transitorio;

    public function __construct(string $message, bool $transitorio = false, ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->transitorio = $transitorio;
    }

    public function esTransitorio(): bool
    {
        return $this->transitorio;
    }

    /**
     * Clasifica un Throwable externo como transitorio (red/timeout/5xx)
     * o permanente (4xx, credenciales, contrato).
     */
    public static function desdeThrowable(\Throwable $e): self
    {
        if ($e instanceof self) {
            return $e;
        }

        $codigo = (int) ($e->getCode() ?: 0);
        $mensaje = $e->getMessage();

        $transitorio = str_contains($mensaje, 'timed out')
            || str_contains($mensaje, 'Connection')
            || in_array($codigo, [408, 425, 429, 500, 502, 503, 504], true);

        return new self(
            "Error de integración: " . mb_substr($mensaje, 0, 500),
            $transitorio,
            $e
        );
    }
}

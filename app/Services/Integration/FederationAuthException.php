<?php

namespace App\Services\Integration;

/**
 * Fallo tipado del login federado (REQ-15). Distingue las credenciales
 * rechazadas por el sistema externo —que nunca deben caer al login local—
 * de cualquier otra falla (red, 5xx, configuración rota) que activa la
 * contingencia configurable de la integración (RN-14 desviada).
 */
class FederationAuthException extends IntegrationException
{
    public const INVALIDAS = 'invalidas';
    public const INDISPONIBLE = 'indisponible';

    protected string $tipo;

    public function __construct(
        string $tipo,
        string $mensaje,
        bool $transitorio = false
    ) {
        parent::__construct($mensaje, $transitorio);
        $this->tipo = $tipo;
    }

    public function tipo(): string
    {
        return $this->tipo;
    }

    public function esInvalidas(): bool
    {
        return $this->tipo === self::INVALIDAS;
    }

    public static function invalidas(string $mensaje): self
    {
        return new self(self::INVALIDAS, $mensaje, false);
    }

    public static function indisponible(string $mensaje): self
    {
        return new self(self::INDISPONIBLE, $mensaje, true);
    }
}

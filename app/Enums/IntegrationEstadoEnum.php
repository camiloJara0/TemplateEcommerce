<?php

namespace App\Enums;

enum IntegrationEstadoEnum: string
{
    case SIN_CREDENCIALES = 'sin_credenciales';
    case INACTIVA = 'inactiva';
    case ACTIVA = 'activa';
    case SINCRONIZANDO = 'sincronizando';
    case CON_ERRORES = 'con_errores';
    case PAUSADA_POR_ERRORES = 'pausada_por_errores';

    public function label(): string
    {
        return match ($this) {
            self::SIN_CREDENCIALES => 'Sin credenciales',
            self::INACTIVA => 'Inactiva',
            self::ACTIVA => 'Activa',
            self::SINCRONIZANDO => 'Sincronizando',
            self::CON_ERRORES => 'Con errores',
            self::PAUSADA_POR_ERRORES => 'Pausada por errores',
        };
    }
}

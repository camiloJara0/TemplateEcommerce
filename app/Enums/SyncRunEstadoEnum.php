<?php

namespace App\Enums;

enum SyncRunEstadoEnum: string
{
    case INICIANDO = 'iniciando';
    case EN_CURSO = 'en_curso';
    case EXITOSA = 'exitosa';
    case PARCIAL = 'parcial';
    case FALLIDA = 'fallida';

    public function label(): string
    {
        return match ($this) {
            self::INICIANDO => 'Iniciando',
            self::EN_CURSO => 'En curso',
            self::EXITOSA => 'Exitosa',
            self::PARCIAL => 'Parcial',
            self::FALLIDA => 'Fallida',
        };
    }
}

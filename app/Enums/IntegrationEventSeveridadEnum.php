<?php

namespace App\Enums;

enum IntegrationEventSeveridadEnum: string
{
    case INFO = 'info';
    case WARNING = 'warning';
    case ERROR = 'error';

    public function label(): string
    {
        return match ($this) {
            self::INFO => 'Información',
            self::WARNING => 'Advertencia',
            self::ERROR => 'Error',
        };
    }
}

<?php

namespace App\Models\Concerns;

use App\Models\Auditoria;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->registrarAuditoria('crear');
        });

        static::updated(function ($model) {
            $model->registrarAuditoria('editar');
        });

        static::deleted(function ($model) {
            $model->registrarAuditoria('eliminar');
        });
    }

    protected function registrarAuditoria(string $accion): void
    {
        if (!auth()->check()) {
            return;
        }

        Auditoria::registrar(auth()->user(), $accion, $this->descripcionAuditoria($accion), $this);
    }

    protected function descripcionAuditoria(string $accion): string
    {
        return sprintf(
            '%s %s #%s',
            ucfirst($accion),
            class_basename($this),
            $this->getKey()
        );
    }
}

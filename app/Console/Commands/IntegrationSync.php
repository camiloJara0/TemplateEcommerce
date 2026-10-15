<?php

namespace App\Console\Commands;

use App\Models\Integration;
use App\Services\SyncService;
use Illuminate\Console\Command;

class IntegrationSync extends Command
{
    protected $signature = 'integrations:sync
        {--integration= : ID de una integración específica}
        {--tipo=todo : productos|inventario|inicial|todo}';

    protected $description = 'Sincroniza integraciones activas (ERP) con sus sistemas externos';

    public function handle(SyncService $syncService): int
    {
        $query = Integration::query();

        if ($this->option('integration')) {
            $query->where('id', (int) $this->option('integration'));
        }

        $sincronizadas = 0;
        $tipo = (string) $this->option('tipo');

        foreach ($query->get() as $integration) {
            $forzada = (bool) $this->option('integration');

            if (!$forzada) {
                if ($integration->estado === 'pausada_por_errores') {
                    $this->line("  {$integration->nombre}: pausada por errores (usa --integration para forzar)");
                    continue;
                }

                if (!$syncService->vence($integration)) {
                    continue;
                }
            }

            $this->info("Sincronizando '{$integration->nombre}' ({$tipo})...");

            try {
                $run = $syncService->sincronizar($integration, $tipo, 'programada');
            } catch (\Throwable $e) {
                $this->error("  Falló: {$e->getMessage()}");
                continue;
            }

            $this->line(
                "  run #{$run->id}: {$run->estado} " .
                "[creados {$run->creados}, actualizados {$run->actualizados}, " .
                "omitidos {$run->omitidos}, errores {$run->errores}]"
            );

            $sincronizadas++;
        }

        if ($sincronizadas === 0) {
            $this->info('Ninguna integración vence ahora.');
        }

        return self::SUCCESS;
    }
}

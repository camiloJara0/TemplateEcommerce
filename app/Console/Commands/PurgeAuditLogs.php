<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PurgeAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:purge';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Purge old audit logs';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $diasRetencion = config('settings.dias_retencion_auditoria', 30);

        Auditoria::where('created_at', '<', now()->subDays($diasRetencion))->delete();

        $this->info("Audit logs older than {$diasRetencion} days have been purged.");
    }
}

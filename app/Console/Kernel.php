<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Comandos programados del ecommerce (stock, reportes, etc.)
        $schedule->command('audit:purge')
            ->daily();

        // Sincronización de integraciones (ERP). El comando evalúa por
        // integración si vence su frecuencia configurada.
        // Requiere cron de servidor: * * * * * php artisan schedule:run
        $schedule->command('integrations:sync')
            ->everyFifteenMinutes()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

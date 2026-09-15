<?php

namespace App\Providers;

use App\Services\PaymentCredentialService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(PaymentCredentialService::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->asegurarConfigOpenSsl();
        $this->cargarCredencialesPagos();
    }

    private function cargarCredencialesPagos(): void
    {
        if (!$this->app->runningInConsole() && !$this->app->runningUnitTests()) {
            // Solo cargar si la tabla settings existe
            try {
                if (DB::getSchemaBuilder()->hasTable('settings')) {
                    app(PaymentCredentialService::class)->cargarEnConfig();
                }
            } catch (\Throwable $e) {
                // Silenciar errores durante migraciones o DB no disponible
            }
        }
    }

    private function asegurarConfigOpenSsl(): void
    {
        if (PHP_OS_FAMILY !== 'Windows' || getenv('OPENSSL_CONF')) {
            return;
        }

        $candidatos = [
            base_path('../../apache/conf/openssl.cnf'),
            'C:/xampp/apache/conf/openssl.cnf',
            'C:/xampp/php/extras/openssl/openssl.cnf',
        ];

        foreach ($candidatos as $ruta) {
            if (is_file($ruta)) {
                putenv('OPENSSL_CONF=' . $ruta);
                return;
            }
        }
    }
}

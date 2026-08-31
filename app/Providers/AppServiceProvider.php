<?php

namespace App\Providers;

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
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->asegurarConfigOpenSsl();
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

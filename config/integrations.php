<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Proveedores de integración (ERP / contabilidad / CRM)
    |--------------------------------------------------------------------------
    |
    | Registro plug-and-play espejo de config/payments.php. Cada proveedor
    | declara sus capabilities, campos de credenciales (para generar el form
    | del panel) y su adaptador en class_map. Las credenciales reales se
    | guardan cifradas en la tabla `integrations` (nunca en .env ni en esta
    | configuración), salvo que el proveedor declare
    | `credenciales_desde_backend = true` (url/api key leídas de .env vía
    | esta configuración; ver ErpPruebaProvider).
    |
    */

    'providers' => [
        'erp_demo' => [
            'label' => 'ERP Demo (fixtures)',
            'description' => 'Proveedor de demostración que responde con datos locales (fixtures). Valida la arquitectura sin depender de un tercero.',
            'version' => '1.0.0',
            'capabilities' => ['productos', 'inventario'],
            'supports_login' => false,
            'fields' => [
                'base_url' => [
                    'label' => 'URL base',
                    'type' => 'url',
                    'required' => false,
                    'placeholder' => 'https://erp.demo/api',
                ],
                'usuario' => [
                    'label' => 'Usuario',
                    'type' => 'text',
                    'required' => true,
                    'placeholder' => 'admin',
                ],
                'clave' => [
                    'label' => 'Clave',
                    'type' => 'password',
                    'required' => true,
                    'placeholder' => '••••••••',
                ],
            ],
        ],
        'erp_prueba' => [
            'label' => 'ERP Prueba (externo)',
            'description' => 'ERP de prueba externo (127.0.0.1:8001). La URL y la API key se configuran en el backend: .env → ERP_PRUEBA_URL y ERP_PRUEBA_API_KEY.',
            'version' => '1.0.0',
            'capabilities' => ['productos', 'inventario'],
            'supports_login' => false,
            // La URL base y la API key NO se piden en el panel: vienen del .env.
            'credenciales_desde_backend' => true,
            'base_url' => env('ERP_PRUEBA_URL', 'http://127.0.0.1:8001'),
            'api_key' => env('ERP_PRUEBA_API_KEY'),
            'rutas' => [
                'productos' => env('ERP_PRUEBA_RUTA_PRODUCTOS', '/api/productsERP'),
                'inventario' => env('ERP_PRUEBA_RUTA_INVENTARIO', '/api/inventarioERP'),
            ],
            'fields' => [],
        ],
    ],

    'class_map' => [
        'erp_demo' => \App\Services\Integration\ErpDemoProvider::class,
        'erp_prueba' => \App\Services\Integration\ErpPruebaProvider::class,
    ],

    'sync' => [
        'batch_size' => (int) env('INTEGRATIONS_BATCH_SIZE', 100),
        'timeout_seconds' => (int) env('INTEGRATIONS_TIMEOUT', 15),
        'max_attempts' => (int) env('INTEGRATIONS_MAX_ATTEMPTS', 4),
        'backoff_seconds' => [60, 300, 900, 3600],
        'max_per_run' => (int) env('INTEGRATIONS_MAX_PER_RUN', 5000),
        'frecuencia_default_minutos' => 60,
        'eventos_retencion_dias' => 90,
    ],
];

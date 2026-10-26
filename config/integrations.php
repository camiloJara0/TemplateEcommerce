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
    | configuración) y se registran desde el panel de administración.
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
            'description' => 'ERP de prueba externo (p. ej. http://127.0.0.1:8001). Registra su URL base y su API key en las credenciales de la integración.',
            'version' => '1.0.0',
            'capabilities' => ['productos', 'inventario', 'compras', 'ventas'],
            'supports_login' => true,
            'fields' => [
                'base_url' => [
                    'label' => 'URL base',
                    'type' => 'url',
                    'required' => true,
                    'placeholder' => 'http://127.0.0.1:8001',
                ],
                'api_key' => [
                    'label' => 'API key',
                    'type' => 'password',
                    'required' => true,
                    'placeholder' => '••••••••',
                ],
            ],
            // Rutas fijas del contrato HTTP del ERP de prueba (no son
            // secretas ni configurables desde el panel).
            'rutas' => [
                'productos' => '/api/productsERP',
                'inventario' => '/api/inventarioERP',
                'compras' => '/api/comprasERP',
                'ventas' => '/api/ventasERP',
                'login' => '/api/loginERP',
            ],
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

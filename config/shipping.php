<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Proveedores de envío
    |--------------------------------------------------------------------------
    |
    | La Fase 8 implementa adaptadores multi-carrier. El carrier activo por
    | defecto se define con SHIPPING_CARRIER en el .env. Los stubs devuelven
    | datos simulados para desarrollo; integra credenciales reales cuando
    | estén disponibles.
    |
    */

    'default' => env('SHIPPING_CARRIER', 'servientrega'),

    'providers' => [
        'servientrega' => [
            'username' => env('SERVIENTREGA_USERNAME'),
            'password' => env('SERVIENTREGA_PASSWORD'),
        ],
        'coordinadora' => [
            'api_key' => env('COORDINADORA_API_KEY'),
        ],
        'dhl' => [
            'api_key' => env('DHL_API_KEY'),
            'account' => env('DHL_ACCOUNT'),
        ],
        'fedex' => [
            'api_key' => env('FEDEX_API_KEY'),
            'account' => env('FEDEX_ACCOUNT'),
        ],
        'interrapidisimo' => [
            'api_key' => env('INTERRAPIDISIMO_API_KEY'),
        ],
    ],

    'class_map' => [
        'servientrega' => \App\Services\Shipping\ServientregaProvider::class,
        'coordinadora' => \App\Services\Shipping\CoordinadoraProvider::class,
        'dhl' => \App\Services\Shipping\DHLProvider::class,
        'fedex' => \App\Services\Shipping\FedExProvider::class,
        'interrapidisimo' => \App\Services\Shipping\InterrapidisimoProvider::class,
    ],

    'base_cost' => env('SHIPPING_BASE_COST', 10000),

    'cost_per_kg' => env('SHIPPING_COST_PER_KG', 3000),

    /*
    |--------------------------------------------------------------------------
    | Tarifas
    |--------------------------------------------------------------------------
    |
    | El peso cobrable es el mayor entre el peso real y el volumétrico
    | (largo × ancho × alto en cm / divisor). Cada zona aplica un
    | multiplicador de costo y una estimación de días propia.
    |
    */

    'volumetric_divisor' => env('SHIPPING_VOLUMETRIC_DIVISOR', 5000),

    'zones' => [
        'local' => [
            'multiplier' => (float) env('SHIPPING_ZONE_LOCAL_MULT', 1.0),
            'estimated_days' => (int) env('SHIPPING_ZONE_LOCAL_DAYS', 2),
        ],
        'nacional' => [
            'multiplier' => (float) env('SHIPPING_ZONE_NACIONAL_MULT', 1.3),
            'estimated_days' => (int) env('SHIPPING_ZONE_NACIONAL_DAYS', 4),
        ],
        'internacional' => [
            'multiplier' => (float) env('SHIPPING_ZONE_INTL_MULT', 2.5),
            'estimated_days' => (int) env('SHIPPING_ZONE_INTL_DAYS', 7),
        ],
    ],

    'local_countries' => ['colombia', 'co'],

    'local_cities' => [
        'bogota', 'bogotá', 'medellin', 'medellín', 'cali', 'barranquilla',
        'bucaramanga', 'cartagena', 'cucuta', 'pereira', 'manizales', 'santa marta',
    ],

    'rate_multipliers' => [
        'servientrega' => (float) env('SERVIENTREGA_RATE_MULT', 1.0),
        'coordinadora' => (float) env('COORDINADORA_RATE_MULT', 0.95),
        'dhl' => (float) env('DHL_RATE_MULT', 1.8),
        'fedex' => (float) env('FEDEX_RATE_MULT', 1.9),
        'interrapidisimo' => (float) env('INTERRAPIDISIMO_RATE_MULT', 1.05),
    ],
];
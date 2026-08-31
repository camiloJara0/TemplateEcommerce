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
];
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración general del ecommerce
    |--------------------------------------------------------------------------
    |
    | Parámetros por defecto del template. La Fase 15 los mueve a la tabla
    | `settings` para que cada negocio los configure sin tocar código.
    |
    */

    'currency' => env('ECOMMERCE_CURRENCY', 'COP'),

    'money_precision' => 2,

    'tax_rate' => env('ECOMMERCE_TAX_RATE', 0.19),

    'discount_rate' => env('ECOMMERCE_DISCOUNT_RATE', 0.10),

    'default_status' => env('ECOMMERCE_DEFAULT_STATUS', 'activo'),

    'featured_limit' => 8,

    'related_limit' => 8,

    'low_stock_threshold' => 5,
];
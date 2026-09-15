<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Proveedores de pago
    |--------------------------------------------------------------------------
    |
    | La Fase 7 implementa adaptadores plug-and-play. El provider activo se
    | define con PAYMENT_PROVIDER en el .env. Cada adaptador exige sus
    | credenciales; sin ellas lanza PaymentException.
    |
    */

    'default' => env('PAYMENT_PROVIDER'),

    'providers' => [
        'stripe' => [
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        ],
        'mercadopago' => [
            'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
            'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        ],
        'paypal' => [
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'client_secret' => env('PAYPAL_CLIENT_SECRET'),
            'mode' => env('PAYPAL_MODE', 'sandbox'),
        ],
        'wompi' => [
            'public_key' => env('WOMPI_PUBLIC_KEY'),
            'private_key' => env('WOMPI_PRIVATE_KEY'),
            'events_key' => env('WOMPI_EVENTS_KEY'),
        ],
        'payu' => [
            'api_login' => env('PAYU_API_LOGIN'),
            'api_key' => env('PAYU_API_KEY'),
            'merchant_id' => env('PAYU_MERCHANT_ID'),
            'account_id' => env('PAYU_ACCOUNT_ID', '512321'),
            'test_mode' => env('PAYU_TEST_MODE', true),
            'api_url' => env('PAYU_API_URL'),
            'notify_url' => env('PAYU_NOTIFY_URL'),
            'response_url' => env('PAYU_RESPONSE_URL'),
        ],
        'rapyd' => [
            'access_key' => env('RAPYD_ACCESS_KEY'),
            'secret_key' => env('RAPYD_SECRET_KEY'),
            'api_url' => env('RAPYD_API_URL', 'https://sandboxapi.rapyd.net'),
            'ewallet' => env('RAPYD_EWALLET'),
        ],
    ],

    'class_map' => [
        'stripe' => \App\Services\Payment\StripeProvider::class,
        'mercadopago' => \App\Services\Payment\MercadoPagoProvider::class,
        'paypal' => \App\Services\Payment\PayPalProvider::class,
        'wompi' => \App\Services\Payment\WompiProvider::class,
        'payu' => \App\Services\Payment\PayuProvider::class,
        'rapyd' => \App\Services\Payment\RapydProvider::class,
    ],
];
<?php

if (!function_exists('store_setting')) {
    function store_setting(string $key, $default = null)
    {
        return \App\Models\Setting::obtener($key, $default);
    }
}

if (!function_exists('store_name')) {
    function store_name(): string
    {
        return store_setting('store_name', config('app.name'));
    }
}

if (!function_exists('store_currency')) {
    function store_currency(): string
    {
        return store_setting('currency', config('ecommerce.currency', 'COP'));
    }
}

if (!function_exists('store_tax_rate')) {
    function store_tax_rate(): float
    {
        return (float) store_setting('tax_rate', config('ecommerce.tax_rate', 0.19));
    }
}
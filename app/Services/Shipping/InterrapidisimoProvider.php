<?php

namespace App\Services\Shipping;

class InterrapidisimoProvider extends BaseStubProvider
{
    public function name(): string
    {
        return 'interrapidisimo';
    }

    protected function credencialesRequeridas(): array
    {
        return ['api_key'];
    }
}
<?php

namespace App\Services\Shipping;

class DHLProvider extends BaseStubProvider
{
    public function name(): string
    {
        return 'dhl';
    }

    protected function credencialesRequeridas(): array
    {
        return ['api_key', 'account'];
    }
}
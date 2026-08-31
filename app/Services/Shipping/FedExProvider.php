<?php

namespace App\Services\Shipping;

class FedExProvider extends BaseStubProvider
{
    public function name(): string
    {
        return 'fedex';
    }

    protected function credencialesRequeridas(): array
    {
        return ['api_key', 'account'];
    }
}
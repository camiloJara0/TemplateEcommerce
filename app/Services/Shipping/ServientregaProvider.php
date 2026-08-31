<?php

namespace App\Services\Shipping;

class ServientregaProvider extends BaseStubProvider
{
    public function name(): string
    {
        return 'servientrega';
    }

    protected function credencialesRequeridas(): array
    {
        return ['username', 'password'];
    }
}
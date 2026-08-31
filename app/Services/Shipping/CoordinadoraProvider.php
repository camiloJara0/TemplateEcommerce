<?php

namespace App\Services\Shipping;

class CoordinadoraProvider extends BaseStubProvider
{
    public function name(): string
    {
        return 'coordinadora';
    }

    protected function credencialesRequeridas(): array
    {
        return ['api_key'];
    }
}
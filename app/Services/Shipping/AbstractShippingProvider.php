<?php

namespace App\Services\Shipping;

abstract class AbstractShippingProvider implements ShippingProvider
{
    public function configurar(): array
    {
        return config("shipping.providers.{$this->name()}", []);
    }

    abstract protected function credencialesRequeridas(): array;

    protected function configValida(): bool
    {
        foreach ($this->credencialesRequeridas() as $clave) {
            if (empty($this->configurar()[$clave] ?? null)) {
                return false;
            }
        }

        return true;
    }

    protected function requireConfig(): void
    {
        if (!$this->configValida()) {
            throw new ShippingException(
                "El proveedor de envío '{$this->name()}' no está configurado. Revisa el .env"
            );
        }
    }
}
<?php

namespace App\Services\Payment;

abstract class AbstractPaymentProvider implements PaymentProvider
{
    public function configurar(): array
    {
        return config("payments.providers.{$this->name()}", []);
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
            throw new PaymentException(
                "El proveedor de pago '{$this->name()}' no está configurado. Revisa PAYMENT_PROVIDER y sus credenciales en el .env"
            );
        }
    }
}
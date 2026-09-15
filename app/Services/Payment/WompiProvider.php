<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WompiProvider extends AbstractPaymentProvider
{
    private const API_BASE = 'https://api.wompi.dev/v1';
    private const API_BASE_SANDBOX = 'https://sandbox.wompi.dev/v1';

    public function name(): string
    {
        return 'wompi';
    }

    protected function credencialesRequeridas(): array
    {
        return ['public_key', 'private_key'];
    }

    // ── Create Payment ──────────────────────────────────────────

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        $config = $this->configurar();
        $baseUrl = $this->apiUrl();

        // Wompi usa Payment Links o Transactions API
        $payload = [
            'amount_in_cents' => (int) round($order->total * 100),
            'currency' => strtoupper($order->currency ?? 'COP'),
            'customer_email' => $order->user->email ?? '',
            'reference' => "ORDER-{$order->id}-" . Str::random(8),
            'payment_method' => $this->buildPaymentMethod($data),
            'redirect_url' => $data['redirect_url'] ?? config('app.url') . "/checkout/pago/{$order->id}?status=success",
        ];

        // Generar firma del backend (integridad)
        $integrity = $this->computeIntegrity(
            $payload['reference'],
            $payload['amount_in_cents'],
            $payload['currency']
        );
        $payload['integrity_secret'] = $integrity;

        try {
            $respuesta = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $config['private_key'],
                    'Content-Type' => 'application/json',
                ])
                ->post("{$baseUrl}/transactions", $payload);

            if ($respuesta->failed()) {
                $body = $respuesta->json();
                $msg = $body['error']['message'] ?? ($body['message'] ?? 'Error desconocido');
                Log::error('WompiProvider charge failed', [
                    'order_id' => $order->id,
                    'status' => $respuesta->status(),
                    'body' => $body,
                ]);
                throw new PaymentException('Wompi: ' . $msg);
            }

            $body = $respuesta->json();
            $transaction = $body['data'] ?? $body;

            return [
                'transaction_id' => $transaction['id'] ?? null,
                'reference' => $transaction['reference'] ?? null,
                'status' => $this->mapStatus($transaction['status'] ?? ''),
                'payload' => $transaction,
            ];
        } catch (\Throwable $e) {
            if ($e instanceof PaymentException) throw $e;
            Log::error('WompiProvider charge exception', ['error' => $e->getMessage()]);
            throw new PaymentException('Wompi: ' . $e->getMessage());
        }
    }

    // ── Refund ──────────────────────────────────────────────────

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        $this->requireConfig();

        if (!$payment->transaction_id) {
            throw new PaymentException('Sin transacción que reembolsar');
        }

        $config = $this->configurar();
        $baseUrl = $this->apiUrl();

        try {
            $respuesta = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $config['private_key'],
                    'Content-Type' => 'application/json',
                ])
                ->post("{$baseUrl}/transactions/{$payment->transaction_id}/refund", [
                    'amount_in_cents' => (int) round($amount * 100),
                    'reason' => $reason ?? 'Devolución solicitada',
                ]);

            if ($respuesta->failed()) {
                $body = $respuesta->json();
                $msg = $body['error']['message'] ?? ($body['message'] ?? 'Error');
                throw new PaymentException('Wompi refund: ' . $msg);
            }

            $body = $respuesta->json();
            $refund = $body['data'] ?? $body;

            return [
                'transaction_id' => $refund['id'] ?? null,
                'status' => ($refund['status'] ?? '') === 'APPROVED' ? 'completado' : 'pendiente',
                'payload' => $refund,
            ];
        } catch (\Throwable $e) {
            if ($e instanceof PaymentException) throw $e;
            throw new PaymentException('Wompi refund: ' . $e->getMessage());
        }
    }

    // ── Webhook ─────────────────────────────────────────────────

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $evento = $payload['event'] ?? null;
        $datos = $payload['data']['transaction'] ?? [];

        $estado = match ($evento) {
            'transaction.updated' => match ($datos['status'] ?? null) {
                'APPROVED' => PaymentStatusEnum::APROBADO->value,
                'DECLINED', 'ERROR', 'VOIDED' => PaymentStatusEnum::RECHAZADO->value,
                default => PaymentStatusEnum::PENDIENTE->value,
            },
            default => null,
        };

        return [
            'transaction_id' => $datos['id'] ?? null,
            'status' => $estado,
            'payload' => $payload,
        ];
    }

    // ── Test Connection ────────────────────────────────────────

    public function testConnection(): array
    {
        if (!$this->configValida()) {
            return ['success' => false, 'message' => 'Credenciales no configuradas (public_key, private_key)'];
        }

        try {
            $config = $this->configurar();
            $baseUrl = $this->apiUrl();

            $respuesta = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $config['private_key'],
                ])
                ->get("{$baseUrl}/merchants/me");

            if ($respuesta->failed()) {
                $body = $respuesta->json();
                $msg = $body['error']['message'] ?? ($body['message'] ?? 'Error desconocido');
                return ['success' => false, 'message' => "Error Wompi: {$msg}"];
            }

            $body = $respuesta->json();
            $merchant = $body['data'] ?? $body;
            $name = $merchant['name'] ?? 'Comercio';

            return [
                'success' => true,
                'message' => "Conexión exitosa. Comercio: {$name}",
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }

    // ── Get Payment Methods ────────────────────────────────────

    public function getPaymentMethods(): array
    {
        $this->requireConfig();
        $baseUrl = $this->apiUrl();

        try {
            $respuesta = Http::timeout(15)->get("{$baseUrl}/payment_methods");
            if ($respuesta->failed()) {
                return [];
            }
            $body = $respuesta->json();
            return $body['data'] ?? [];
        } catch (\Throwable $e) {
            Log::warning('WompiProvider getPaymentMethods failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    // ── Helpers ─────────────────────────────────────────────────

    private function apiUrl(): string
    {
        $config = $this->configurar();
        $mode = $config['mode'] ?? 'sandbox';

        return $mode === 'production' ? self::API_BASE : self::API_BASE_SANDBOX;
    }

    private function buildPaymentMethod(array $data): array
    {
        $type = $data['payment_method_type'] ?? 'CARD';

        $method = [
            'type' => strtoupper($type),
        ];

        if (strtoupper($type) === 'CARD') {
            $method['token'] = $data['card_token'] ?? null;
            $method['installments'] = (int) ($data['installments'] ?? 1);

            if (!$method['token'] && !empty($data['number'])) {
                $method['card'] = [
                    'number' => str_replace(' ', '', $data['number'] ?? ''),
                    'cvc' => $data['cvv'] ?? $data['cvc'] ?? '',
                    'exp_month' => $data['expiration_month'] ?? '',
                    'exp_year' => '20' . ($data['expiration_year'] ?? ''),
                    'card_holder' => $data['name'] ?? $data['card_name'] ?? '',
                ];
            }
        }

        if (strtoupper($type) === 'NEQUI') {
            $method['phone_number'] = $data['phone_number'] ?? $data['nequi_phone'] ?? '';
        }

        if (strtoupper($type) === 'PSE') {
            $method['user_type'] = $data['person_type'] ?? 'N';
            $method['user_legal_id_type'] = $data['document_type'] ?? 'CC';
            $method['user_legal_id'] = $data['document_number'] ?? '';
            $method['financial_institution_code'] = $data['financial_institution_code'] ?? $data['pse_bank_code'] ?? '';
        }

        return array_filter($method, fn ($v) => $v !== null);
    }

    /**
     * Calcular integridad Wompi.
     * SHA512 de la referencia + monto_en_centavos + moneda + clave_secreta
     */
    public function computeIntegrity(string $reference, int $amountInCents, string $currency): string
    {
        $config = $this->configurar();
        $secretKey = $config['private_key'] ?? '';

        return hash('sha512', "{$reference}{$amountInCents}{$currency}{$secretKey}");
    }

    private function mapStatus(string $wompiStatus): string
    {
        return match (strtoupper($wompiStatus)) {
            'APPROVED' => PaymentStatusEnum::APROBADO->value,
            'DECLINED', 'ERROR', 'VOIDED' => PaymentStatusEnum::RECHAZADO->value,
            'PENDING' => PaymentStatusEnum::PENDIENTE->value,
            default => PaymentStatusEnum::PENDIENTE->value,
        };
    }
}

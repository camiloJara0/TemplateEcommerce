<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RapydProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'rapyd';
    }

    protected function credencialesRequeridas(): array
    {
        return ['access_key', 'secret_key'];
    }

    // ── Create Payment ──────────────────────────────────────────

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        $payload = $this->buildCreatePayment($order, $data);
        $response = $this->rapydRequest('POST', '/v1/payments', $payload);

        if (isset($response['status']) && $response['status']['status'] === 'ERROR') {
            $msg = $response['status']['message'] ?? 'Error desconocido';
            Log::error('RapydProvider charge error', ['order_id' => $order->id, 'error' => $msg]);
            throw new PaymentException('Rapyd: ' . $msg);
        }

        $payment = $response['data'] ?? $response;

        return [
            'transaction_id' => $payment['id'] ?? null,
            'reference' => $payment['id'] ?? null,
            'status' => $this->mapStatus($payment['status'] ?? ''),
            'payload' => $payment,
        ];
    }

    // ── Refund ──────────────────────────────────────────────────

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        $this->requireConfig();

        $rapydId = $payment->transaction_id ?? $payment->reference;
        if (!$rapydId) {
            throw new PaymentException('Sin ID de transacción Rapyd para reembolsar');
        }

        $payload = array_filter([
            'amount' => $amount,
            'reason' => $reason,
        ], fn ($v) => $v !== null);

        $response = $this->rapydRequest('POST', "/v1/refunds", array_merge($payload, [
            'payment' => $rapydId,
        ]));

        if (isset($response['status']) && $response['status']['status'] === 'ERROR') {
            throw new PaymentException('Rapyd refund: ' . ($response['status']['message'] ?? 'Error'));
        }

        $refund = $response['data'] ?? $response;

        return [
            'transaction_id' => $refund['id'] ?? null,
            'status' => ($refund['status'] ?? '') === 'CLO' ? 'completado' : 'pendiente',
            'payload' => $refund,
        ];
    }

    // ── Webhook ─────────────────────────────────────────────────

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $type = $payload['type'] ?? '';
        $data = $payload['data'] ?? [];

        $paymentId = $data['id'] ?? null;
        $status = $data['status'] ?? null;

        $statusMap = [
            'PAYMENT_SUCCEEDED' => PaymentStatusEnum::APROBADO->value,
            'PAYMENT_COMPLETED' => PaymentStatusEnum::APROBADO->value,
            'PAYMENT_FAILED' => PaymentStatusEnum::RECHAZADO->value,
            'PAYMENT_EXPIRED' => PaymentStatusEnum::RECHAZADO->value,
            'PAYMENT_CANCELED' => PaymentStatusEnum::RECHAZADO->value,
        ];

        // Map Rapyd payment status
        $rapydStatusMap = [
            'CLO' => PaymentStatusEnum::APROBADO->value,
            'ACT' => PaymentStatusEnum::PENDIENTE->value,
            'ERR' => PaymentStatusEnum::RECHAZADO->value,
            'CAN' => PaymentStatusEnum::RECHAZADO->value,
            'EXP' => PaymentStatusEnum::RECHAZADO->value,
            'REV' => PaymentStatusEnum::RECHAZADO->value,
        ];

        $mappedStatus = $statusMap[$type] ?? $rapydStatusMap[$status] ?? null;

        return [
            'transaction_id' => $paymentId,
            'status' => $mappedStatus,
            'payload' => $payload,
        ];
    }

    // ── Additional Rapyd API Methods ────────────────────────────

    /**
     * Update payment (status must be ACT)
     */
    public function updatePayment(string $rapydPaymentId, array $data): array
    {
        $this->requireConfig();
        $response = $this->rapydRequest('PUT', "/v1/payments/{$rapydPaymentId}", $data);
        return $response['data'] ?? $response;
    }

    /**
     * Capture a card payment (when capture=false was used)
     */
    public function capturePayment(string $rapydPaymentId, ?float $amount = null): array
    {
        $this->requireConfig();
        $payload = $amount !== null ? ['amount' => $amount] : [];
        $response = $this->rapydRequest('POST', "/v1/payments/{$rapydPaymentId}/capture", $payload);
        return $response['data'] ?? $response;
    }

    /**
     * Complete a payment (for checkout flow)
     */
    public function completePayment(string $rapydPaymentId): array
    {
        $this->requireConfig();
        $response = $this->rapydRequest('GET', "/v1/payments/{$rapydPaymentId}/complete");
        return $response['data'] ?? $response;
    }

    /**
     * List payments with filters
     */
    public function listPayments(array $filters = []): array
    {
        $this->requireConfig();
        $query = http_build_query(array_filter($filters, fn ($v) => $v !== null));
        $path = '/v1/payments' . ($query ? "?{$query}" : '');
        $response = $this->rapydRequest('GET', $path);
        return $response['data'] ?? $response;
    }

    /**
     * Retrieve a single payment
     */
    public function retrievePayment(string $rapydPaymentId): array
    {
        $this->requireConfig();
        $response = $this->rapydRequest('GET', "/v1/payments/{$rapydPaymentId}");
        return $response['data'] ?? $response;
    }

    /**
     * Cancel a payment (status must be ACT)
     */
    public function cancelPayment(string $rapydPaymentId): array
    {
        $this->requireConfig();
        $response = $this->rapydRequest('DELETE', "/v1/payments/{$rapydPaymentId}");
        return $response['data'] ?? $response;
    }

    // ── Payment Methods by Country ──────────────────────────────

    /**
     * List payment methods available in a country
     * GET /v1/payment_methods/countries/{country}
     */
    public function listPaymentMethodsByCountry(string $country, ?string $currency = null): array
    {
        $this->requireConfig();
        $path = '/v1/payment_methods/countries/' . strtoupper($country);
        if ($currency) {
            $path .= '?currency=' . strtoupper($currency);
        }
        $response = $this->rapydRequest('GET', $path);

        if (isset($response['status']) && $response['status']['status'] === 'ERROR') {
            Log::warning('RapydProvider listPaymentMethodsByCountry error', [
                'country' => $country,
                'error' => $response['status']['message'] ?? 'Unknown',
            ]);
            return [];
        }

        return $response['data'] ?? [];
    }

    /**
     * Get required fields for a specific payment method type
     * GET /v1/payment_methods/{type}/required_fields
     */
    public function getRequiredFields(string $paymentMethodType): array
    {
        $this->requireConfig();
        $response = $this->rapydRequest('GET', "/v1/payment_methods/{$paymentMethodType}/required_fields");

        if (isset($response['status']) && $response['status']['status'] === 'ERROR') {
            Log::warning('RapydProvider getRequiredFields error', [
                'type' => $paymentMethodType,
                'error' => $response['status']['message'] ?? 'Unknown',
            ]);
            return [];
        }

        return $response['data'] ?? [];
    }

    // ── Test Connection ────────────────────────────────────────

    public function testConnection(): array
    {
        if (!$this->configValida()) {
            return ['success' => false, 'message' => 'Credenciales no configuradas (access_key, secret_key)'];
        }

        try {
            $response = $this->rapydRequest('GET', '/v1/payment_methods/countries/CO');
            $methods = $response['data'] ?? [];
            $count = is_array($methods) ? count($methods) : 0;
            return [
                'success' => true,
                'message' => "Conexión exitosa. {$count} métodos de pago disponibles en Colombia.",
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }

    // ── Signature & Request ─────────────────────────────────────

    /**
     * Compute Rapyd signature
     * BASE64( HMAC-SHA256( method + path + salt + timestamp + accessKey + secretKey + body ) )
     */
    public function computeSignature(string $method, string $path, string $salt, string $timestamp, string $body = ''): string
    {
        $config = $this->configurar();
        $toSign = strtolower($method) . $path . $salt . $timestamp . $config['access_key'] . $config['secret_key'] . $body;
        $hmac = hash_hmac('sha256', $toSign, $config['secret_key']);
        return base64_encode($hmac);
    }

    /**
     * Send signed request to Rapyd API
     */
    private function rapydRequest(string $method, string $path, ?array $body = null): array
    {
        $config = $this->configurar();
        $baseUrl = $config['api_url'] ?? 'https://sandboxapi.rapyd.net';

        $salt = Str::random(12);
        $timestamp = (string) time();
        $bodyString = $body ? json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : '';
        $bodyString = $bodyString === '{}' ? '' : $bodyString;

        $signature = $this->computeSignature($method, $path, $salt, $timestamp, $bodyString);

        $headers = [
            'Content-Type' => 'application/json',
            'access_key' => $config['access_key'],
            'salt' => $salt,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'idempotency' => Str::random(16),
        ];

        try {
            $http = Http::timeout(30)->withHeaders($headers);

            $response = match (strtoupper($method)) {
                'GET' => $http->get($baseUrl . $path),
                'POST' => $http->post($baseUrl . $path, $body),
                'PUT' => $http->put($baseUrl . $path, $body),
                'DELETE' => $http->delete($baseUrl . $path, $body),
                default => throw new PaymentException("Método HTTP no soportado: {$method}"),
            };

            if ($response->failed()) {
                Log::error('Rapyd API HTTP error', [
                    'method' => $method,
                    'path' => $path,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new PaymentException('Rapyd: Error de comunicación con la API (' . $response->status() . ')');
            }

            return $response->json();
        } catch (\Exception $e) {
            if ($e instanceof PaymentException) throw $e;
            Log::error('Rapyd API exception', ['error' => $e->getMessage()]);
            throw new PaymentException('Rapyd: ' . $e->getMessage());
        }
    }

    // ── Helpers ─────────────────────────────────────────────────

    private function buildCreatePayment(Order $order, array $data): array
    {
        $buyer = $order->user;
        $address = $order->address;

        $paymentMethodType = $data['payment_method_type'] ?? 'co_visa_card';
        $frontendUrl = config('app.url', 'http://localhost:3000');

        $payload = [
            'amount' => round($order->total, 2),
            'currency' => $order->currency ?? 'COP',
            'description' => "Pedido #{$order->id}",
            'merchant_reference_id' => "ORDER-{$order->id}",
            'capture' => true,
            'complete_payment_url' => $data['complete_payment_url'] ?? "{$frontendUrl}/checkout/pago/{$order->id}?status=success",
            'error_payment_url' => $data['error_payment_url'] ?? "{$frontendUrl}/checkout/pago/{$order->id}?status=error",
            'customer' => [
                'name' => $buyer->nombre ?? $buyer->name ?? '',
                'email' => $buyer->email ?? '',
                'phone_number' => $buyer->telefono ?? $buyer->phone ?? '',
            ],
            'metadata' => [
                'order_id' => $order->id,
                'user_id' => $buyer->id,
            ],
        ];

        // Add payment method
        $fields = $this->buildPaymentMethodFields($paymentMethodType, $data);
        $payload['payment_method'] = [
            'type' => $paymentMethodType,
            'fields' => $fields,
        ];

        // Add address if available
        if ($address) {
            $payload['customer']['address'] = [
                'name' => $buyer->nombre ?? $buyer->name ?? '',
                'line_1' => $address->direccion ?? $address->address ?? '',
                'city' => $address->ciudad ?? $address->city ?? '',
                'country' => 'CO',
                'zip' => $address->codigo_postal ?? $address->zip ?? '',
                'phone_number' => $address->telefono ?? $address->phone ?? $buyer->telefono ?? $buyer->phone ?? '',
            ];
        }

        return $payload;
    }

    private function buildPaymentMethodFields(string $type, array $data): array
    {
        // ── Cards ──────────────────────────────────────────────
        // Rapyd expects: number, expiration_month, expiration_year, cvv, name
        $cardTypes = [
            'co_visa_card', 'co_mastercard_card', 'co_amex_card', 'co_diners_card',
            'col_visa_card', 'col_mastercard_card',
            'gb_visa_card', 'us_visa_card', 'us_mastercard_card',
        ];
        if (in_array($type, $cardTypes) || str_contains($type, '_card')) {
            return [
                'number' => $data['number'] ?? $data['card_number'] ?? '',
                'expiration_month' => $data['expiration_month'] ?? $data['card_expiration_month'] ?? '',
                'expiration_year' => $data['expiration_year'] ?? $data['card_expiration_year'] ?? '',
                'name' => $data['name'] ?? $data['card_name'] ?? '',
                'cvv' => $data['cvv'] ?? $data['card_cvv'] ?? '',
            ];
        }

        // ── PSE / Bank redirect ────────────────────────────────
        // Rapyd expects: financial_institution_code, person_type, document_type, document_number
        if (str_contains($type, 'pse') || str_contains($type, '_bank')) {
            return array_filter([
                'financial_institution_code' => $data['financial_institution_code'] ?? $data['pse_bank_code'] ?? '',
                'person_type' => $data['person_type'] ?? $data['pse_person_type'] ?? 'N',
                'document_type' => $data['document_type'] ?? $data['pse_document_type'] ?? 'CC',
                'document_number' => $data['document_number'] ?? $data['pse_document_number'] ?? '',
            ], fn ($v) => $v !== '');
        }

        // ── Nequi ──────────────────────────────────────────────
        // Rapyd expects: name, phone_number
        if (str_contains($type, 'nequi')) {
            return array_filter([
                'name' => $data['name'] ?? '',
                'phone_number' => $data['phone_number'] ?? $data['nequi_phone'] ?? '',
            ], fn ($v) => $v !== '');
        }

        // ── Bancolombia button ─────────────────────────────────
        if (str_contains($type, 'bancolombia')) {
            return [];
        }

        // ── Cash (Efecty, Baloto) ──────────────────────────────
        // Rapyd expects: name, email (from payment_options)
        if (str_contains($type, 'cash') || str_contains($type, 'efecty') || str_contains($type, 'baloto')) {
            return array_filter([
                'name' => $data['name'] ?? '',
                'email' => $data['email'] ?? '',
            ], fn ($v) => $v !== '');
        }

        // ── Daviplata ──────────────────────────────────────────
        if (str_contains($type, 'daviplata')) {
            return array_filter([
                'name' => $data['name'] ?? '',
                'phone_number' => $data['phone_number'] ?? '',
            ], fn ($v) => $v !== '');
        }

        // ── Generic: pass through all non-system fields ────────
        $systemKeys = ['order_id', 'payment_method_type', 'amount', 'currency', 'provider', 'reference'];
        return array_filter(
            array_diff_key($data, array_flip($systemKeys)),
            fn ($v) => $v !== '' && $v !== null,
        );
    }

    private function mapStatus(string $rapydStatus): string
    {
        return match ($rapydStatus) {
            'CLO' => PaymentStatusEnum::APROBADO->value,
            'ACT' => PaymentStatusEnum::PENDIENTE->value,
            'ERR', 'CAN', 'EXP', 'REV' => PaymentStatusEnum::RECHAZADO->value,
            default => PaymentStatusEnum::PENDIENTE->value,
        };
    }
}

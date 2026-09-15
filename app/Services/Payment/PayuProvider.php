<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayuProvider extends AbstractPaymentProvider
{
    public function name(): string
    {
        return 'payu';
    }

    protected function credencialesRequeridas(): array
    {
        return ['api_login', 'api_key', 'merchant_id'];
    }

    public function charge(Order $order, array $data): array
    {
        $this->requireConfig();

        $payload = $this->buildTransaction($order, $data);

        $respuesta = Http::timeout(30)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->post($this->apiUrl(), $payload);

        if ($respuesta->failed()) {
            Log::error('PayuProvider charge failed', [
                'order_id' => $order->id,
                'status' => $respuesta->status(),
                'body' => $respuesta->body(),
            ]);
            throw new PaymentException('PayU: Error al comunicarse con el gateway de pago');
        }

        $body = $respuesta->json();
        $txResponse = $body['transactionResponse'] ?? null;

        if (!$txResponse || ($body['code'] ?? '') !== 'SUCCESS') {
            $errorMsg = $body['error'] ?? ($txResponse['responseMessage'] ?? 'Error desconocido');
            Log::warning('PayuProvider charge error', [
                'order_id' => $order->id,
                'code' => $body['code'] ?? null,
                'error' => $errorMsg,
            ]);
            throw new PaymentException('PayU: ' . $errorMsg);
        }

        return [
            'transaction_id' => $txResponse['transactionId'] ?? null,
            'reference' => $txResponse['orderId'] ?? null,
            'status' => $this->mapState($txResponse['state'] ?? ''),
            'payload' => $body,
        ];
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): array
    {
        $this->requireConfig();

        if (!$payment->transaction_id) {
            throw new PaymentException('Sin transacción que reembolsar');
        }

        $config = $this->configurar();
        $referenceSale = $this->extractReferenceSale($payment);

        $payload = [
            'language' => 'es',
            'command' => 'SUBMIT_TRANSACTION',
            'merchant' => [
                'apiKey' => $config['api_key'],
                'apiLogin' => $config['api_login'],
            ],
            'transaction' => [
                'order' => [
                    'referenceCode' => $referenceSale,
                ],
                'type' => 'REFUND',
                'parentTransactionId' => $payment->transaction_id,
            ],
            'test' => $config['test_mode'] ?? true,
        ];

        $respuesta = Http::timeout(30)
            ->post($this->apiUrl(), $payload);

        if ($respuesta->failed()) {
            throw new PaymentException('PayU refund: ' . $respuesta->body());
        }

        $body = $respuesta->json();
        $txResponse = $body['transactionResponse'] ?? [];

        return [
            'transaction_id' => $txResponse['transactionId'] ?? null,
            'status' => $txResponse['state'] === 'APPROVED' ? 'completado' : 'pendiente',
            'payload' => $body,
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();

        if (!$this->verifySignature($payload)) {
            Log::warning('PayuProvider webhook: Invalid signature', [
                'sign' => $payload['sign'] ?? null,
            ]);
            throw new PaymentException('Firma de webhook inválida');
        }

        $statePol = $payload['state_pol'] ?? '';
        $transactionId = $payload['transaction_id'] ?? null;
        $referenceSale = $payload['reference_sale'] ?? null;

        $statusMap = [
            '4' => PaymentStatusEnum::APROBADO->value,
            '6' => PaymentStatusEnum::RECHAZADO->value,
            '7' => PaymentStatusEnum::PENDIENTE->value,
        ];

        $status = $statusMap[$statePol] ?? null;

        return [
            'transaction_id' => $transactionId,
            'reference' => $referenceSale,
            'status' => $status,
            'payload' => $payload,
        ];
    }

    // ── Test Connection ────────────────────────────────────────

    public function testConnection(): array
    {
        if (!$this->configValida()) {
            return ['success' => false, 'message' => 'Credenciales no configuradas (api_login, api_key, merchant_id)'];
        }

        try {
            $config = $this->configurar();
            $payload = [
                'language' => 'es',
                'command' => 'GET_BANKS_LIST',
                'merchant' => [
                    'apiLogin' => $config['api_login'],
                    'apiKey' => $config['api_key'],
                ],
                'test' => $config['test_mode'] ?? true,
                'bankListInformation' => [
                    'paymentMethod' => 'PSE',
                    'paymentCountry' => 'CO',
                ],
            ];

            $respuesta = Http::timeout(15)->post($this->apiUrl(), $payload);

            if ($respuesta->failed()) {
                return ['success' => false, 'message' => 'Error de conexión con PayU'];
            }

            $body = $respuesta->json();
            $banks = $body['banks'] ?? [];
            $count = is_array($banks) ? count($banks) : 0;

            return [
                'success' => true,
                'message' => "Conexión exitosa. {$count} bancos PSE disponibles.",
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()];
        }
    }

    // ── PSE Banks ─────────────────────────────────────────────

    public function bancosPse(): array
    {
        $this->requireConfig();

        $config = $this->configurar();

        $payload = [
            'language' => 'es',
            'command' => 'GET_BANKS_LIST',
            'merchant' => [
                'apiLogin' => $config['api_login'],
                'apiKey' => $config['api_key'],
            ],
            'test' => $config['test_mode'] ?? true,
            'bankListInformation' => [
                'paymentMethod' => 'PSE',
                'paymentCountry' => 'CO',
            ],
        ];

        $respuesta = Http::timeout(30)->post($this->apiUrl(), $payload);

        if ($respuesta->failed()) {
            Log::error('PayuProvider PSE banks failed', ['body' => $respuesta->body()]);
            return [];
        }

        return $respuesta->json()['banks'] ?? [];
    }

    // ── Helpers ───────────────────────────────────────────────

    private function apiUrl(): string
    {
        $config = $this->configurar();
        return $config['api_url']
            ?? (($config['test_mode'] ?? true)
                ? 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi'
                : 'https://api.payulatam.com/payments-api/4.0/service.cgi');
    }

    private function buildTransaction(Order $order, array $data): array
    {
        $config = $this->configurar();
        $referenceCode = 'ORDER-' . $order->id . '-' . time();
        $buyer = $order->user;
        $address = $order->address;

        $buyerData = [
            'merchantBuyerId' => (string) $buyer->id,
            'fullName' => $buyer->nombre ?? '',
            'emailAddress' => $buyer->email ?? '',
            'contactPhone' => $buyer->telefono ?? '',
            'dniNumber' => (string) $buyer->id,
        ];

        $addressData = $address ? [
            'street1' => $address->direccion ?? '',
            'street2' => '',
            'city' => $address->ciudad ?? '',
            'state' => $address->ciudad ?? '',
            'country' => 'CO',
            'postalCode' => $address->codigo_postal ?? '000000',
            'phone' => $address->telefono ?? $buyer->telefono ?? '',
        ] : [
            'street1' => 'N/A',
            'city' => 'Bogotá',
            'state' => 'Bogotá D.C.',
            'country' => 'CO',
            'postalCode' => '000000',
            'phone' => '',
        ];

        $taxRate = config('ecommerce.tax_rate', 0.19);
        $base = round($order->total / (1 + $taxRate), 2);
        $tax = round($order->total - $base, 2);

        $request = [
            'language' => 'es',
            'command' => 'SUBMIT_TRANSACTION',
            'merchant' => [
                'apiKey' => $config['api_key'],
                'apiLogin' => $config['api_login'],
            ],
            'transaction' => [
                'order' => [
                    'accountId' => $config['account_id'] ?? '512321',
                    'referenceCode' => $referenceCode,
                    'description' => "Pedido #{$order->id}",
                    'language' => 'es',
                    'notifyUrl' => $config['notify_url'] ?? '',
                    'additionalValues' => [
                        'TX_VALUE' => ['value' => $order->total, 'currency' => 'COP'],
                        'TX_TAX' => ['value' => $tax, 'currency' => 'COP'],
                        'TX_TAX_RETURN_BASE' => ['value' => $base, 'currency' => 'COP'],
                    ],
                    'buyer' => $buyerData,
                    'shippingAddress' => $addressData,
                ],
                'payer' => [
                    'merchantPayerId' => (string) $buyer->id,
                    'fullName' => $buyer->nombre ?? '',
                    'emailAddress' => $buyer->email ?? '',
                    'contactPhone' => $buyer->telefono ?? '',
                    'dniNumber' => (string) $buyer->id,
                    'billingAddress' => $addressData,
                ],
                'type' => 'AUTHORIZATION_AND_CAPTURE',
                'paymentMethod' => $data['payment_method'] ?? 'VISA',
                'paymentCountry' => 'CO',
                'deviceSessionId' => $data['device_session_id'] ?? md5(uniqid()),
                'ipAddress' => $data['ip_address'] ?? request()->ip(),
                'cookie' => request()->cookie('_ga', md5(uniqid())),
                'userAgent' => request()->userAgent(),
            ],
            'test' => $config['test_mode'] ?? true,
        ];

        // Method-specific fields
        $method = $data['payment_method'] ?? 'VISA';

        switch ($method) {
            case 'VISA':
            case 'MASTERCARD':
            case 'AMEX':
            case 'DINERS':
            case 'CODENSA':
                $request['transaction']['creditCard'] = [
                    'number' => $data['card_number'] ?? '',
                    'securityCode' => $data['card_security_code'] ?? '',
                    'expirationDate' => $data['card_expiration_date'] ?? '',
                    'name' => $data['card_name'] ?? '',
                ];
                $request['transaction']['extraParameters'] = [
                    'INSTALLMENTS_NUMBER' => $data['installments'] ?? 1,
                ];
                break;

            case 'PSE':
                $request['transaction']['extraParameters'] = [
                    'FINANCIAL_INSTITUTION_CODE' => $data['pse_bank_code'] ?? '',
                    'USER_TYPE' => $data['pse_person_type'] ?? 'N',
                    'PSE_REFERENCE1' => $data['ip_address'] ?? request()->ip(),
                    'PSE_REFERENCE2' => $data['pse_document_type'] ?? 'CC',
                    'PSE_REFERENCE3' => $data['pse_document_number'] ?? '',
                    'RESPONSE_URL' => $config['response_url'] ?? '',
                ];
                break;

            case 'NEQUI':
                $request['transaction']['extraParameters'] = [
                    'PHONE_NUMBER' => $data['nequi_phone'] ?? '',
                ];
                break;

            case 'BANCOLOMBIA_BUTTON':
                $request['transaction']['extraParameters'] = [
                    'DESCRIPTION' => 'Pago en tienda',
                ];
                break;
        }

        // Compute signature
        $request['transaction']['order']['signature'] = $this->computeSignature(
            $order->total,
            'COP',
            $referenceCode
        );

        return $request;
    }

    /**
     * MD5(ApiKey~merchantId~referenceCode~tx_value~currency)
     */
    public function computeSignature(float $amount, string $currency, string $referenceCode): string
    {
        $config = $this->configurar();
        $string = "{$config['api_key']}~{$config['merchant_id']}~{$referenceCode}~{$amount}~{$currency}";
        return md5($string);
    }

    /**
     * Verify webhook signature
     * MD5(apiKey~merchant_id~reference_sale~new_value~currency~state_pol)
     */
    private function verifySignature(array $payload): bool
    {
        $config = $this->configurar();
        $value = number_format(round((float) ($payload['value'] ?? 0), 1), 1, '.', '');

        $newSign = md5(implode('~', [
            $config['api_key'],
            $config['merchant_id'],
            $payload['reference_sale'] ?? '',
            $value,
            $payload['currency'] ?? 'COP',
            $payload['state_pol'] ?? '',
        ]));

        return hash_equals($newSign, $payload['sign'] ?? '');
    }

    private function mapState(string $state): string
    {
        return match ($state) {
            'APPROVED' => PaymentStatusEnum::APROBADO->value,
            'DECLINED', 'EXPIRED' => PaymentStatusEnum::RECHAZADO->value,
            default => PaymentStatusEnum::PENDIENTE->value,
        };
    }

    private function extractReferenceSale(Payment $payment): string
    {
        $payload = $payment->payload ?? [];
        $txResponse = $payload['transactionResponse'] ?? [];
        return $txResponse['orderId'] ?? $payment->reference ?? '';
    }
}

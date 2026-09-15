# Plan de Implementación PayU — Backend Laravel

## Arquitectura General

```
Frontend (Nuxt)                    Backend (Laravel)                 PayU API
     │                                   │                              │
     │  POST /pedidos/:id/pagar          │                              │
     │  { provider: 'payu',              │                              │
     │    reference: '{payload JSON}' }  │                              │
     │ ─────────────────────────────────>│                              │
     │                                   │  POST /payments-api/4.0/     │
     │                                   │  service.cgi                │
     │                                   │ ───────────────────────────>│
     │                                   │                             │
     │                                   │  <── PayUResponse ──────────│
     │                                   │                             │
     │  <── Order actualizado ───────────│                             │
     │                                   │                             │
     │                                   │  POST /webhooks/pagos/payu  │
     │                                   │ <────────────────────────── │
     │                                   │  (webhook confirmación)     │
```

## 1. Configuración

### `config/payments.php` — Agregar sección PayU

```php
'payu' => [
    'api_login'      => env('PAYU_API_LOGIN'),
    'api_key'        => env('PAYU_API_KEY'),
    'merchant_id'    => env('PAYU_MERCHANT_ID'),
    'account_id_co'  => env('PAYU_ACCOUNT_ID_CO', '512321'),
    'test_mode'      => env('PAYU_TEST_MODE', true),
    'api_url'        => env('PAYU_API_URL', 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi'),
    'webhook_secret' => env('PAYU_WEBHOOK_SECRET'),
    'response_url'   => env('PAYU_RESPONSE_URL'),
    'notify_url'     => env('PAYU_NOTIFY_URL'),
],
```

### `.env` — Variables de entorno

```env
PAYU_API_LOGIN=pRRXKOl8ikMmt9u
PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
PAYU_MERCHANT_ID=508029
PAYU_ACCOUNT_ID_CO=512321
PAYU_TEST_MODE=true
PAYU_API_URL=https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi
PAYU_NOTIFY_URL=https://tu-dominio.com/api/webhooks/pagos/payu
PAYU_RESPONSE_URL=https://tu-dominio.com/checkout/pago/respuesta
```

## 2. Modelo de Base de Datos

### Migration: `create_payu_transactions_table`

```php
Schema::create('payu_transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();

    // PayU response data
    $table->string('payu_order_id')->nullable();        // ID de PayU
    $table->string('transaction_id')->nullable();        // ID de transacción
    $table->string('state')->default('PENDING');         // APPROVED, DECLINED, PENDING, ERROR
    $table->string('response_code')->nullable();
    $table->text('response_message')->nullable();
    $table->string('authorization_code')->nullable();
    $table->string('trazability_code')->nullable();
    $table->string('payment_method')->nullable();        // VISA, PSE, NEQUI, etc.
    $table->string('payment_network')->nullable();       // Red de pago

    // Request data (for debugging)
    $table->json('request_payload')->nullable();
    $table->json('response_payload')->nullable();

    // Device fingerprint
    $table->string('device_session_id')->nullable();
    $table->string('ip_address')->nullable();

    // Timestamps
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();

    // Indexes
    $table->index('payu_order_id');
    $table->index('transaction_id');
    $table->index('state');
});
```

### Migration: Add payu fields to payments table

```php
Schema::table('payments', function (Blueprint $table) {
    $table->string('transaction_id')->nullable()->change();
    $table->text('reference')->nullable()->change();
});
```

## 3. Servicio PayU

### `app/Services/PayuService.php`

```php
<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PayuTransaction;
use App\Services\Payment\PaymentException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayuService
{
    private array $config;
    private string $apiUrl;
    private string $apiKey;
    private string $apiLogin;
    private string $merchantId;
    private string $accountId;
    private bool $testMode;

    public function __construct()
    {
        $this->config = config('payments.payu');
        $this->apiUrl = $this->config['api_url'];
        $this->apiKey = $this->config['api_key'];
        $this->apiLogin = $this->config['api_login'];
        $this->merchantId = $this->config['merchant_id'];
        $this->accountId = $this->config['account_id_co'];
        $this->testMode = $this->config['test_mode'];
    }

    /**
     * Process a PayU transaction
     */
    public function processPayment(Order $order, array $payload): PayuTransaction
    {
        $paymentMethod = $payload['payment_method'];

        // Build the PayU request
        $payuRequest = $this->buildTransaction($order, $payload);

        // Create local transaction record
        $transaction = PayuTransaction::create([
            'order_id' => $order->id,
            'payment_method' => $paymentMethod,
            'state' => 'PENDING',
            'device_session_id' => $payload['device_session_id'] ?? null,
            'ip_address' => $payload['ip_address'] ?? request()->ip(),
            'request_payload' => $payuRequest,
        ]);

        // Send to PayU
        $response = $this->sendToPayu($payuRequest);

        // Process response
        $this->processResponse($transaction, $response, $order);

        return $transaction;
    }

    /**
     * Build the full PayU SUBMIT_TRANSACTION request
     */
    private function buildTransaction(Order $order, array $payload): array
    {
        $referenceCode = 'ORDER-' . $order->id . '-' . time();
        $buyer = $order->user;
        $address = $order->address;

        $buyerData = [
            'merchantBuyerId' => (string) $buyer->id,
            'fullName' => $buyer->nombre,
            'emailAddress' => $buyer->email,
            'contactPhone' => $buyer->telefono ?? '',
            'dniNumber' => (string) $buyer->id,
        ];

        $addressData = $address ? [
            'street1' => $address->direccion,
            'street2' => '',
            'city' => $address->ciudad,
            'state' => $address->ciudad,
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
        $base = round($order->total / (1 + $taxRate));
        $tax = $order->total - $base;

        $request = [
            'language' => 'es',
            'command' => 'SUBMIT_TRANSACTION',
            'merchant' => [
                'apiKey' => $this->apiKey,
                'apiLogin' => $this->apiLogin,
            ],
            'transaction' => [
                'order' => [
                    'accountId' => $this->accountId,
                    'referenceCode' => $referenceCode,
                    'description' => "Pedido #{$order->id}",
                    'language' => 'es',
                    'notifyUrl' => $this->config['notify_url'],
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
                    'fullName' => $buyer->nombre,
                    'emailAddress' => $buyer->email,
                    'contactPhone' => $buyer->telefono ?? '',
                    'dniNumber' => (string) $buyer->id,
                    'billingAddress' => $addressData,
                ],
                'type' => 'AUTHORIZATION_AND_CAPTURE',
                'paymentMethod' => $payload['payment_method'],
                'paymentCountry' => 'CO',
                'deviceSessionId' => $payload['device_session_id'] ?? md5(uniqid()),
                'ipAddress' => $payload['ip_address'] ?? request()->ip(),
                'cookie' => request()->cookie('_ga', md5(uniqid())),
                'userAgent' => request()->userAgent(),
            ],
            'test' => $this->testMode,
        ];

        // Add method-specific fields
        $request = $this->addMethodFields($request, $payload);

        // Compute signature
        $request['transaction']['order']['signature'] = $this->computeSignature(
            $order->total,
            'COP',
            $referenceCode
        );

        return $request;
    }

    /**
     * Add method-specific fields to the request
     */
    private function addMethodFields(array $request, array $payload): array
    {
        $method = $payload['payment_method'];

        switch ($method) {
            case 'VISA':
            case 'MASTERCARD':
            case 'AMEX':
            case 'DINERS':
            case 'CODENSA':
                $request['transaction']['creditCard'] = [
                    'number' => $payload['card_number'],
                    'securityCode' => $payload['card_security_code'],
                    'expirationDate' => $payload['card_expiration_date'],
                    'name' => $payload['card_name'],
                ];
                $request['transaction']['extraParameters'] = [
                    'INSTALLMENTS_NUMBER' => $payload['installments'] ?? 1,
                ];
                break;

            case 'PSE':
                $request['transaction']['extraParameters'] = [
                    'FINANCIAL_INSTITUTION_CODE' => $payload['pse_bank_code'],
                    'USER_TYPE' => $payload['pse_person_type'] ?? 'N',
                    'PSE_REFERENCE1' => $payload['ip_address'] ?? request()->ip(),
                    'PSE_REFERENCE2' => $payload['pse_document_type'] ?? 'CC',
                    'PSE_REFERENCE3' => $payload['pse_document_number'] ?? '',
                    'RESPONSE_URL' => $this->config['response_url'],
                ];
                break;

            case 'NEQUI':
                // Nequi uses phone number as identifier
                // The phone is sent via extraParameters
                $request['transaction']['extraParameters'] = [
                    'PHONE_NUMBER' => $payload['nequi_phone'] ?? '',
                ];
                break;

            case 'BANCOLOMBIA_BUTTON':
                $request['transaction']['extraParameters'] = [
                    'DESCRIPTION' => 'Pago en tienda',
                ];
                break;

            case 'INTEROPERABLE_QR':
            case 'EFECTY':
            case 'BALOTO':
            case 'OTHERS_CASH':
                // No extra fields needed
                break;
        }

        return $request;
    }

    /**
     * Compute MD5 signature for PayU
     * Format: ApiKey~merchantId~referenceCode~tx_value~currency
     */
    public function computeSignature(float $amount, string $currency, string $referenceCode): string
    {
        $string = "{$this->apiKey}~{$this->merchantId}~{$referenceCode}~{$amount}~{$currency}";
        return md5($string);
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(array $payload): bool
    {
        $sign = $payload['sign'] ?? '';
        $expectedSign = $this->computeWebhookSignature(
            $payload['value'] ?? '0',
            $payload['currency'] ?? 'COP',
            $payload['reference_sale'] ?? '',
            $payload['state_pol'] ?? ''
        );

        return hash_equals($expectedSign, $sign);
    }

    /**
     * Compute webhook confirmation signature
     * Format: apiKey~merchant_id~reference_sale~new_value~currency~state_pol
     */
    private function computeWebhookSignature(string $value, string $currency, string $referenceSale, string $state): string
    {
        $newValue = number_format(round((float) $value, 1), 1, '.', '');
        $string = "{$this->apiKey}~{$this->merchantId}~{$referenceSale}~{$newValue}~{$currency}~{$state}";
        return md5($string);
    }

    /**
     * Send request to PayU API
     */
    private function sendToPayu(array $payload): array
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->apiUrl, $payload);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('PayU API error: ' . $e->getMessage());
            throw new PaymentException('Error al comunicarse con PayU: ' . $e->getMessage());
        }
    }

    /**
     * Process PayU response and update transaction + order
     */
    private function processResponse(PayuTransaction $transaction, array $response, Order $order): void
    {
        $transaction->update([
            'response_payload' => $response,
        ]);

        $txResponse = $response['transactionResponse'] ?? null;

        if (!$txResponse || ($response['code'] ?? '') !== 'SUCCESS') {
            $transaction->update([
                'state' => 'ERROR',
                'response_code' => $response['code'] ?? 'UNKNOWN',
                'response_message' => $response['error'] ?? 'Error desconocido',
            ]);
            return;
        }

        $state = $txResponse['state'] ?? 'ERROR';

        $transaction->update([
            'payu_order_id' => (string) ($txResponse['orderId'] ?? ''),
            'transaction_id' => $txResponse['transactionId'] ?? null,
            'state' => $state,
            'response_code' => $txResponse['responseCode'] ?? null,
            'response_message' => $txResponse['responseMessage'] ?? null,
            'authorization_code' => $txResponse['authorizationCode'] ?? null,
            'trazability_code' => $txResponse['trazabilityCode'] ?? null,
            'payment_network' => $txResponse['additionalInfo']['paymentNetwork'] ?? null,
            'paid_at' => in_array($state, ['APPROVED']) ? now() : null,
        ]);

        // Update order payment status
        if ($state === 'APPROVED') {
            $order->update(['payment_status' => 'pagado']);

            // Create Payment record
            $payment = \App\Models\Payment::create([
                'order_id' => $order->id,
                'provider' => 'payu',
                'transaction_id' => $transaction->transaction_id,
                'reference' => $transaction->payu_order_id,
                'amount' => $order->total,
                'currency' => 'COP',
                'status' => 'aprobado',
                'payload' => $txResponse,
            ]);

            $transaction->update(['payment_id' => $payment->id]);
        } elseif ($state === 'DECLINED') {
            $order->update(['payment_status' => 'fallido']);
        }
    }

    /**
     * Process webhook notification from PayU
     */
    public function processWebhook(array $payload): void
    {
        // Verify signature
        if (!$this->verifyWebhookSignature($payload)) {
            Log::warning('PayU webhook: Invalid signature');
            throw new PaymentException('Invalid webhook signature');
        }

        $referenceSale = $payload['reference_sale'] ?? '';
        $statePol = $payload['state_pol'] ?? '';

        // Find transaction by reference code
        $transaction = PayuTransaction::where('request_payload->transaction->order->referenceCode', $referenceSale)
            ->orWhere('payu_order_id', $payload['transaction_id'] ?? '')
            ->first();

        if (!$transaction) {
            Log::warning("PayU webhook: Transaction not found for reference {$referenceSale}");
            return;
        }

        // Map PayU state to our state
        $stateMap = [
            '4' => 'APPROVED',
            '6' => 'DECLINED',
            '7' => 'PENDING',
            '104' => 'ERROR',
        ];

        $newState = $stateMap[$statePol] ?? 'ERROR';

        $transaction->update([
            'state' => $newState,
            'authorization_code' => $payload['authorization_code'] ?? null,
            'response_payload' => array_merge($transaction->response_payload ?? [], $payload),
            'paid_at' => $newState === 'APPROVED' ? ($transaction->paid_at ?? now()) : null,
        ]);

        // Update order
        $order = $transaction->order;
        if ($newState === 'APPROVED' && $order->payment_status !== 'pagado') {
            $order->update(['payment_status' => 'pagado']);

            // Create Payment record if not exists
            if (!$transaction->payment_id) {
                $payment = \App\Models\Payment::create([
                    'order_id' => $order->id,
                    'provider' => 'payu',
                    'transaction_id' => $payload['transaction_id'] ?? null,
                    'reference' => $payload['reference_sale'] ?? null,
                    'amount' => (float) ($payload['value'] ?? $order->total),
                    'currency' => $payload['currency'] ?? 'COP',
                    'status' => 'aprobado',
                    'payload' => $payload,
                ]);
                $transaction->update(['payment_id' => $payment->id]);
            }

            // Send confirmation notification
            // TODO: Send order confirmation email + push notification
        } elseif ($newState === 'DECLINED') {
            $order->update(['payment_status' => 'fallido']);
        }
    }

    /**
     * Get PSE banks list from PayU
     */
    public function getPseBanks(): array
    {
        $payload = [
            'language' => 'es',
            'command' => 'GET_BANKS_LIST',
            'merchant' => [
                'apiLogin' => $this->apiLogin,
                'apiKey' => $this->apiKey,
            ],
            'test' => $this->testMode,
            'bankListInformation' => [
                'paymentMethod' => 'PSE',
                'paymentCountry' => 'CO',
            ],
        ];

        $response = $this->sendToPayu($payload);

        return $response['banks'] ?? [];
    }
}
```

## 4. Controlador Webhook

### `app/Http/Controllers/WebhookController.php` — Actualizar

```php
public function handlePayu(Request $request)
{
    try {
        $payload = $request->all();

        Log::info('PayU webhook received', [
            'reference' => $payload['reference_sale'] ?? null,
            'state' => $payload['state_pol'] ?? null,
        ]);

        app(PayuService::class)->processWebhook($payload);

        return response()->json(['status' => 'ok']);
    } catch (PaymentException $e) {
        Log::warning('PayU webhook error: ' . $e->getMessage());
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 400);
    } catch (\Exception $e) {
        Log::error('PayU webhook exception: ' . $e->getMessage());
        return response()->json(['status' => 'error'], 500);
    }
}
```

## 5. Rutas

### `routes/api.php` — Agregar

```php
// PayU PSE banks list
Route::get('/pagos/payu/bancos-pse', function () {
    $banks = app(\App\Services\PayuService::class)->getPseBanks();
    return ApiResponse::success(['banks' => $banks]);
})->middleware(['auth:sanctum']);

// PayU webhook (sin auth)
Route::post('/webhooks/pagos/payu', [WebhookController::class, 'handlePayu']);
```

## 6. Seguridad

### Checklist de seguridad:

1. **Firma MD5**: El backend calcula la firma con `ApiKey~merchantId~referenceCode~amount~currency`. El frontend NUNCA tiene acceso a la API Key.

2. **Verificación de webhook**: Al recibir notificaciones PayU, el backend verifica la firma MD5 antes de procesar.

3. **Idempotencia**: El `referenceCode` es único por transacción. Si PayU envía el mismo webhook dos veces, se detecta por el `reference_sale`.

4. **Rate limiting**: Aplicar rate limiting al endpoint de pagos para prevenir abuso.

5. **PCI Compliance**: La tarjeta de crédito se envía al backend una sola vez y se procesa inmediatamente. Nunca se almacena.

6. **HTTPS**: Todos los endpoints de pago deben usar HTTPS en producción.

7. **Logging**: Todas las transacciones se loguean para auditoría.

8. **Device Session ID**: Se genera un ID único por transacción para detección de fraude.

9. **IP Address**: Se captura la IP del cliente para los registros de PayU.

10. **Webhook idempotencia**: Si el webhook llega múltiples veces, se procesa solo la primera vez verificando el estado actual.

## 7. Flujo Completo

```
1. Usuario selecciona método de pago y llena formulario
2. Frontend envía POST /pedidos/:id/pagar con { provider: 'payu', reference: JSON payload }
3. Backend decodifica el payload y construye la request PayU
4. Backend calcula la firma MD5 y envía a PayU API
5. Backend guarda la transacción en payu_transactions
6. Backend retorna la respuesta al frontend
7. Si es APPROVED → se crea el Payment record y se actualiza el order
8. Si es PENDING (Nequi, QR) → se espera el webhook de confirmación
9. PayU envía webhook a /webhooks/pagos/payu
10. Backend verifica la firma y actualiza el estado
11. Se envía notificación al cliente (email + push)
```

## 8. Pruebas

### Test credentials (sandbox):

| Método | Datos de prueba |
|--------|----------------|
| VISA | 4037997623271984 / CVV: 321 / Nombre: APPROVED |
| MASTERCARD | 5471300000000003 / CVV: 777 / Nombre: APPROVED |
| PSE | Banco: 1022 (Bogotá) / CC: 123456789 |
| Nequi | Cualquier número de 10 dígitos |
| QR | Escanear con cualquier bolsillo digital |
| Efecty | Genera referencia, simular pago en backend |

### Para simular resultados:

- **APPROVED**: Nombre en tarjeta = "APPROVED", CVV = 777
- **DECLINED**: Nombre en tarjeta = "REJECTED", CVV = 666

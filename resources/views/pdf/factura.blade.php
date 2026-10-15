<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura {{ $order->numero_factura }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #0B1220; font-size: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563EB; padding-bottom: 14px; margin-bottom: 18px; }
        .brand { font-size: 20px; font-weight: bold; color: #2563EB; }
        .muted { color: #64748B; font-size: 11px; }
        .factura-num { text-align: right; }
        .factura-num .num { font-size: 16px; font-weight: bold; }
        .bloque { margin-bottom: 16px; }
        .bloque h3 { font-size: 11px; text-transform: uppercase; color: #64748B; margin-bottom: 6px; letter-spacing: 0.5px; }
        .cols { display: flex; justify-content: space-between; }
        .cols > div { width: 48%; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #F1F5F9; font-size: 10px; text-transform: uppercase; color: #475569; padding: 8px 6px; text-align: left; border-bottom: 1px solid #CBD5E1; }
        td { padding: 7px 6px; border-bottom: 1px solid #E2E8F0; font-size: 11px; }
        .num-col { text-align: right; }
        .totales { width: 260px; margin-left: auto; margin-top: 12px; }
        .totales td { border: none; padding: 4px 6px; }
        .totales .total td { font-weight: bold; font-size: 13px; border-top: 1px solid #94A3B8; padding-top: 8px; }
        .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">{{ $tienda['nombre'] }}</div>
            @if($tienda['tagline'])
                <div class="muted">{{ $tienda['tagline'] }}</div>
            @endif
            @if($tienda['direccion'])
                <div class="muted">{{ $tienda['direccion'] }}</div>
            @endif
            @if($tienda['email'])
                <div class="muted">{{ $tienda['email'] }}</div>
            @endif
        </div>
        <div class="factura-num">
            <div class="muted">FACTURA DE VENTA</div>
            <div class="num">{{ $order->numero_factura }}</div>
            <div class="muted">Fecha: {{ ($order->fecha_emision ?? $order->created_at)->format('d/m/Y') }}</div>
            <div class="muted">Pedido: {{ $order->numero }}</div>
        </div>
    </div>

    <div class="cols bloque">
        <div>
            <h3>Cliente</h3>
            <div><b>{{ $order->billing_nombre ?? $order->user?->nombre ?? 'Cliente' }}</b></div>
            @if($order->billing_nit)
                <div class="muted">NIT/Cédula: {{ $order->billing_nit }}</div>
            @endif
            @if($order->billing_razon_social)
                <div class="muted">{{ $order->billing_razon_social }}</div>
            @endif
            @if($order->user?->email)
                <div class="muted">{{ $order->user->email }}</div>
            @endif
        </div>
        <div>
            <h3>Envío</h3>
            @if($order->address)
                <div>{{ $order->address->direccion }}</div>
                <div class="muted">{{ $order->address->ciudad }}{{ $order->address->codigo_postal ? ' · ' . $order->address->codigo_postal : '' }}</div>
                <div class="muted">{{ $order->address->pais }}</div>
            @else
                <div class="muted">{{ $order->billing_direccion ?? '—' }}</div>
            @endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th class="num-col">Precio unit.</th>
                <th class="num-col">Cant.</th>
                <th class="num-col">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td>{{ $item->sku ?? '—' }}</td>
                    <td class="num-col">${{ number_format((float) $item->price, 2, ',', '.') }}</td>
                    <td class="num-col">{{ $item->quantity }}</td>
                    <td class="num-col">${{ number_format((float) $item->subtotal, 2, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totales">
        <tr>
            <td>Subtotal</td>
            <td class="num-col">${{ number_format((float) $order->subtotal, 2, ',', '.') }}</td>
        </tr>
        @if((float) $order->discount > 0)
            <tr>
                <td>Descuento</td>
                <td class="num-col">-${{ number_format((float) $order->discount, 2, ',', '.') }}</td>
            </tr>
        @endif
        <tr>
            <td>Envío</td>
            <td class="num-col">${{ number_format((float) $order->shipping_cost, 2, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Impuestos</td>
            <td class="num-col">${{ number_format((float) $order->tax, 2, ',', '.') }}</td>
        </tr>
        <tr class="total">
            <td>Total ({{ $order->currency }})</td>
            <td class="num-col">${{ number_format((float) $order->total, 2, ',', '.') }}</td>
        </tr>
    </table>

    <div class="footer">
        Documento generado electrónicamente — {{ $tienda['nombre'] }} · {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>

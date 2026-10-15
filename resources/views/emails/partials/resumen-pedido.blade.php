@php
    $direccion = $order->address;
@endphp

<div class="detalle">
    <p class="detalle-titulo">Pedido {{ $order->numero }}</p>
    @if($order->fecha_emision)
        <p class="detalle-sub"><b>Fecha:</b> {{ $order->fecha_emision->format('d/m/Y H:i') }}</p>
    @else
        <p class="detalle-sub"><b>Fecha:</b> {{ $order->created_at?->format('d/m/Y H:i') }}</p>
    @endif
    @if($direccion)
        <p class="detalle-sub"><b>Envío a:</b> {{ $direccion->direccion }}, {{ $direccion->ciudad }}</p>
    @endif
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
        <tr>
            <th style="text-align: left; font-size: 12px; color: #64748B; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.2);">Producto</th>
            <th style="text-align: center; font-size: 12px; color: #64748B; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.2);">Cant.</th>
            <th style="text-align: right; font-size: 12px; color: #64748B; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.2);">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->items as $item)
            <tr>
                <td style="font-size: 13px; color: #0B1220; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.1);">{{ $item->name }}</td>
                <td style="font-size: 13px; color: #64748B; padding: 8px 0; text-align: center; border-bottom: 1px solid rgba(100,116,139,0.1);">{{ $item->quantity }}</td>
                <td style="font-size: 13px; color: #0B1220; padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(100,116,139,0.1);">${{ number_format((float) $item->subtotal, 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="detalle">
    <p class="detalle-sub"><b>Subtotal:</b> ${{ number_format((float) $order->subtotal, 0, ',', '.') }}</p>
    @if((float) $order->discount > 0)
        <p class="detalle-sub"><b>Descuento:</b> -${{ number_format((float) $order->discount, 0, ',', '.') }}</p>
    @endif
    <p class="detalle-sub"><b>Envío:</b> ${{ number_format((float) $order->shipping_cost, 0, ',', '.') }}</p>
    <p class="detalle-sub"><b>Impuestos:</b> ${{ number_format((float) $order->tax, 0, ',', '.') }}</p>
    <p class="detalle-titulo" style="margin-top: 10px;">Total: ${{ number_format((float) $order->total, 0, ',', '.') }} {{ $order->currency }}</p>
</div>

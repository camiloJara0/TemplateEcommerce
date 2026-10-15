@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">Reembolso procesado</p>
    <p class="texto">Procesamos el reembolso de <b>${{ number_format($monto, 0, ',', '.') }}</b> correspondiente al pedido <b>{{ $order->numero }}</b>. El plazo de acreditación depende de tu medio de pago.</p>

    <div class="centro">
        <a class="btn btn-secundario" href="{{ config('app.url') }}/cuenta/pedidos/{{ $order->id }}">Ver mi pedido</a>
    </div>
@endsection

@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">¡Pago confirmado!</p>
    <p class="texto">Aprobamos el pago de tu pedido <b>{{ $order->numero }}</b>. En las próximas horas lo despacharemos y te enviaremos el número de guía.</p>

    @include('emails.partials.resumen-pedido')

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}/cuenta/pedidos/{{ $order->id }}">Ver mi pedido</a>
    </div>
@endsection

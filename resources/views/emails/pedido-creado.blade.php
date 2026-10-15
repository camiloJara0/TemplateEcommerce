@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">¡Hola, {{ $order->user?->nombre ?? 'cliente' }}!</p>
    <p class="texto">Recibimos tu pedido y nuestro equipo ya está preparando tu envío.</p>

    @include('emails.partials.resumen-pedido')

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}/cuenta/pedidos/{{ $order->id }}">Ver mi pedido</a>
    </div>
@endsection

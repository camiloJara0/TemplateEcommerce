@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">Pedido cancelado</p>
    <p class="texto">Tu pedido <b>{{ $order->numero }}</b> fue cancelado. Si no reconoces esta acción o tienes dudas, contáctanos.</p>

    @include('emails.partials.resumen-pedido')

    <div class="centro">
        <a class="btn btn-secundario" href="{{ config('app.url') }}/ayuda">Necesito ayuda</a>
    </div>
@endsection

@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">¡Pedido entregado!</p>
    <p class="texto">Tu pedido <b>{{ $order->numero }}</b> fue entregado. ¡Gracias por comprar con nosotros!</p>
    <p class="texto">Si algo no salió como esperabas, puedes dejar tu reseña desde tu cuenta.</p>

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}/cuenta/pedidos/{{ $order->id }}">Ver mi pedido</a>
        <a class="btn btn-secundario" href="{{ config('app.url') }}" style="margin-left: 8px;">Seguir comprando</a>
    </div>
@endsection

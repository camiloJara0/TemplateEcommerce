@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">¡Tu pedido va en camino!</p>
    <p class="texto">Despachamos tu pedido <b>{{ $order->numero }}</b>. Ya puedes seguir su recorrido.</p>

    @if($shipment)
        <div class="estados">
            @if($shipment->tracking_number)
                <span class="estado-pill">Guía: <b>{{ $shipment->tracking_number }}</b></span>
            @endif
            <span class="estado-pill">{{ ucfirst(str_replace('_', ' ', $shipment->carrier)) }}</span>
            @if($shipment->estimated_delivery)
                <span class="estado-pill">Llegada estimada: {{ $shipment->estimated_delivery->format('d/m/Y') }}</span>
            @endif
        </div>

        <div class="centro">
            <a class="btn" href="{{ config('app.url') }}/seguimiento?guia={{ $shipment->tracking_number }}">Seguir mi pedido</a>
        </div>
    @else
        <div class="centro">
            <a class="btn" href="{{ config('app.url') }}/cuenta/pedidos/{{ $order->id }}">Ver mi pedido</a>
        </div>
    @endif

    @include('emails.partials.resumen-pedido')
@endsection

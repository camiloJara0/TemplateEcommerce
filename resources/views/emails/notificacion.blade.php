@extends('emails.layouts.app')

@section('contenido')
    <p class="texto">{{ $cuerpo }}</p>

    @if(!empty($detalles))
        <div class="detalle">
            @foreach($detalles as $etiqueta => $valor)
                <p class="detalle-sub"><b>{{ $etiqueta }}:</b> {{ $valor }}</p>
            @endforeach
        </div>
    @endif

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}">Ir a {{ config('app.name') }}</a>
    </div>
@endsection
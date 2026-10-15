@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">Nuevo mensaje de contacto</p>
    <p class="texto">Recibiste un mensaje desde el formulario de contacto de la tienda.</p>

    <div class="detalle">
        <p class="detalle-sub"><b>Nombre:</b> {{ $mensaje->nombre ?? '—' }}</p>
        <p class="detalle-sub"><b>Correo:</b> {{ $mensaje->correo }}</p>
        @if($mensaje->nit)
            <p class="detalle-sub"><b>NIT:</b> {{ $mensaje->nit }}</p>
        @endif
        <p class="detalle-sub"><b>Asunto:</b> {{ $mensaje->asunto }}</p>
        <p class="detalle-sub"><b>Fecha:</b> {{ $mensaje->created_at?->format('d/m/Y H:i') }}</p>
    </div>

    <div class="detalle">
        <p class="detalle-titulo">Mensaje</p>
        <p class="detalle-sub">{{ $mensaje->mensaje }}</p>
    </div>

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}/admin/comunidad">Ver en el panel</a>
    </div>
@endsection

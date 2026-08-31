@extends('emails.layouts.app')

@section('contenido')
    <h2 class="saludo">Hola, {{ $correo }}</h2>
    <p class="texto">Recibimos una solicitud para <b>verificar tu cuenta</b>. Usa el siguiente código para continuar:</p>

    <div class="detalle" style="text-align:center; padding:28px 20px;">
        <p class="detalle-sub" style="font-size:12px; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px;">Tu código de verificación</p>
        <span style="font-size:34px; font-weight:700; letter-spacing:6px; color:#2563EB;">{{ $codigo }}</span>
    </div>

    <p class="texto" style="text-align:center;">Este código expira en <b>15 minutos</b>.</p>

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}">Continuar en {{ config('app.name') }}</a>
    </div>
@endsection

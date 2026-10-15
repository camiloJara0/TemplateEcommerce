@extends('emails.layouts.app')

@section('contenido')
    <p class="saludo">¡Tu reseña ya es pública!</p>
    <p class="texto">Aprobamos tu reseña sobre <b>{{ $review->product?->name ?? 'el producto' }}</b>. Gracias por compartir tu experiencia.</p>

    <div class="detalle">
        <p class="detalle-titulo">Calificación: {{ $review->rating }}/5</p>
        @if($review->comment)
            <p class="detalle-sub">“{{ $review->comment }}”</p>
        @endif
    </div>

    <div class="centro">
        <a class="btn" href="{{ config('app.url') }}/producto/{{ $review->product?->slug }}">Ver producto</a>
    </div>
@endsection

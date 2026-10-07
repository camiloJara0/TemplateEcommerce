<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>{{ $campaign->asunto }}</title>
<style>
body{margin:0;padding:0;background:#f4f4f4;font-family:{{ $tipografia ?? 'Arial, Helvetica, sans-serif' }};-webkit-text-size-adjust:100%;}
.wrapper{width:100%;background:#f4f4f4;padding:40px 15px;box-sizing:border-box;}
.container{max-width:650px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);}
.header{background:{{ $colorPrimario ?? '#2563EB' }};padding:36px 40px;text-align:center;}
.logo{color:#fff;font-size:30px;font-weight:700;margin:0;}
.logo-img{max-height:48px;max-width:220px;margin:0 auto 8px;display:block;}
.subject{color:#ffffffcc;margin-top:8px;font-size:15px;}
.hero{padding:40px 40px 10px;text-align:center;}
.hero-title{font-size:32px;font-weight:700;color:#222;margin:0 0 14px;}
.hero-content{color:#666;line-height:1.8;font-size:16px;text-align:left;}
.greeting{color:#333;font-size:16px;margin:0 0 12px;text-align:left;}
.section{padding:20px 40px 10px;}
.section-title{font-size:21px;font-weight:700;color:#111;margin:0 0 22px;text-align:center;}
.coupon{margin:25px 40px 0;background:#fff8e6;border:2px dashed {{ $colorPrimario ?? '#2563EB' }};border-radius:14px;padding:24px;text-align:center;}
.coupon-label{font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#8a6d1a;margin:0 0 10px;font-weight:700;}
.coupon-code{font-size:30px;font-weight:800;letter-spacing:4px;color:#111;margin:0 0 10px;}
.coupon-desc{font-size:14px;color:#666;margin:0 0 16px;}
.media-card{border-radius:14px;overflow:hidden;margin-bottom:20px;background:#f0f0f0;}
.media-card img{width:100%;display:block;border:0;}
.product-card{border:1px solid #ececec;border-radius:12px;overflow:hidden;margin-bottom:22px;background:#fff;}
.product-image{width:100%;display:block;border:0;background:#f7f7f7;}
.product-body{padding:20px;}
.product-name{font-size:18px;font-weight:600;margin:0 0 8px;color:#111;}
.product-description{color:#666;margin:0 0 14px;font-size:14px;line-height:1.6;}
.product-price{font-size:22px;font-weight:700;color:{{ $colorPrimario ?? '#2563EB' }};margin:0;}
.product-old-price{font-size:15px;color:#999;text-decoration:line-through;font-weight:400;margin-left:8px;}
.button{display:inline-block;margin-top:16px;padding:13px 26px;background:{{ $colorPrimario ?? '#2563EB' }};color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;}
.button-secondary{background:{{ $colorSecundario ?? '#3B82F6' }};}
.footer{background:#fafafa;text-align:center;padding:30px 25px;color:#777;font-size:13px;line-height:1.7;}
.footer a{color:{{ $colorPrimario ?? '#2563EB' }};text-decoration:underline;}
.footer-contact{margin-top:14px;font-size:12px;color:#999;}
@media only screen and (max-width:600px){
  .header,.hero,.section{padding-left:22px;padding-right:22px;}
  .coupon{margin-left:22px;margin-right:22px;}
  .hero-title{font-size:26px;}
}
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">

    <div class="header">
      @if(!empty($logo))
        <img class="logo-img" src="{{ $logo }}" alt="{{ $nombreTienda }}">
      @endif
      <h1 class="logo">{{ $nombreTienda }}</h1>
      <div class="subject">{{ $campaign->asunto }}</div>
    </div>

    <div class="hero">
      <h2 class="hero-title">{{ $campaign->titulo }}</h2>
      @if(!empty($nombreDestinatario))
        <p class="greeting">Hola {{ $nombreDestinatario }},</p>
      @endif
      <div class="hero-content">{!! nl2br(e($campaign->contenido)) !!}</div>
    </div>

    @if(!empty($cupon))
      <div class="coupon">
        <p class="coupon-label">Cupón exclusivo para ti</p>
        <p class="coupon-code">{{ $cupon->code }}</p>
        <p class="coupon-desc">
          @if($cupon->type === 'percent')
            {{ rtrim(rtrim(number_format((float) $cupon->value, 0, ',', '.'), '0'), ',') }}% de descuento
          @elseif($cupon->type === 'fixed')
            ${{ number_format((float) $cupon->value, 0, ',', '.') }} de descuento
          @else
            Envío gratis
          @endif
          @if($cupon->min_subtotal)
            · compra mínima ${{ number_format((float) $cupon->min_subtotal, 0, ',', '.') }}
          @endif
          @if($cupon->expires_at)
            · válido hasta {{ \Illuminate\Support\Carbon::parse($cupon->expires_at)->format('d/m/Y') }}
          @endif
        </p>
        <a class="button" href="{{ $tiendaUrl }}?cupon={{ urlencode($cupon->code) }}">Usar cupón</a>
      </div>
    @endif

    @if($media->count())
      <div class="section">
        <div class="section-title">Novedades destacadas</div>
        @foreach($media->sortBy('orden') as $asset)
          @if($asset->tipo === 'Imagen')
            <div class="media-card"><img src="{{ $asset->url }}" alt="Promoción"></div>
          @elseif($asset->tipo === 'Video')
            <div class="media-card">
              <a href="{{ $asset->url }}" class="button button-secondary" style="display:block;border-radius:14px;">▶ Ver video promocional</a>
            </div>
          @endif
        @endforeach
      </div>
    @endif

    @if($items->count())
      <div class="section">
        <div class="section-title">Productos recomendados</div>
        @foreach($items->sortBy('orden') as $item)
          <div class="product-card">
            @if(!empty($item->imagen))
              <img class="product-image" src="{{ $item->imagen }}" alt="{{ $item->nombre }}">
            @endif
            <div class="product-body">
              <p class="product-name">{{ $item->nombre }}</p>
              <p class="product-description">{{ \Illuminate\Support\Str::limit(strip_tags($item->descripcion ?? ''), 130) }}</p>
              <p class="product-price">
                ${{ number_format((float) $item->precio, 0, ',', '.') }}
                @if(!empty($item->precio_descuento))
                  <span class="product-old-price">${{ number_format((float) $item->precio_descuento, 0, ',', '.') }}</span>
                @endif
              </p>
              <a class="button" href="{{ $item->url_producto }}">Ver producto</a>
            </div>
          </div>
        @endforeach
      </div>
    @endif

    <div class="footer">
      <strong>{{ $nombreTienda }}</strong>
      <br><br>
      Recibes este correo porque te encuentras suscrito a nuestras novedades y promociones.
      <br><br>
      <a href="{{ $unsubscribeUrl }}">Cancelar suscripción</a>
      <div class="footer-contact">
        @if(!empty($supportEmail)) Soporte: {{ $supportEmail }} · @endif
        @if(!empty($supportPhone)) {{ $supportPhone }} @endif
      </div>
    </div>

  </div>
</div>
</body>
</html>

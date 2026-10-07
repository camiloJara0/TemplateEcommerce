<?php

namespace App\Services;

use App\Mail\CampaignMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;

/**
 * Construye el contexto y renderiza el correo de una campaña.
 *
 * Se usa en los tres puntos de salida para garantizar que la vista previa
 * del panel, el correo de prueba y el envío masivo sean idénticos.
 */
class NewsletterService
{
    public function frontUrl(): string
    {
        return rtrim((string) config('app.front_url', 'http://localhost:3000'), '/');
    }

    public function ecommerce(): array
    {
        return [
            'nombre' => Setting::obtener('store_name', config('app.name')),
            'logo' => Setting::obtener('logo'),
            'support_email' => Setting::obtener('support_email'),
            'support_phone' => Setting::obtener('support_phone'),
            'color_primario' => Setting::obtener('color_primario', '#2563EB'),
            'color_secundario' => Setting::obtener('color_secundario', '#3B82F6'),
            'tipografia' => Setting::obtener('font_family', 'Arial, Helvetica, sans-serif'),
        ];
    }

    public function unsubscribeUrl(NewsletterSubscriber $subscriber): string
    {
        return $this->frontUrl() . '/baja-newsletter?token=' . urlencode($subscriber->token_aprobacion);
    }

    public function productos(NewsletterCampaign $campaign): array
    {
        $items = $campaign->relationLoaded('items')
            ? $campaign->items
            : $campaign->items()->with('product.images')->orderBy('orden')->get();

        return $items->map(function ($item) {
            $producto = $item->relationLoaded('product') ? $item->product : $item->product()->with('images')->first();

            if (!$producto) {
                return null;
            }

            return (object) [
                'nombre' => $producto->name,
                'descripcion' => $producto->description ?? '',
                'precio' => (float) ($producto->price_discount ?: $producto->price),
                'precio_descuento' => $producto->price_discount ? (float) $producto->price : null,
                'imagen' => $producto->images->first()?->url,
                'url_producto' => $this->frontUrl() . '/producto/' . $producto->slug,
                'orden' => $item->orden,
            ];
        })->filter()->values()->all();
    }

    /**
     * Colección de medios de la campaña (soporta campañas aún no persistidas).
     */
    public function medios(NewsletterCampaign $campaign)
    {
        return $campaign->relationLoaded('media')
            ? $campaign->media
            : $campaign->media()->orderBy('orden')->get();
    }

    /**
     * @param NewsletterSubscriber|array $destinatario suscriptor real o datos de prueba
     */
    public function render(NewsletterCampaign $campaign, $destinatario = null): string
    {
        $ecommerce = $this->ecommerce();
        $esSuscriptor = $destinatario instanceof NewsletterSubscriber;

        $datos = [
            'campaign' => $campaign,
            'nombreTienda' => $ecommerce['nombre'],
            'logo' => $ecommerce['logo'],
            'colorPrimario' => $ecommerce['color_primario'],
            'colorSecundario' => $ecommerce['color_secundario'],
            'tipografia' => $ecommerce['tipografia'],
            'supportEmail' => $ecommerce['support_email'],
            'supportPhone' => $ecommerce['support_phone'],
            'tiendaUrl' => $this->frontUrl(),
            'media' => $this->medios($campaign),
            'items' => collect($this->productos($campaign)),
            'cupon' => $campaign->relationLoaded('cupon') ? $campaign->cupon : $campaign->cupon()->first(),
            'nombreDestinatario' => $esSuscriptor
                ? ($destinatario->nombre ?? optional($destinatario->user)->nombre)
                : ($destinatario['nombre'] ?? null),
            'unsubscribeUrl' => $esSuscriptor
                ? $this->unsubscribeUrl($destinatario)
                : $this->frontUrl() . '/baja-newsletter?token=TOKEN',
        ];

        return View::make('emails.campaign', $datos)->render();
    }

    public function mailable(NewsletterCampaign $campaign, NewsletterSubscriber $subscriber): CampaignMail
    {
        return new CampaignMail(
            $campaign,
            $subscriber,
            $this->render($campaign, $subscriber)
        );
    }

    public function asunto(NewsletterCampaign $campaign): string
    {
        return Str::limit($campaign->asunto, 200, '');
    }

    /**
     * Crea los destinatarios pendientes de una campaña con los suscriptores activos.
     *
     * @return int cantidad de destinatarios listos
     */
    public function prepararDestinatarios(NewsletterCampaign $campaign): int
    {
        $activos = NewsletterSubscriber::activos()->get(['id', 'correo']);

        $campaign->recipients()->delete();

        $filas = $activos->map(fn ($s) => [
            'campaign_id' => $campaign->id,
            'subscriber_id' => $s->id,
            'correo' => $s->correo,
            'estado' => 'pendiente',
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        if ($filas) {
            $campaign->recipients()->insert($filas);
        }

        $campaign->update(['destinatarios' => count($filas)]);

        return count($filas);
    }

    public function urlProductoPorSlug(string $slug): string
    {
        $producto = Product::where('slug', $slug)->first(['slug']);

        return $producto ? $this->frontUrl() . '/producto/' . $producto->slug : $this->frontUrl();
    }
}

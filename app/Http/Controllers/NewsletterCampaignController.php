<?php

namespace App\Http\Controllers;

use App\Jobs\SendNewsletterCampaign;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterCampaignItem;
use App\Models\NewsletterCampaignMedia;
use App\Models\NewsletterSubscriber;
use App\Models\Product;
use App\Services\NewsletterService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class NewsletterCampaignController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->only(['estado', 'busqueda', 'fecha']);

        $campanas = NewsletterCampaign::with(['cupon:id,code,type,value', 'creador:id,nombre'])
            ->withCount(['items', 'media', 'recipients'])
            ->when($filtros['estado'] ?? null, fn ($q, $v) => $q->where('estado', $v))
            ->when($filtros['fecha'] ?? null, fn ($q, $v) => $q->whereDate('created_at', $v))
            ->when($filtros['busqueda'] ?? null, function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('titulo', 'like', "%{$v}%")
                        ->orWhere('asunto', 'like', "%{$v}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 12));

        return ApiResponse::success([
            'items' => $campanas->items(),
            'pagination' => [
                'total' => $campanas->total(),
                'per_page' => $campanas->perPage(),
                'current_page' => $campanas->currentPage(),
                'last_page' => $campanas->lastPage(),
            ],
        ]);
    }

    public function filtros()
    {
        return ApiResponse::success([
            'estados' => [
                NewsletterCampaign::ESTADO_BORRADOR,
                NewsletterCampaign::ESTADO_PROGRAMADA,
                NewsletterCampaign::ESTADO_ENVIADA,
            ],
            'suscriptores_activos' => NewsletterSubscriber::activos()->count(),
        ]);
    }

    public function show(NewsletterCampaign $campaign)
    {
        $campaign->load([
            'cupon:id,code,type,value,min_subtotal,expires_at',
            'creador:id,nombre',
            'media',
            'items.product:id,name,slug,price,price_discount,description',
        ]);

        return ApiResponse::success([
            'campaign' => $campaign,
            'estadisticas' => [
                'destinatarios' => $campaign->destinatarios,
                'enviados' => $campaign->enviados,
                'fallidos' => $campaign->fallidos,
                'pendientes' => $campaign->recipients()
                    ->where('estado', 'pendiente')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validado = $this->validar($request);

        try {
            DB::beginTransaction();

            $campaign = NewsletterCampaign::create($validado + [
                'created_by' => $request->user()?->id,
            ]);

            $this->sincronizar($campaign, $request, $validado);

            DB::commit();

            return ApiResponse::success(
                $campaign->fresh(['cupon', 'items.product', 'media']),
                'Campaña creada',
                201
            );
        } catch (\Throwable $e) {
            DB::rollBack();

            return ApiResponse::error('Error al crear la campaña: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, NewsletterCampaign $campaign)
    {
        if ($campaign->estado === NewsletterCampaign::ESTADO_ENVIADA) {
            return ApiResponse::error(
                'La campaña ya fue enviada y no puede modificarse',
                409,
                'CAMPAIGN_ALREADY_SENT'
            );
        }

        $validado = $this->validar($request);

        try {
            DB::beginTransaction();

            $campaign->update($validado);
            $this->sincronizar($campaign, $request, $validado);

            DB::commit();

            return ApiResponse::success(
                $campaign->fresh(['cupon', 'items.product', 'media']),
                'Campaña actualizada'
            );
        } catch (\Throwable $e) {
            DB::rollBack();

            return ApiResponse::error('Error al actualizar la campaña: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(NewsletterCampaign $campaign)
    {
        $campaign->delete();

        return ApiResponse::success(null, 'Campaña eliminada');
    }

    /**
     * Renderiza el HTML final del correo sin persistir nada.
     * Es exactamente el mismo template que usan el envío y el correo de prueba.
     */
    public function vistaPrevia(Request $request)
    {
        $validado = $this->validar($request, false);

        $campaign = new NewsletterCampaign($validado);
        $campaign->setRelation('cupon', ($validado['cupon_id'] ?? null)
            ? \App\Models\Coupon::find($validado['cupon_id'])
            : null);

        $this->cargarRelacionesTemporales($campaign, $request);

        $html = app(NewsletterService::class)->render($campaign, ['nombre' => $request->input('nombre_destinatario')]);

        return ApiResponse::success([
            'html' => $html,
            'asunto' => $campaign->asunto,
        ]);
    }

    /**
     * Envía la campaña a todos los suscriptores activos.
     */
    public function enviar(Request $request, NewsletterCampaign $campaign)
    {
        $total = app(NewsletterService::class)->prepararDestinatarios($campaign);

        if ($total === 0) {
            return ApiResponse::error(
                'No hay suscriptores activos a los que enviar la campaña',
                409,
                'NO_SUBSCRIBERS'
            );
        }

        $campaign->update([
            'estado' => NewsletterCampaign::ESTADO_ENVIADA,
            'fecha_envio' => now(),
            'destinatarios' => $total,
            'enviados' => 0,
            'fallidos' => 0,
        ]);

        SendNewsletterCampaign::dispatch($campaign->id);

        return ApiResponse::success([
            'campaign' => $campaign->fresh(),
            'destinatarios' => $total,
        ], "Campaña en cola de envío a {$total} suscriptores");
    }

    public function enviarPrueba(Request $request, NewsletterCampaign $campaign)
    {
        $request->validate([
            'correo' => 'required|email|max:255',
        ], [
            'correo.required' => 'Indica el correo de prueba',
            'correo.email' => 'El correo de prueba no es válido',
        ]);

        $html = app(NewsletterService::class)->render($campaign, [
            'nombre' => $request->input('nombre_destinatario', 'Cliente de prueba'),
        ]);

        Mail::to($request->correo)->send(new \App\Mail\CampaignMail($campaign, null, $html));

        return ApiResponse::success(null, "Correo de prueba enviado a {$request->correo}");
    }

    protected function validar(Request $request, bool $requerido = true): array
    {
        $reglas = [
            'titulo' => ($requerido ? 'required' : 'nullable') . '|string|max:255',
            'asunto' => ($requerido ? 'required' : 'nullable') . '|string|max:255',
            'contenido' => ($requerido ? 'required' : 'nullable') . '|string',
            'estado' => 'nullable|in:Borrador,Programada,Enviada',
            'fecha_programada' => 'nullable|date',
            'cupon_id' => 'nullable|integer|exists:coupons,id',
            'items' => 'nullable',
            'media' => 'nullable',
            'existing_image_urls' => 'nullable',
        ];

        return $request->validate($reglas, [
            'cupon_id.exists' => 'El cupón seleccionado no existe',
        ]);
    }

    protected function sincronizar(NewsletterCampaign $campaign, Request $request, array $validado): void
    {
        // --- Productos ---
        $items = $request->input('items');
        if ($items !== null) {
            $campaign->items()->delete();

            $ids = array_values(array_filter((array) $items, fn ($id) => $id !== '' && $id !== null));

            foreach ($ids as $orden => $productoId) {
                if (!Product::where('id', $productoId)->exists()) {
                    continue;
                }

                NewsletterCampaignItem::create([
                    'campaign_id' => $campaign->id,
                    'product_id' => $productoId,
                    'orden' => $orden,
                ]);
            }
        }

        // --- Imágenes / videos ---
        if ($request->has('existing_image_urls') || $request->has('media')) {
            $campaign->media()->delete();

            $existentes = array_filter((array) $request->input('existing_image_urls', []));
            $nuevos = (array) $request->input('media', []);

            $urls = array_values(array_merge($existentes, array_filter($nuevos)));

            foreach ($urls as $orden => $url) {
                if (empty($url)) {
                    continue;
                }

                NewsletterCampaignMedia::create([
                    'campaign_id' => $campaign->id,
                    'url' => $url,
                    'orden' => $orden,
                    'tipo' => $this->esVideo($url) ? 'Video' : 'Imagen',
                ]);
            }
        }
    }

    protected function cargarRelacionesTemporales(NewsletterCampaign $campaign, Request $request): void
    {
        $productIds = array_values(array_filter((array) $request->input('items', []), fn ($v) => $v !== '' && $v !== null));

        $items = collect($productIds)
            ->map(function ($id, $orden) {
                $producto = Product::with('images')->find($id);

                if (!$producto) {
                    return null;
                }

                $item = new NewsletterCampaignItem(['orden' => $orden, 'product_id' => $producto->id]);
                $item->setRelation('product', $producto);

                return $item;
            })
            ->filter()
            ->values();

        $urls = array_values(array_filter(array_merge(
            (array) $request->input('existing_image_urls', []),
            (array) $request->input('media', [])
        )));

        $media = collect($urls)
            ->map(fn ($url, $orden) => new NewsletterCampaignMedia([
                'url' => $url,
                'orden' => $orden,
                'tipo' => $this->esVideo($url) ? 'Video' : 'Imagen',
            ]))
            ->values();

        $campaign->setRelation('items', $items);
        $campaign->setRelation('media', $media);
    }

    protected function esVideo(string $url): bool
    {
        return (bool) preg_match('/\.(mp4|webm|mov|avi)(\?|$)/i', $url);
    }
}

<?php

namespace App\Jobs;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterCampaignRecipient;
use App\Services\NewsletterService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendNewsletterCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    public function __construct(public int $campaignId)
    {
    }

    public function handle(NewsletterService $newsletter): void
    {
        $campaign = NewsletterCampaign::find($this->campaignId);

        if (!$campaign) {
            return;
        }

        $pendientes = $campaign->recipients()
            ->where('estado', NewsletterCampaignRecipient::ESTADO_PENDIENTE)
            ->with('subscriber')
            ->get();

        $enviados = (int) $campaign->enviados;
        $fallidos = (int) $campaign->fallidos;

        foreach ($pendientes as $destino) {
            $suscriptor = $destino->subscriber;

            if (!$suscriptor || $suscriptor->cancelado()) {
                $destino->update([
                    'estado' => NewsletterCampaignRecipient::ESTADO_FALLIDO,
                    'error' => 'Suscriptor dado de baja',
                ]);
                $fallidos++;
                continue;
            }

            try {
                $html = $newsletter->render($campaign, $suscriptor);

                Mail::to($destino->correo)->send(
                    new \App\Mail\CampaignMail($campaign, $suscriptor, $html)
                );

                $destino->update([
                    'estado' => NewsletterCampaignRecipient::ESTADO_ENVIADO,
                    'enviado_en' => now(),
                    'error' => null,
                ]);
                $enviados++;
            } catch (Throwable $e) {
                $destino->update([
                    'estado' => NewsletterCampaignRecipient::ESTADO_FALLIDO,
                    'error' => mb_substr($e->getMessage(), 0, 900),
                ]);
                $fallidos++;
            }
        }

        $campaign->update([
            'enviados' => $enviados,
            'fallidos' => $fallidos,
        ]);
    }
}

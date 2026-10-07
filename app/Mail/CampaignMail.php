<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public $campaign;
    public $subscriber;
    public $html;

    public function __construct($campaign, $subscriber, string $html)
    {
        $this->campaign = $campaign;
        $this->subscriber = $subscriber;
        $this->html = $html;
    }

    public function build()
    {
        return $this
            ->subject(mb_substr($this->campaign->asunto, 0, 200))
            ->html($this->html);
    }
}

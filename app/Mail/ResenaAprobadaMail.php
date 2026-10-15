<?php

namespace App\Mail;

use App\Models\Review;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResenaAprobadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public Review $review;

    public function __construct(Review $review)
    {
        $this->review = $review;
    }

    public function build()
    {
        return $this->subject('Tu reseña fue publicada')
            ->view('emails.resena-aprobada')
            ->with(['review' => $this->review]);
    }
}

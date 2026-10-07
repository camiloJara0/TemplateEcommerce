<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaignMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'tipo',
        'url',
        'orden',
    ];
}

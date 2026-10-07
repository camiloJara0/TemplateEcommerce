<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaignItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'product_id',
        'orden',
    ];

    public function campaign()
    {
        return $this->belongsTo(NewsletterCampaign::class, 'campaign_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

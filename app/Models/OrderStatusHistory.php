<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_id',
        'status',
        'user_id',
        'comment',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
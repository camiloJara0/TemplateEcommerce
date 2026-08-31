<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    public static function obtener(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    public static function establecer(string $key, $value, string $group = 'general'): self
    {
        return static::updateOrCreate(['key' => $key], [
            'value' => is_array($value) ? json_encode($value) : $value,
            'group' => $group,
        ]);
    }
}
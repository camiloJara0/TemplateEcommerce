<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'foto',
        'estado',
        'ultimo_login',
        'idioma',
        'telefono',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'ultimo_login' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    public function rol()
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->select('roles.id', 'roles.name');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user'); 
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function pushSubscriptions()
    {
        return $this->hasMany(PushSubscription::class);
    }

    public function tieneRol(string ...$slugs): bool
    {
        return $this->roles()->whereIn('slug', $slugs)->exists();
    }

    public function tienePermiso(string $permiso): bool
    {
        $permisos = $this->roles()
            ->pluck('slug')
            ->flatMap(fn ($slug) => config("permissions.roles.{$slug}", []));

        foreach ($permisos as $p) {
            if ($p === '*' || $p === $permiso) {
                return true;
            }

            if (str_ends_with($p, '.*') && str_starts_with($permiso, substr($p, 0, -2))) {
                return true;
            }
        }

        return false;
    }
}
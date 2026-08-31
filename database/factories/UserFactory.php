<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'telefono' => $this->faker->numerify('3##########'),
            'estado' => 'activo',
            'zona_horaria' => 'America/Bogota',
            'idioma' => 'es',
            'tema' => 'claro',
            'email_verified_at' => now(),
        ];
    }
}
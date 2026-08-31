<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [RoleEnum::ADMIN->value, 'Administrador', 'Acceso total a la plataforma'],
            [RoleEnum::VENDEDOR->value, 'Vendedor', 'Gestiona productos e inventario'],
            [RoleEnum::CLIENTE->value, 'Cliente', 'Compra en la tienda'],
            [RoleEnum::OPERADOR_LOGISTICA->value, 'Operador de logística', 'Gestiona pedidos y envíos'],
        ];

        foreach ($roles as [$slug, $name, $description]) {
            Role::updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'description' => $description,
            ]);
        }
    }
}
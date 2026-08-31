<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

trait WithRoles
{
    use RefreshDatabase;

    protected function seedRoles(): void
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    protected function adminUser(): User
    {
        $this->seedRoles();

        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', RoleEnum::ADMIN->value)->first());

        return $user;
    }

    protected function clientUser(): User
    {
        $this->seedRoles();

        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', RoleEnum::CLIENTE->value)->first());

        return $user;
    }

    protected function actingAsSanctum(User $user)
    {
        return $this->actingAs($user, 'sanctum');
    }
}
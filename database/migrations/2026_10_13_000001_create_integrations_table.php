<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('provider', 50)->index();
            $table->string('estado', 30)->default('sin_credenciales');
            $table->text('credenciales')->nullable();
            $table->boolean('soporta_login')->default(false);
            $table->string('rol_login_federado')->nullable();
            $table->json('config_sincronizacion')->nullable();
            $table->timestamp('ultimo_sincronizado')->nullable();
            $table->string('ultimo_estado', 30)->nullable();
            $table->unsignedInteger('intentos_fallo')->default(0);
            $table->boolean('activa')->default(true);
            $table->timestamps();

            $table->index(['estado', 'activa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_sync_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->cascadeOnDelete();
            $table->string('tipo', 30)->default('todo');
            $table->string('origen', 20)->default('manual');
            $table->string('estado', 20)->default('iniciando');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('iniciado_en')->nullable();
            $table->timestamp('finalizado_en')->nullable();
            $table->unsignedInteger('procesados')->default(0);
            $table->unsignedInteger('creados')->default(0);
            $table->unsignedInteger('actualizados')->default(0);
            $table->unsignedInteger('omitidos')->default(0);
            $table->unsignedInteger('errores')->default(0);
            $table->json('resumen')->nullable();
            $table->timestamps();

            $table->index(['integration_id', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_sync_runs');
    }
};

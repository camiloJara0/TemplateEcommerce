<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->cascadeOnDelete();
            $table->foreignId('sync_run_id')->nullable()->constrained('integration_sync_runs')->nullOnDelete();
            $table->string('tipo', 120)->nullable();
            $table->string('severidad', 20)->default('info');
            $table->text('mensaje');
            $table->text('mensaje_externo')->nullable();
            $table->nullableMorphs('referencia');
            $table->json('payload')->nullable();
            $table->unsignedInteger('intentos')->default(0);
            $table->timestamp('reintentado_en')->nullable();
            $table->timestamps();

            $table->index(['integration_id', 'severidad']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_events');
    }
};

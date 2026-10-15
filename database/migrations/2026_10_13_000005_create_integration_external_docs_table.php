<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_external_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->cascadeOnDelete();
            $table->string('tipo', 50);
            $table->string('external_id', 191);
            $table->string('local_type')->nullable();
            $table->unsignedBigInteger('local_id')->nullable();
            $table->string('estado', 30)->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->unique(['integration_id', 'tipo', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_external_docs');
    }
};

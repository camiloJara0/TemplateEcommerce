<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_field_maps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('integration_id')->constrained('integrations')->cascadeOnDelete();
            $table->string('dominio', 50);
            $table->string('clave_externa', 191);
            $table->string('valor_local', 191)->nullable();
            $table->timestamps();

            $table->unique(['integration_id', 'dominio', 'clave_externa'], 'ifm_integ_dom_ext_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_field_maps');
    }
};

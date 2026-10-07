<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('newsletter_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('asunto');
            $table->text('contenido');
            $table->enum('estado', ['Borrador','Programada','Enviada',])->default('Borrador');
            $table->timestamp('fecha_programada')->nullable();
            $table->timestamp('fecha_envio')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('newsletter_campaigns');
    }
};

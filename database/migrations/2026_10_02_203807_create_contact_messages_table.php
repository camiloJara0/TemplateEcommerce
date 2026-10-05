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
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->nullable();
            $table->string('correo');
            $table->string('nit')->nullable();
            $table->string('asunto');
            $table->text('mensaje');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', ['Pendiente','Leido','Respondido','Cerrado',])->default('Pendiente');
            $table->timestamp('fecha_lectura')->nullable();
            $table->timestamps();

            $table->index('correo');
            $table->index('estado');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contact_messages');
    }
};

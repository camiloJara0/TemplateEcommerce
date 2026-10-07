<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50);
            $table->string('event_id', 191)->nullable();
            $table->string('tipo', 120)->nullable();
            $table->string('estado', 20)->default('recibido');
            $table->boolean('firma_valida')->nullable();
            $table->json('payload');
            $table->json('respuesta')->nullable();
            $table->text('error')->nullable();
            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedInteger('intentos')->default(1);
            $table->unsignedInteger('http_status')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('procesado_en')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'event_id']);
            $table->index(['provider', 'estado']);
            $table->index('created_at');
            $table->index('payment_id');
            $table->index('order_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('webhook_events');
    }
};

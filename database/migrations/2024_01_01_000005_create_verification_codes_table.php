<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('correo');
            $table->string('codigo', 6);
            $table->timestamp('expira_en');
            $table->boolean('usado')->default(false);
            $table->timestamps();

            $table->index(['correo', 'codigo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
    }
};
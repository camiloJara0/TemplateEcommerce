<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            // Contingencia del login federado (RN-14 desviada): cuando el
            // sistema externo no responde, caer al login local (true) o
            // rechazar con 503 (false).
            $table->boolean('login_fallback_local')->default(true)->after('rol_login_federado');
        });
    }

    public function down(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->dropColumn('login_fallback_local');
        });
    }
};

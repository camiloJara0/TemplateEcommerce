<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // --- Suscriptor: nombre para personalizar + origen de la alta ---
        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->string('nombre', 120)->nullable()->after('correo');
            $table->string('origen', 30)->default('web')->after('estado');
            $table->index('estado');
        });

        // --- Campaña: cupón promocional + métricas de envío ---
        Schema::table('newsletter_campaigns', function (Blueprint $table) {
            $table->foreignId('cupon_id')->nullable()->after('created_by')
                ->constrained('coupons')->nullOnDelete();
            $table->unsignedInteger('destinatarios')->default(0);
            $table->unsignedInteger('enviados')->default(0);
            $table->unsignedInteger('fallidos')->default(0);
            $table->index('estado');
            $table->index('fecha_programada');
        });

        // --- Registro de envío por suscriptor (evita reenvíos y permite métricas) ---
        Schema::create('newsletter_campaign_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('newsletter_campaigns')->cascadeOnDelete();
            $table->foreignId('subscriber_id')->constrained('newsletter_subscribers')->cascadeOnDelete();
            $table->string('correo');
            $table->string('estado', 20)->default('pendiente'); // pendiente | enviado | fallido
            $table->text('error')->nullable();
            $table->timestamp('enviado_en')->nullable();
            $table->timestamps();

            $table->unique(['campaign_id', 'subscriber_id']);
            $table->index(['campaign_id', 'estado']);
            $table->index('estado');
        });
    }

    public function down()
    {
        Schema::dropIfExists('newsletter_campaign_recipients');

        Schema::table('newsletter_campaigns', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cupon_id');
            $table->dropIndex(['estado']);
            $table->dropIndex(['fecha_programada']);
            $table->dropColumn(['destinatarios', 'enviados', 'fallidos']);
        });

        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->dropIndex(['estado']);
            $table->dropColumn(['nombre', 'origen']);
        });
    }
};

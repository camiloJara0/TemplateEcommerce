<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Estado de la venta hacia el ERP: pendiente_envio | enviado | aceptado | error
            $table->string('integration_erp_estado', 30)->nullable()->after('shipping_status')->index();
            $table->string('integration_erp_externo_id', 191)->nullable()->after('integration_erp_estado');
            $table->text('integration_erp_error')->nullable()->after('integration_erp_externo_id');
            $table->boolean('integration_erp_error_transitorio')->default(false)->after('integration_erp_error');
            $table->timestamp('integration_erp_enviado_en')->nullable()->after('integration_erp_error_transitorio');
            $table->foreignId('integration_erp_id')->nullable()->after('integration_erp_enviado_en')
                ->constrained('integrations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('integration_erp_id');
            $table->dropColumn([
                'integration_erp_estado',
                'integration_erp_externo_id',
                'integration_erp_error',
                'integration_erp_error_transitorio',
                'integration_erp_enviado_en',
            ]);
        });
    }
};

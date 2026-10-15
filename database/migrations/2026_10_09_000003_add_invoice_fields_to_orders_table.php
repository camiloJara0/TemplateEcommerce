<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('numero_factura')->nullable()->unique()->after('numero');
            $table->timestamp('fecha_emision')->nullable()->after('numero_factura');
            $table->timestamp('paid_at')->nullable()->after('fecha_emision');
            $table->string('billing_nombre')->nullable()->after('notes');
            $table->string('billing_nit')->nullable()->after('billing_nombre');
            $table->string('billing_razon_social')->nullable()->after('billing_nit');
            $table->string('billing_direccion')->nullable()->after('billing_razon_social');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['numero_factura']);
            $table->dropColumn([
                'numero_factura',
                'fecha_emision',
                'paid_at',
                'billing_nombre',
                'billing_nit',
                'billing_razon_social',
                'billing_direccion',
            ]);
        });
    }
};

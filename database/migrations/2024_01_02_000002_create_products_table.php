<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('sku')->unique();
            $table->decimal('price', 18, 2);
            $table->decimal('price_discount', 18, 2)->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->string('estado')->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'brand_id']);
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
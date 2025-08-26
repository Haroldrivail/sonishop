<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10);
            $table->integer('stock')->nullable()->default(0);
            $table->decimal('sale_price', 10)->nullable();
            $table->string('image')->nullable();
            $table->string('category', 100)->default('');
            $table->decimal('rating', 3)->nullable();
            $table->integer('reviews')->nullable();
            $table->boolean('in_stock')->default(true);
            $table->boolean('is_new')->default(false);
            $table->boolean('free_shipping')->default(false);
            $table->unsignedInteger('sales')->default(0);
            $table->timestamps();
            $table->integer('ratings_count')->nullable()->default(0);
            $table->integer('ratings_sum')->nullable()->default(0);
            $table->unsignedBigInteger('category_id')->nullable()->index('products_category_id_foreign');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

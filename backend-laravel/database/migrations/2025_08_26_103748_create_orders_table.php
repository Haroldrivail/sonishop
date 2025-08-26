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
        Schema::create('orders', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('order_number', 50)->unique('order_number');
            $table->integer('user_id')->nullable();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone', 50)->nullable();
            $table->text('address');
            $table->integer('amount');
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->nullable()->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->string('delivery_method', 50)->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

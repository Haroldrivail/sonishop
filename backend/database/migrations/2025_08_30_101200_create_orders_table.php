<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number')->unique();
            $table->string('status')->default('pending');
            $table->bigInteger('subtotal')->default(0);
            $table->bigInteger('shipping_amount')->default(0);
            $table->bigInteger('total')->default(0);
            $table->string('payment_method')->nullable();
            $table->json('shipping_info')->nullable();
            $table->json('billing_info')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

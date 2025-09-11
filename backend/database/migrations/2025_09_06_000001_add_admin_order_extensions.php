<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function(Blueprint $table) {
            if (!Schema::hasColumn('orders', 'refunded_amount')) {
                $table->bigInteger('refunded_amount')->default(0);
            }
            if (!Schema::hasColumn('orders', 'cancel_reason')) {
                $table->string('cancel_reason')->nullable();
            }
        });

        if (!Schema::hasTable('order_notes')) {
            Schema::create('order_notes', function(Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->text('content');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('order_notes')) {
            Schema::dropIfExists('order_notes');
        }
        Schema::table('orders', function(Blueprint $table) {
            if (Schema::hasColumn('orders', 'refunded_amount')) {
                $table->dropColumn('refunded_amount');
            }
            if (Schema::hasColumn('orders', 'cancel_reason')) {
                $table->dropColumn('cancel_reason');
            }
        });
    }
};

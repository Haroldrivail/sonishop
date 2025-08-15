<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'sale_price')) {
                $table->decimal('sale_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'category')) {
                $table->string('category', 100)->default('')->after('image');
            }
            if (!Schema::hasColumn('products', 'rating')) {
                $table->decimal('rating', 2, 1)->nullable()->after('category');
            }
            if (!Schema::hasColumn('products', 'reviews')) {
                $table->unsignedInteger('reviews')->default(0)->after('rating');
            }
            if (!Schema::hasColumn('products', 'in_stock')) {
                $table->boolean('in_stock')->default(true)->after('reviews');
            }
            if (!Schema::hasColumn('products', 'is_new')) {
                $table->boolean('is_new')->default(false)->after('in_stock');
            }
            if (!Schema::hasColumn('products', 'free_shipping')) {
                $table->boolean('free_shipping')->default(false)->after('is_new');
            }
            if (!Schema::hasColumn('products', 'sales')) {
                $table->unsignedInteger('sales')->default(0)->after('free_shipping');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Optionnel : ne fais rien ici pour éviter de supprimer accidentellement des données
            // Tu peux ajouter les drops ici si tu veux annuler proprement :
            // $table->dropColumn('sale_price');
            // ...
        });
    }
};

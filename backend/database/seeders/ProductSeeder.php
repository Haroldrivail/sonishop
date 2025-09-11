<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer des catégories
        $categories = [
            [
                'name' => 'Smartphones',
                'slug' => 'smartphones',
                'description' => 'Les derniers smartphones et téléphones mobiles',
            ],
            [
                'name' => 'Ordinateurs',
                'slug' => 'ordinateurs',
                'description' => 'Ordinateurs portables et de bureau',
            ],
            [
                'name' => 'Tablettes',
                'slug' => 'tablettes',
                'description' => 'Tablettes et iPads',
            ],
            [
                'name' => 'Accessoires',
                'slug' => 'accessoires',
                'description' => 'Accessoires et périphériques',
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Récupérer les catégories créées
        $smartphonesCategory = Category::where('slug', 'smartphones')->first();
        $ordinateursCategory = Category::where('slug', 'ordinateurs')->first();
        $tablettesCategory = Category::where('slug', 'tablettes')->first();
        $accessoiresCategory = Category::where('slug', 'accessoires')->first();

        // Créer des produits
        $products = [
            [
                'name' => 'iPhone 15 Pro Max',
                'slug' => 'iphone-15-pro-max',
                'description' => 'Le smartphone le plus avancé d\'Apple avec puce A17 Pro et caméra révolutionnaire.',
                'price' => 915000,
                'sale_price' => 850000,
                'sku' => 'IPH15PM',
                'category_id' => $smartphonesCategory->id,
                'in_stock' => true,
                'is_new' => true,
                'free_shipping' => true,
                'brand' => 'Apple',
                'rating' => 4.8,
                'reviews_count' => 324,
            ],
            [
                'name' => 'Samsung Galaxy S24 Ultra',
                'slug' => 'samsung-galaxy-s24-ultra',
                'description' => 'Smartphone Samsung avec S Pen intégré et caméra de 200MP.',
                'price' => 825000,
                'sale_price' => 750000,
                'sku' => 'SGS24U',
                'category_id' => $smartphonesCategory->id,
                'in_stock' => true,
                'is_new' => true,
                'free_shipping' => true,
                'brand' => 'Samsung',
                'rating' => 4.7,
                'reviews_count' => 256,
            ],
            [
                'name' => 'MacBook Pro M3',
                'slug' => 'macbook-pro-m3',
                'description' => 'Ordinateur portable professionnel avec puce M3 Pro pour les créatifs.',
                'price' => 1635000,
                'sale_price' => 1200000,
                'sku' => 'MBPM3',
                'category_id' => $ordinateursCategory->id,
                'in_stock' => true,
                'is_new' => false,
                'free_shipping' => true,
                'brand' => 'Apple',
                'rating' => 4.9,
                'reviews_count' => 156,
            ],
            [
                'name' => 'iPad Pro 12.9"',
                'slug' => 'ipad-pro-129',
                'description' => 'Tablette iPad Pro avec écran Liquid Retina XDR et puce M2.',
                'price' => 785000,
                'sale_price' => 720000,
                'sku' => 'IPADPRO129',
                'category_id' => $tablettesCategory->id,
                'in_stock' => true,
                'is_new' => false,
                'free_shipping' => false,
                'brand' => 'Apple',
                'rating' => 4.6,
                'reviews_count' => 89,
            ],
            [
                'name' => 'AirPods Pro 2',
                'slug' => 'airpods-pro-2',
                'description' => 'Écouteurs sans fil avec réduction de bruit adaptative.',
                'price' => 185000,
                'sale_price' => 165000,
                'sku' => 'AIRPRO2',
                'category_id' => $accessoiresCategory->id,
                'in_stock' => true,
                'is_new' => false,
                'free_shipping' => false,
                'brand' => 'Apple',
                'rating' => 4.5,
                'reviews_count' => 203,
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}

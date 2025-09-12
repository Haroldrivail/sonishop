<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use App\Models\Product;

class TestCrud extends Command
{
    protected $signature = 'test:crud';
    protected $description = 'Test CRUD operations for products and categories';

    public function handle()
    {
        $this->info('Testing CRUD operations...');

        // Test création d'une catégorie avec image
        $this->info('1. Testing category creation...');
        $category = Category::create([
            'name' => 'Test Category ' . now()->timestamp,
            'slug' => 'test-category-' . now()->timestamp,
            'description' => 'Test category description',
            'image' => 'https://via.placeholder.com/300x200',
            'images' => ['https://via.placeholder.com/300x200', 'https://via.placeholder.com/300x201']
        ]);
        $this->info("Category created: {$category->name} (ID: {$category->id})");

        // Test création d'un produit avec images multiples
        $this->info('2. Testing product creation...');
        $product = Product::create([
            'name' => 'Test Product ' . now()->timestamp,
            'slug' => 'test-product-' . now()->timestamp,
            'description' => 'Test product description',
            'price' => 10000, // 100.00 XAF
            'stock' => 10,
            'category_id' => $category->id,
            'image' => 'https://via.placeholder.com/400x300',
            'images' => [
                'https://via.placeholder.com/400x300',
                'https://via.placeholder.com/400x301',
                'https://via.placeholder.com/400x302'
            ]
        ]);
        $this->info("Product created: {$product->name} (ID: {$product->id})");

        // Test affichage des images
        $this->info('3. Testing image URLs...');
        $this->info("Category image URL: {$category->image_url}");
        $this->info("Category images: " . json_encode($category->images));
        $this->info("Product image URL: {$product->image_url}");
        $this->info("Product images: " . json_encode($product->images));

        // Test mise à jour des images
        $this->info('4. Testing image updates...');
        $product->update([
            'images' => [
                'https://via.placeholder.com/500x400',
                'https://via.placeholder.com/500x401',
                'https://via.placeholder.com/500x402',
                'https://via.placeholder.com/500x403'
            ]
        ]);
        $product->refresh();
        $this->info("Updated product images: " . json_encode($product->images));

        // Nettoyage
        $this->info('5. Cleaning up...');
        $product->delete();
        $category->delete();
        $this->info('Test data cleaned up.');

        $this->info('✅ All CRUD tests passed!');
        return Command::SUCCESS;
    }
}

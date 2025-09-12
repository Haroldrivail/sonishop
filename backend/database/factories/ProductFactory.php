<?php
namespace Database\Factories;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
class ProductFactory extends Factory {
    protected $model = Product::class;
    public function definition(): array {
        return [
            'sku' => strtoupper($this->faker->bothify('SKU###')),
            'name' => $this->faker->words(3, true),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->numberBetween(500, 5000),
            'sale_price' => null,
            'image' => null,
            'images' => [],
            'rating' => 0,
            'reviews_count' => 0,
            'in_stock' => true,
            'brand' => $this->faker->company(),
            'category_id' => Category::factory(),
            'is_new' => false,
            'free_shipping' => false,
            'sales' => 0,
        ];
    }
}

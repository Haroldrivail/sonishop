<?php
namespace Database\Factories;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
class OrderItemFactory extends Factory {
    protected $model = OrderItem::class;
    public function definition(): array {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'name' => $this->faker->words(3, true),
            'sku' => strtoupper($this->faker->bothify('SKU###')),
            'price' => 1000,
            'quantity' => 1,
            'total' => 1000,
        ];
    }
}

<?php
namespace Database\Factories;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
class OrderFactory extends Factory {
    protected $model = Order::class;
    public function definition(): array {
        return [
            'user_id' => User::factory(),
            'number' => 'SN'.time().Str::upper(Str::random(4)),
            'status' => 'pending',
            'subtotal' => 0,
            'shipping_amount' => 0,
            'total' => 0,
            'shipping_info' => ['address' => $this->faker->address()],
        ];
    }
}

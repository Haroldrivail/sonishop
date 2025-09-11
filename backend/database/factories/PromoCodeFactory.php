<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromoCode>
 */
class PromoCodeFactory extends Factory
{
    public function definition(): array
    {
        $type = $this->faker->randomElement(['percentage','fixed']);
        return [
            'code' => strtoupper(Str::random(8)),
            'discount' => $type === 'percentage' ? $this->faker->numberBetween(5,30) : $this->faker->numberBetween(500,5000),
            'type' => $type,
            'active' => true,
            'valid_from' => Carbon::now()->subDays(10),
            'valid_until' => Carbon::now()->addDays(30),
            'usage_limit' => null,
            'used_count' => 0,
            'min_order_amount' => null,
        ];
    }
}

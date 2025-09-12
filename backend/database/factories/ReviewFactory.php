<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => \App\Models\Product::factory(),
            'user_id' => null,
            'rating' => $this->faker->numberBetween(1,5),
            'review' => $this->faker->optional()->paragraph(),
            'status' => 'approved',
            'approved_at' => now(),
        ];
    }
}

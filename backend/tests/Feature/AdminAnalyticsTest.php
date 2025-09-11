<?php

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Laravel\Sanctum\Sanctum;

it('returns analytics summary for admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Sanctum::actingAs($admin, ['*']);
    $product = Product::factory()->create(['price' => 1000]);
    $order = Order::factory()->create(['user_id' => $admin->id, 'total' => 5000, 'subtotal' => 5000]);
    OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'price' => 1000, 'quantity' => 5, 'total' => 5000, 'name' => $product->name]);

    $response = $this->get('/api/admin/analytics/summary?range=7d');
    $response->assertStatus(200);
    $response->assertJsonStructure(['range','days','totals'=>['revenue','orders','customers','avg_order_value'],'top_products','categories']);
});

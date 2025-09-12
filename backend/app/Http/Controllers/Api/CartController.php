<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Http\Traits\ApiResponse;

class CartController extends Controller
{
    use ApiResponse;
    public function show(Request $request)
    {
        $user = $request->user();

        // return server-side cart if exists, otherwise empty
        $cart = $user?->cart ? $user->cart->load('items.product') : null;

    return $this->ok($cart);
    }

    /**
     * Sync (merge) client cart into server-side cart for user (used on login).
     * Payload: { items: [ { product_id, quantity } ] }
     */
    public function sync(Request $request)
    {
        $user = $request->user();
        $payload = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'integer|min:1',
        ]);

        $cart = $user->cart ?? $user->cart()->create([]);

        foreach ($payload['items'] as $it) {
            $product = Product::find($it['product_id']);
            if (! $product) continue;

            $existing = $cart->items()->where('product_id', $product->id)->first();
            $qty = max(1, (int) ($it['quantity'] ?? 1));

            if ($existing) {
                $existing->quantity = $existing->quantity + $qty;
                $existing->save();
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'product_snapshot' => [
                        'name' => $product->name,
                        'sku' => $product->sku ?? null,
                        'price' => $product->sale_price ?? $product->price,
                    ],
                    'quantity' => $qty,
                ]);
            }
        }

    return $this->ok($cart->load('items.product'));
    }

    public function add(Request $request)
    {
        $user = $request->user();
        $data = $request->validate(['product_id' => 'required|integer', 'quantity' => 'integer|min:1']);

        $cart = $user->cart ?? $user->cart()->create([]);
        $product = Product::findOrFail($data['product_id']);

        $existing = $cart->items()->where('product_id', $product->id)->first();
        if ($existing) {
            $existing->quantity += $data['quantity'] ?? 1;
            $existing->save();
            return $this->ok($existing);
        }

        $item = $cart->items()->create([
            'product_id' => $product->id,
            'product_snapshot' => [
                'name' => $product->name,
                'sku' => $product->sku ?? null,
                'price' => $product->sale_price ?? $product->price,
            ],
            'quantity' => $data['quantity'] ?? 1,
        ]);

    return $this->created($item);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:0']);

        // ensure the item belongs to the authenticated user
        $user = $request->user();
        if (! $item->cart || ($item->cart->user_id && $item->cart->user_id !== $user->id && ! $user->isAdmin())) {
            return $this->error('Unauthorized', 403);
        }
        if ($data['quantity'] <= 0) {
            $item->delete();
            return $this->ok(['deleted' => true]);
        }

        $item->quantity = $data['quantity'];
        $item->save();
    return $this->ok($item);
    }

    public function removeItem(Request $request, CartItem $item)
    {
        // ensure the item belongs to the authenticated user
        $user = $request->user();
        if (! $item->cart || ($item->cart->user_id && $item->cart->user_id !== $user->id && ! $user->isAdmin())) {
            return $this->error('Unauthorized', 403);
        }

        $item->delete();
    return $this->ok(['deleted' => true]);
    }
}

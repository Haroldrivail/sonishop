<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Http\Traits\ApiResponse;

class WishlistController extends Controller
{
    use ApiResponse;
    /**
     * Return the authenticated user's wishlist products.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $products = $user->wishlist()->get();

    return $this->ok($products);
    }

    /**
     * Toggle a product in the authenticated user's wishlist.
     * If product is already present, it will be removed; otherwise attached.
     */
    public function toggle(Request $request, Product $product)
    {
        $user = $request->user();

        $exists = $user->wishlist()->where('product_id', $product->id)->exists();

        if ($exists) {
            $user->wishlist()->detach($product->id);
            return $this->ok(['attached' => false, 'product_id' => $product->id]);
        }

        $user->wishlist()->attach($product->id);
    return $this->ok(['attached' => true, 'product_id' => $product->id]);
    }
}

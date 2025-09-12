<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;
use App\Http\Traits\ApiResponse;

class ReviewController extends Controller
{
    use ApiResponse;
    public function index(Request $request, Product $product)
    {
        $reviews = $product->reviews()->where('status', 'approved')->latest()->get();
    return $this->ok($reviews);
    }

    public function store(Request $request, Product $product)
    {
        $data = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'review' => 'string|nullable',
        ]);

        $review = $product->reviews()->create([
            'user_id' => $request->user()?->id ?? null,
            'rating' => $data['rating'],
            'review' => $data['review'] ?? null,
            'status' => 'pending',
        ]);

    return $this->created($review);
    }
}

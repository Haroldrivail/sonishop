<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PromoCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Http\Traits\ApiResponse;

class OrderController extends Controller
{
    use ApiResponse;
    /**
     * List orders for authenticated user
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->latest()->paginate(10);
    return $this->ok($orders);
    }

    /**
     * Show order
     */
    public function show(Request $request, Order $order)
    {
        $this->authorize('view', $order);
    return $this->ok($order->load('items'));
    }

    /**
     * Create an order from payload or from server cart
     * Payload example: { items: [{product_id, quantity}], shipping_info, promo_code }
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_info' => 'required|array',
            'promo_code' => 'string|nullable',
            'payment_method' => 'string|nullable',
        ]);

        // Recalculate and create order atomically
        $result = DB::transaction(function () use ($request, $data) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $unit = $product->sale_price ?? $product->price;
                $qty = (int) $it['quantity'];
                $lineTotal = $unit * $qty;
                $subtotal += $lineTotal;
                $itemsData[] = [
                    'product' => $product,
                    'name' => $product->name,
                    'sku' => $product->sku ?? null,
                    'price' => $unit,
                    'quantity' => $qty,
                    'total' => $lineTotal,
                ];
            }

            $discount = 0;
            if (! empty($data['promo_code'])) {
                $promo = PromoCode::where('code', strtoupper($data['promo_code']))->first();
                if ($promo && $promo->isActive() && $promo->canApplyToAmount($subtotal)) {
                    $discount = $promo->calculateForAmount($subtotal);
                    // increment used_count
                    $promo->increment('used_count');
                }
            }

            $shipping = 0; // simplified
            $total = $subtotal - $discount + $shipping;

            $order = Order::create([
                'user_id' => $request->user()?->id ?? null,
                'number' => 'SN' . time() . Str::upper(Str::random(4)),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_amount' => $shipping,
                'total' => $total,
                'payment_method' => $data['payment_method'] ?? null,
                'shipping_info' => $data['shipping_info'],
            ]);

            foreach ($itemsData as $it) {
                $order->items()->create([
                    'product_id' => $it['product']->id,
                    'name' => $it['name'],
                    'sku' => $it['sku'],
                    'price' => $it['price'],
                    'quantity' => $it['quantity'],
                    'total' => $it['total'],
                ]);
            }

            return $order->load('items');
        });

    return $this->created($result);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items.product'])
                       ->orderByDesc('created_at')
                       ->get();

        return response()->json($orders);
    }

    public function cancel($id)
{
    $order = Order::findOrFail($id);
    $order->status = 'cancelled';
    $order->save();

    return response()->json([
        'message' => 'Commande annulée avec succès.',
        'order' => $order
    ]);
}

}

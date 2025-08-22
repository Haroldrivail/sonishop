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

    public function store(Request $request)
{
    // Valider les données reçues
    $validated = $request->validate([
        'user_id'        => 'nullable|integer|exists:users,id',
        'customer_name'  => 'required|string|max:255',
        'email'          => 'required|email|max:255',
        'phone'          => 'required|string|max:20',
        'address'        => 'required|string',
        'amount'         => 'required|numeric|min:0',
        'status'         => 'required|in:pending,confirmed,cancelled,delivered',
        'payment_method' => 'required|string|max:255',
        'delivery_method'=> 'nullable|string|max:255',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|integer|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.price' => 'required|numeric|min:0',

    ]);

    // Génération simple d'un numéro de commande unique
    $orderNumber = 'SN' . now()->format('YmdHis') . rand(100, 999);

    // Ajouter order_number aux données validées
    $validated['order_number'] = $orderNumber;

    // Extraire les items
    $items = $validated['items'];
    unset($validated['items']); // on enlève les items des données de la commande

    // Créer la commande
    $order = Order::create($validated);

    // Créer les items liés à la commande
    foreach ($items as $item) {
        $order->items()->create($item);
    }

   return response()->json([
    'message' => 'Commande enregistrée avec succès',
    'order' => $order->load('items.product')
], 201);

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

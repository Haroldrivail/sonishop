<?php

namespace App\Http\Resources;


use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->order_number,
            'customer' => $this->customer_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'amount' => $this->amount,
            'status' => $this->status,
            'paymentMethod' => $this->payment_method,
            'deliveryMethod' => $this->delivery_method,
            'date' => $this->created_at->format('Y-m-d'),
            'address' => $this->address,
            'items' => $this->items->map(function ($item) {
                return [
                    'name' => $item->product->name ?? 'Produit supprimé',
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ];
            }),
        ];
    }
}


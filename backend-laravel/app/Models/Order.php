<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'email',
        'phone',
        'address',
        'amount',
        'status',
        'payment_method',
        'delivery_method',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

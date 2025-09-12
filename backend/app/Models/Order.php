<?php

namespace App\Models;

use App\Models\User;
use App\Models\OrderItem;
use App\Models\OrderNote;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'number', 'status', 'subtotal', 'shipping_amount', 'total', 'shipping_info', 'billing_info', 'payment_method', 'estimated_delivery', 'refunded_amount', 'cancel_reason'
    ];

    protected $casts = [
        'shipping_info' => 'array',
        'billing_info' => 'array',
        'estimated_delivery' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function notes()
    {
        return $this->hasMany(OrderNote::class);
    }
}

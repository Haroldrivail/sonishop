<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'sale_price',
        'image',
        'category',
        'rating',
        'reviews',
        'in_stock',
        'is_new',
        'free_shipping',
        'sales',
    ];
}

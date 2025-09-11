<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use App\Models\Category;
use App\Models\OrderItem;

class Product extends Model
{
    use HasFactory;

    protected $casts = [
        'images' => 'array',
        'price' => 'integer',
        'sale_price' => 'integer',
    'stock' => 'integer',
        'in_stock' => 'boolean',
        'free_shipping' => 'boolean',
    ];

    protected $appends = ['image_url'];

    protected $fillable = [
        'sku','name','slug','description','price','sale_price','stock','image','images',
        'rating','reviews_count','in_stock','brand','category_id','is_new','free_shipping','sales'
    ];

    public function category() { return $this->belongsTo(Category::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
    public function reviews() { return $this->hasMany(\App\Models\Review::class); }

    public function getImageUrlAttribute(): ?string
    {
        $img = $this->image ?? ($this->images[0] ?? null);
        if (! $img) {
            // Frontend public placeholders (served by SPA) – expose relative path so client prepends its origin
            return '/Produit.png';
        }

        if (preg_match('#^https?://#i', $img)) {
            return $img;
        }

        return Storage::url($img);
    }
}

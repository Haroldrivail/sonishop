<?php

namespace App\Models;

use App\Models\Category;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'sku',
        'name',
        'slug',
        'description',
        'price',
        'sale_price',
        'stock',
        'image',
        'images',
        'rating',
        'reviews_count',
        'in_stock',
        'brand',
        'category_id',
        'is_new',
        'free_shipping',
        'sales'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        $img = $this->image ?? ($this->images[0] ?? null);
        if (!$img) {
            // 🖼️ Retourner null pour laisser le frontend gérer le placeholder
            return null;
        }

        if (preg_match('#^https?://#i', $img)) {
            return $img;
        }

        // 🌐 Générer l'URL complète du backend pour les images uploadées
        $backendUrl = rtrim(config('app.url'), '/');
        return $backendUrl . Storage::url($img);
    }
}

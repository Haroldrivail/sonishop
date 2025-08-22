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
        'stock',
        'is_new',
        'free_shipping',
        'sales',
        'category_id',
    ];

public function category()
{
    return $this->belongsTo(Category::class);
}

    // Accessor pour récupérer la catégorie sous forme de texte
    public function getCategoryTextAttribute()
{
    // Si la relation existe, on renvoie le nom
    if ($this->relationLoaded('category') && $this->category && is_object($this->category)) {
        return $this->category->name;
    }

    // Sinon, on retourne le champ brut s'il est là
    if (!empty($this->attributes['category'])) {
        return $this->attributes['category'];
    }

    return null;
}
}
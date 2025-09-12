<?php

namespace App\Models;

use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','description','parent_id', 'image', 'images'];

    protected $casts = [
        'images' => 'array',
    ];

    public function products() { return $this->hasMany(Product::class); }

    public function getImageUrlAttribute(): ?string
    {
        $img = $this->image ?? ($this->images[0] ?? null);
        if (! $img) {
            return rtrim(config('app.frontend_url'), '/') . '/Categorie.png';
        }

        // If stored already as absolute URL (starts with http), return as-is
        if (preg_match('#^https?://#i', $img)) {
            return $img;
        }

        return Storage::url($img);
    }
}

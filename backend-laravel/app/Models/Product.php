<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Les champs qu’on peut remplir en masse (via create ou update)
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',  // chemin vers l’image dans storage
    ];
}

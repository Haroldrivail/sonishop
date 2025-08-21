<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Liste tous les produits
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    // Crée un nouveau produit avec upload d'image
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'sale_price' => 'nullable|numeric',
            'category' => 'required|string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'in_stock' => 'boolean',
            'stock' => 'required|integer|min:0',
            'is_new' => 'boolean',
            'free_shipping' => 'boolean',
            'sales' => 'nullable|integer|min:0',
            'image' => 'required|string', // ou 'nullable|string' si optionnel, // max 2MB
        ]);


        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sale_price' => $request->sale_price,
            'category' => $request->category,
            'rating' => $request->rating,
            'reviews' => $request->reviews,
            'in_stock' => $request->in_stock ?? true,
            'stock' => $request->stock,
            'is_new' => $request->is_new ?? false,
            'free_shipping' => $request->free_shipping ?? false,
            'sales' => $request->sales,
            'image' => $request->image  // Utilise l'URL de l'image ou le chemin du fichier uploadé
        ]);

        return response()->json([
    'success' => true,
    'message' => 'Produit créé avec succès',
    'data' => $product
], 200);
    }

    // Affiche un produit spécifique
    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    // Met à jour un produit
    public function update(Request $request, $id)
{
    $product = Product::findOrFail($id);

    $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'description' => 'nullable|string',
        'price' => 'sometimes|required|numeric',
        'sale_price' => 'nullable|numeric',
        'category' => 'sometimes|required|string|max:100',
        'rating' => 'nullable|numeric|min:0|max:5',
        'reviews' => 'nullable|integer|min:0',
        'in_stock' => 'boolean',
        'stock' => 'required|integer|min:0',
        'is_new' => 'boolean',
        'free_shipping' => 'boolean',
        'sales' => 'nullable|integer|min:0',
        'image' => 'required|string',
    ]);

    if ($request->hasFile('image')) {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $product->image = $request->file('image')->store('products', 'public');
    } elseif ($request->filled('image')) {
        $product->image = $request->input('image');
    }

    $product->name = $request->name ?? $product->name;
    $product->description = $request->description ?? $product->description;
    $product->price = $request->price ?? $product->price;
    $product->sale_price = $request->sale_price ?? $product->sale_price;
    $product->category = $request->category ?? $product->category;
    $product->rating = $request->rating ?? $product->rating;
    $product->reviews = $request->reviews ?? $product->reviews;
    $product->in_stock = $request->has('in_stock') ? $request->in_stock : $product->in_stock;
    $product->stock = $request->stock ?? $product->stock;
    $product->is_new = $request->has('is_new') ? $request->is_new : $product->is_new;
    $product->free_shipping = $request->has('free_shipping') ? $request->free_shipping : $product->free_shipping;
    $product->sales = $request->sales ?? $product->sales;

    $product->save();

    return response()->json([
        'success' => true,
        'message' => 'Produit mis à jour avec succès',
        'data' => $product
    ], 200);
}


    // Supprime un produit
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }

    public function uploadImage(Request $request)
{
    $request->validate([
        'image' => 'required|image|max:3000', // max 3MB
    ]);

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('products', 'public');
        return response()->json(['imagePath' => $imagePath], 201);
    }

    return response()->json(['message' => 'Aucune image reçue'], 400);
}

}

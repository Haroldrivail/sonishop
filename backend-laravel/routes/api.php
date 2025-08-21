<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Models\User;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\OrderController;



// Nouvelle route à ajouter AVANT les autres routes
Route::get('/sanctum/csrf-cookie', function () {
    return response()->noContent();
})->middleware('web'); // Important: le middleware 'web' est nécessaire

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route publique pour lister les commandes
Route::get('/orders', [OrderController::class, 'index']);
Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

// Route publique pour lister les clients
Route::get('/clients', [ClientController::class, 'index']);
Route::post('/clients', [ClientController::class, 'store']);
Route::put('/clients/{id}', [ClientController::class, 'update']);
Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

// Route publique pour lister les produits
Route::get('/products', [ProductController::class, 'index']);
 Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{product}', [ProductController::class, 'update']);
Route::delete('/products/{product}', [ProductController::class, 'destroy']);
Route::post('/upload-image', [ProductController::class, 'uploadImage']);
Route::post('/products/{id}/rate', [ProductController::class, 'rate']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Routes protégées par rôle admin
   //Route::middleware('is.admin')->group(function () {
       
   // });
});
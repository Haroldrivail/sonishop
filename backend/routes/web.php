<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

Route::post('/login', function(Request $request) {
    $credentials = $request->only('email', 'password');

    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        return response()->json(['role' => $user->role]);
    }

    return response()->json(['message' => 'Identifiants invalides'], 401);
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/client/dashboard', function () {
        return 'Bienvenue, client !';
    })->name('client.dashboard');

    Route::get('/admin/dashboard', function () {
        return 'Bienvenue, admin !';
    })->name('admin.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

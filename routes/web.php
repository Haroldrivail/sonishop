<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

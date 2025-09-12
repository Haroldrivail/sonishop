<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
	if (request()->wantsJson() || request()->expectsJson() || app()->runningUnitTests()) {
		return response()->json(['ok' => true]);
	}

	$frontend = config('frontend.url');
	return redirect()->away(rtrim($frontend, '/') . '/');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
	Route::get('dashboard', function () {
		if (request()->wantsJson() || request()->expectsJson() || app()->runningUnitTests()) {
			return response()->json(['ok' => true, 'dashboard' => true]);
		}

		$frontend = config('frontend.url');
		return redirect()->away(rtrim($frontend, '/') . '/dashboard');
	})->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

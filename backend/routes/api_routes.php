<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Auth\ApiVerifyEmailController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques (sans authentification)
Route::prefix('auth')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
    Route::post('reset-password', [NewPasswordController::class, 'store']);

    // Email verification routes
    Route::get('email/verify/{id}/{hash}', [ApiVerifyEmailController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    // Route PRINCIPALE pour renvoyer l'email (pas d'auth requise)
    Route::post('email/resend', [ApiVerifyEmailController::class, 'resendByEmail'])
        ->middleware('throttle:3,1')
        ->name('verification.send');

    // Route OPTIONNELLE pour utilisateurs connectés (plus de tentatives)
    Route::post('email/resend-authenticated', [ApiVerifyEmailController::class, 'resendAuthenticated'])
        ->middleware(['auth:sanctum', 'throttle:6,1'])
        ->name('verification.send.auth');

    Route::post('verify-email', [ApiVerifyEmailController::class, 'store'])
        ->name('api.verify-email');
});

// Routes de ressources publiques
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('products/{product}/reviews', [ReviewController::class, 'index']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{category}', [CategoryController::class, 'show']);

Route::post('contact', [ContactController::class, 'store']);
Route::post('promo/validate', [PromoController::class, 'validateCode']);

// Routes protégées par authentification Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Auth user info
    Route::get('auth/me', function () {
        return response()->json(['user' => auth()->user()]);
    });

    // Email verification
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1');

    // Profile/Settings
    Route::prefix('settings')->group(function () {
        Route::get('profile', [ProfileController::class, 'edit']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::delete('profile', [ProfileController::class, 'destroy']);
        Route::put('password', [PasswordController::class, 'update']);
    });

    // Cart
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show']);
        Route::post('items', [CartController::class, 'add']);
        Route::patch('items/{item}', [CartController::class, 'updateItem']);
        Route::delete('items/{item}', [CartController::class, 'removeItem']);
        Route::post('sync', [CartController::class, 'sync']);
    });

    // Orders
    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'store']);

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('{product}', [WishlistController::class, 'toggle']);
    });

    // Addresses
    Route::apiResource('addresses', AddressController::class)->except(['show']);

    // Reviews (pour les produits achetés)
    Route::post('products/{product}/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('{id}/read', [NotificationController::class, 'markRead']);
        Route::post('read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('{id}', [NotificationController::class, 'destroy']);
    });

    // Uploads
    Route::prefix('uploads')->group(function () {
        Route::post('/', [UploadController::class, 'store']);
        Route::post('avatar', [UploadController::class, 'store']);
        Route::get('presign', [UploadController::class, 'presign']);
    });
});

// Routes admin (protégées par auth + role admin)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Vérification du rôle admin dans les contrôleurs
    Route::get('ping', function () {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(['message' => 'Admin access granted']);
    });

    // Gestion des images
    Route::patch('products/{product}/image', [ProductController::class, 'updateImage']);
    Route::patch('categories/{category}/image', [CategoryController::class, 'updateImage']);
});

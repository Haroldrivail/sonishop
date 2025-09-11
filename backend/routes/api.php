<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{CartController, OrderController, PromoController, ReviewController, UploadController, AddressController, ContactController, ProductController, CategoryController, WishlistController, DashboardController, NotificationController};
use App\Http\Controllers\Auth\{NewPasswordController, VerifyEmailController, RegisteredUserController, PasswordResetLinkController, AuthenticatedSessionController, EmailVerificationNotificationController};
use App\Http\Controllers\Settings\{ProfileController, PasswordController};
use App\Http\Controllers\Api\Admin\{AnalyticsController, OrderAdminController, SettingsController};
use App\Http\Controllers\Api\Admin\CustomerController;

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

// Auth publiques
Route::prefix('auth')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store'])->middleware('throttle:10,1');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:15,1');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('throttle:5,1');
    Route::post('reset-password', [NewPasswordController::class, 'store']);
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::get('verify-email/{id}/{hash}', [VerifyEmailController::class, '__invoke'])->middleware(['signed','throttle:6,1'])->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])->middleware(['throttle:6,1'])->name('verification.send');
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
// Authentifié (email non nécessairement vérifié)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('auth/me', fn() => response()->json(['user' => auth()->user()]));
});

// Authentifié + email vérifié
Route::middleware(['auth:sanctum','verified'])->group(function () {
    Route::prefix('settings')->controller(ProfileController::class)->group(function () {
        Route::get('profile', 'edit');
        Route::patch('profile', 'update');
        Route::delete('profile', 'destroy');
        Route::put('password',  'update');
    });

    Route::prefix('cart')->controller(CartController::class)->group(function () {
        Route::get('/',  'show');
        Route::post('items',  'add');
        Route::patch('items/{item}',  'updateItem');
        Route::delete('items/{item}',  'removeItem');
        Route::post('sync',  'sync');
    });

    Route::apiResource('orders', OrderController::class)->only(['index', 'show', 'store']);

    Route::prefix('wishlist')->controller(WishlistController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('{product}', 'toggle');
    });

    Route::apiResource('addresses', AddressController::class)->except(['show']);
    Route::post('products/{product}/reviews', [ReviewController::class, 'store']);

    Route::prefix('notifications')->controller(NotificationController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('{id}/read', 'markRead');
        Route::post('read-all', 'markAllRead');
        Route::delete('{id}', 'destroy');
    });

    Route::prefix('uploads')->controller(UploadController::class)->group(function () {
        Route::post('/', 'store');
        Route::post('avatar', 'store');
        Route::get('presign', 'presign');
    });

    Route::prefix('dashboard')->controller(DashboardController::class)->group(function () {
        Route::get('stats', 'stats');
        Route::get('sidebar', 'sidebar');
    });
});

Route::middleware(['auth:sanctum','role:admin'])->prefix('admin')->group(function () {
    Route::get('ping', fn() => response()->json(['message' => 'Admin access granted']));
    Route::patch('categories/{category}/image', [CategoryController::class, 'updateImage']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{category}', [CategoryController::class, 'update']);
    Route::patch('categories/{category}', [CategoryController::class, 'update']);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy']);
    Route::post('categories/bulk/delete', [CategoryController::class, 'bulkDestroy']);
    Route::patch('products/{product}/image', [ProductController::class, 'updateImage']);
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{product}', [ProductController::class, 'update']);
    Route::patch('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);
    Route::get('analytics/summary', [AnalyticsController::class, 'summary']);
    Route::get('analytics/export/csv', [AnalyticsController::class, 'exportCsv']);
    Route::get('analytics/export/pdf', [AnalyticsController::class, 'exportPdf']);
    Route::get('orders', [OrderAdminController::class, 'index']);
    Route::post('orders', [OrderAdminController::class, 'store']);
    Route::patch('orders/{order}/status', [OrderAdminController::class, 'updateStatus']);
    Route::post('orders/{order}/refund', [OrderAdminController::class, 'refund']);
    Route::post('orders/{order}/notes', [OrderAdminController::class, 'addNote']);
    Route::post('orders/{order}/resend-email', [OrderAdminController::class, 'resendEmail']);
    Route::post('orders/bulk/status', [OrderAdminController::class, 'bulkStatus']);
    Route::post('orders/bulk/cancel', [OrderAdminController::class, 'bulkCancel']);
    Route::get('customers', [CustomerController::class, 'index']);

    // Settings endpoints (dynamic, no données hardcodées)
    Route::match(['get','put'], 'settings/general', [SettingsController::class, 'general']);
    Route::match(['get','put'], 'settings/profile', [SettingsController::class, 'profile']);
    Route::match(['get','put'], 'settings/notifications', [SettingsController::class, 'notifications']);
    Route::match(['get','put'], 'settings/shop', [SettingsController::class, 'shop']);
    Route::match(['get','put'], 'settings/billing', [SettingsController::class, 'billing']);
    Route::match(['get','put'], 'settings/security', [SettingsController::class, 'security']);
    Route::get('settings/sessions', [SettingsController::class, 'sessions']);
});

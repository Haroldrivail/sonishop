<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use App\Models\Order;
use App\Models\Address;
use App\Models\Review;
use App\Policies\OrderPolicy;
use App\Policies\AddressPolicy;
use App\Policies\ReviewPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies to ensure they're available at runtime
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Address::class, AddressPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);

        // Alias middleware so routes can use ->middleware('role:admin') without Kernel edits
        Route::aliasMiddleware('role', \App\Http\Middleware\EnsureUserHasRole::class);
        
        // Personnalisation du mail de réinitialisation de mot de passe en français
        \Illuminate\Auth\Notifications\ResetPassword::toMailUsing(function ($notifiable, $token) {
            // Utiliser directement l'URL frontend au lieu de la route backend
            $frontend = config('frontend.url', 'http://localhost:5175');
            $url = rtrim($frontend, '/') . '/reset-password?token=' . $token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
            
            return (new \Illuminate\Notifications\Messages\MailMessage)
                ->subject('Notification de réinitialisation de mot de passe')
                ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
                ->action('Réinitialiser le mot de passe', $url)
                ->line('Ce lien de réinitialisation expirera dans ' . config('auth.passwords.'.config('auth.defaults.passwords').'.expire') . ' minutes.')
                ->line('Si vous n\'avez pas demandé de réinitialisation de mot de passe, aucune action n\'est requise.');
        });
    }
}

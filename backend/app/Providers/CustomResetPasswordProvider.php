<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\ServiceProvider;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        ResetPassword::toMailUsing(function ($notifiable, $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Notification de réinitialisation de mot de passe')
                ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.')
                ->action('Réinitialiser le mot de passe', $url)
                ->line('Ce lien de réinitialisation expirera dans ' . config('auth.passwords.'.config('auth.defaults.passwords').'.expire') . ' minutes.')
                ->line('Si vous n\'avez pas demandé de réinitialisation de mot de passe, aucune action n\'est requise.');
        });
    }
}

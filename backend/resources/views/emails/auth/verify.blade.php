@component('mail::message')
# {{ __('Verify your email address') }}

Bonjour {{ $notifiable->name ?? $notifiable->email }},

Merci d'avoir créé un compte. Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail.

@component('mail::button', ['url' => $actionUrl])
Vérifier mon adresse email
@endcomponent

Si vous n'avez pas créé de compte, ignorez ce message.

Merci,
{{ config('app.name') }}
@endcomponent

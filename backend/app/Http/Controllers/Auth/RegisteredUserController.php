<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;
use App\Http\Controllers\Concerns\RedirectsToFrontend;
// Inertia removed: backend now redirects to frontend for web flows

class RegisteredUserController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the registration page.
     */
    public function create(): RedirectResponse|JsonResponse
    {
        $frontend = $this->frontendUrl();
        // API-only: return redirect to frontend if configured, otherwise
        // return a minimal JSON payload indicating registration is available.
        if ($frontend) {
            return redirect()->away(rtrim($frontend, '/') . '/register');
        }

        return response()->json(['register' => true]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Optional fields provided by the SPA
            'phone' => ['nullable','string','max:32'],
            'city' => ['nullable','string','max:255'],
            'quartier' => ['nullable','string','max:255'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'city' => $request->city,
            'quartier' => $request->quartier,
        ]);

        event(new Registered($user));

        // API: pas de token tant que l'email n'est pas vérifié
        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'status' => 'created',
                'email_verification_required' => true,
                'message' => 'Un email de vérification vous a été envoyé. Veuillez confirmer votre adresse pour activer votre compte.',
                'user' => $user,
            ], 201);
        }

        // Web: connexion de session classique
        Auth::login($user);
        return redirect()->intended(route('dashboard', absolute: false));
    }
}

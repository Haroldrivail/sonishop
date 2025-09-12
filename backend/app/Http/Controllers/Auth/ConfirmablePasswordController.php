<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

use App\Http\Controllers\Concerns\RedirectsToFrontend;

class ConfirmablePasswordController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the confirm password page.
     */
    public function show(): Response|RedirectResponse|JsonResponse
    {
        if (request()->wantsJson() || request()->expectsJson()) {
            return response()->json(['show' => 'confirm-password']);
        }
        $frontend = $this->frontendUrl();
        if ($frontend) {
            return redirect()->away(rtrim($frontend, '/') . '/confirm-password');
        }

        return response()->json(['confirm' => true]);
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'message' => __('auth.password'),
                ], 422);
            }

            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        if ($request->hasSession()) {
            $request->session()->put('auth.password_confirmed_at', time());
        }

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['confirmed' => true]);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['message' => 'Utilisateur non trouvé'], 404);
            }
            return back()->withErrors(['email' => 'Utilisateur non trouvé']);
        }

        if ($user->hasVerifiedEmail()) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['message' => 'already-verified']);
            }
            return redirect()->intended(route('dashboard', absolute: false));
        }

        $user->sendEmailVerificationNotification();

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => 'verification-link-sent']);
        }

        return back()->with('status', 'verification-link-sent');
    }
}

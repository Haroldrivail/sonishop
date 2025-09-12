<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(Request $request, $id, $hash): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        // Trouver l'utilisateur
        $user = User::findOrFail($id);

        // Vérifier la signature de l'URL
        if (!URL::hasValidSignature($request)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Invalid or expired verification link.',
                    'verified' => false
                ], 400);
            }
            return redirect('/login?error=invalid_verification');
        }

        // Vérifier le hash
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Invalid verification link.',
                    'verified' => false
                ], 400);
            }
            return redirect('/login?error=invalid_verification');
        }

        if ($user->hasVerifiedEmail()) {
            // Créer un token même si déjà vérifié
            $token = $user->createToken('email-verification')->plainTextToken;

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Email already verified.',
                    'verified' => true,
                    'user_role' => $user->role,
                    'token' => $token
                ]);
            }

            // Redirection basée sur le rôle même si déjà vérifié
            $frontendUrl = config('frontend.url', 'http://localhost:5173');

            if ($user->role === 'admin') {
                return redirect()->away($frontendUrl . '/dashboard?already_verified=1&token=' . urlencode($token));
            } else {
                return redirect()->away($frontendUrl . '/?already_verified=1&token=' . urlencode($token));
            }
        }

        // Marquer l'email comme vérifié
        $user->markEmailAsVerified();

        // Créer un token d'authentification temporaire pour le frontend
        $token = $user->createToken('email-verification')->plainTextToken;

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Email verified successfully.',
                'verified' => true,
                'user_role' => $user->role,
                'token' => $token
            ]);
        }

        // Redirection basée sur le rôle de l'utilisateur avec le token
        $frontendUrl = config('frontend.url', 'http://localhost:5173');

        if ($user->role === 'admin') {
            return redirect()->away($frontendUrl . '/dashboard?verified=1&token=' . urlencode($token));
        } else {
            return redirect()->away($frontendUrl . '/?verified=1&token=' . urlencode($token));
        }
    }
}

<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\RedirectsToFrontend;

class EmailVerificationPromptController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): \Illuminate\Http\RedirectResponse|JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['verified' => true]);
            }

            return redirect()->intended(route('dashboard', absolute: false));
        }

        if ($request->wantsJson() || $request->expectsJson()) {
            $status = $request->hasSession() ? $request->session()->get('status') : null;
            return response()->json(['verified' => false, 'status' => $status]);
        }

    $frontend = $this->frontendUrl();
    if ($frontend) {
        return redirect()->away(rtrim($frontend, '/') . '/verify-email');
    }

    return response()->json(['verify_email' => true]);
    }
}

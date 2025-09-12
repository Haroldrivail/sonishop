<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\RedirectsToFrontend;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\JsonResponse;

class PasswordResetLinkController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): \Illuminate\Http\RedirectResponse|JsonResponse
    {
        $frontend = $this->frontendUrl();
        if ($frontend) {
            return redirect()->away(rtrim($frontend, '/') . '/forgot-password');
        }

        return response()->json(['forgot_password' => true]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => __($status)]);
        }

        return back()->with('status', __('A reset link will be sent if the account exists.'));
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\RedirectsToFrontend;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class NewPasswordController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the password reset page.
     */
    public function create(Request $request): \Illuminate\Http\RedirectResponse|JsonResponse
    {
        $frontend = $this->frontendUrl();
        $url = rtrim($frontend ?? '', '/') . '/reset-password?token=' . urlencode($request->route('token'));
        if ($request->email) {
            $url .= '&email=' . urlencode($request->email);
        }

        if ($frontend) {
            return redirect()->away($url);
        }

        return response()->json(['reset_password' => ['token' => $request->route('token'), 'email' => $request->email]]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($request->wantsJson() || $request->expectsJson()) {
            if ($status == Password::PASSWORD_RESET) {
                return response()->json(['message' => __($status)]);
            }

            return response()->json(['message' => __($status)], 400);
        }

        // Web flow
        if ($status == Password::PASSWORD_RESET) {
            return to_route('login')->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}

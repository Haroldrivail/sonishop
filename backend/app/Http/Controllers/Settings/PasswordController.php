<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use App\Http\Controllers\Concerns\RedirectsToFrontend;

class PasswordController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response|RedirectResponse|JsonResponse
    {
        if (request()->wantsJson() || request()->expectsJson()) {
            return response()->json([]);
        }

        $frontend = $this->frontendUrl();
        if ($frontend) {
            return redirect()->away(rtrim($frontend, '/') . '/settings/password');
        }

        return response()->json(['password' => true]);
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back();
    }
}

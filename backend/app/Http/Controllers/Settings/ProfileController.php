<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Controllers\Concerns\RedirectsToFrontend;

class ProfileController extends Controller
{
    use RedirectsToFrontend;
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response|RedirectResponse|JsonResponse
    {
        $mustVerifyEmail = $request->user() instanceof MustVerifyEmail;
    $status = $request->hasSession() ? $request->session()->get('status') : null;

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'mustVerifyEmail' => $mustVerifyEmail,
                'status' => $status,
            ]);
        }

        $frontend = $this->frontendUrl();
        if ($frontend) {
            return redirect()->away(rtrim($frontend, '/') . '/settings/profile');
        }

        return response()->json(['mustVerifyEmail' => $mustVerifyEmail, 'status' => $status]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

    // ensure we call logout on the web guard
    Auth::guard('web')->logout();

        $user->delete();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

    return redirect(route('home'));
    }
}

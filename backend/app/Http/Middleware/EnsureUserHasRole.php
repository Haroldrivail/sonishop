<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $authorized = false;
        if (method_exists($user, 'hasRole')) {
            $authorized = $user->hasRole($role);
        } else {
            // Fallback: compare direct column if exists
            $authorized = isset($user->role) && $user->role === $role;
        }

        if (! $authorized) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $next($request);
    }
}

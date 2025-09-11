<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Closure;

class HandleInertiaRequests
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // No-op for API-only backend; frontend assets are served by the SPA.
        return null;
    }
    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Provide minimal shared data for compatibility; API clients should
        // fetch authenticated user via the /api/auth/me endpoint instead.
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
        ];
    }

    /**
     * Allow this middleware to be used in the HTTP kernel pipeline.
     * For the API-only backend we simply pass the request through.
     */
    public function handle(Request $request, Closure $next)
    {
        return $next($request);
    }
}

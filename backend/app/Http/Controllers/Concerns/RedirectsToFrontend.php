<?php

namespace App\Http\Controllers\Concerns;

trait RedirectsToFrontend
{
    /**
     * Return the frontend url but return null when running unit tests so
     * legacy view-based tests keep working.
     */
    protected function frontendUrl(): ?string
    {
        // When running tests, return null so controllers render local views
        if (app()->runningUnitTests()) {
            return null;
        }

        return config('frontend.url');
    }
}

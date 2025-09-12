<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Review;
use App\Models\Address;
use App\Models\Product;
use App\Models\Category;
use App\Policies\OrderPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\AddressPolicy;
use App\Policies\ProductPolicy;
use App\Policies\CategoryPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Order::class => OrderPolicy::class,
        Address::class => AddressPolicy::class,
        Review::class => ReviewPolicy::class,
        Product::class => ProductPolicy::class,
        Category::class => CategoryPolicy::class,
    ];

    public function register(): void
    {
        // ...
    }

    public function boot(): void
    {
        // register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}

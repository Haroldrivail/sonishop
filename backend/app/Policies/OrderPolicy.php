<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(?User $user, Order $order): bool
    {
        if ($user === null) return false;
        return $user->id === $order->user_id || ($user->role ?? null) === 'admin';
    }

    public function create(?User $user): bool
    {
        // allow guests and authenticated users to create orders
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || ($user->role ?? null) === 'admin';
    }

    public function cancel(User $user, Order $order): bool
    {
        // owner can cancel while pending; admin can always cancel
        if (($user->role ?? null) === 'admin') return true;
        return $user->id === $order->user_id && $order->status === 'pending';
    }
}

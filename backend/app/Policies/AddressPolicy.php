<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;

class AddressPolicy
{
    public function update(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || ($user->role ?? null) === 'admin';
    }

    public function delete(User $user, Address $address): bool
    {
        return $user->id === $address->user_id || ($user->role ?? null) === 'admin';
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserAdminController extends Controller
{
    public function updateAvatar(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            'avatar' => 'nullable|string',
        ]);

        if (array_key_exists('avatar', $data)) {
            $user->avatar = $data['avatar'];
            $user->save();
        }

        return response()->json(['data' => [
            'id' => $user->id,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
        ]]);
    }
}

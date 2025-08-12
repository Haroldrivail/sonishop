<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
           'name' => 'required|string|max:255',
           'email' => 'required|string|email|unique:users',
           'phone' => 'nullable|string|max:20',
           'location' => 'nullable|string|max:255',
           'password' => 'required|string|confirmed|min:6',
        ]);

        $user = User::create([
           'name' => $request->name,
           'email' => $request->email,
           'phone' => $request->phone,
           'location' => $request->location,
           'password' => Hash::make($request->password),
            'role' => 'user', // ici on force le rôle
        ]);

        return response()->json(['message' => 'User created'], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
           'email' => 'required|string|email',
           'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('token-name')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return $request->user();
    }
}

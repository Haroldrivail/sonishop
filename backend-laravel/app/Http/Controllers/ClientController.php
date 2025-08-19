<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /**
     * Liste tous les clients
     */
    public function index()
    {
        $clients = User::where('role', 'client')
            ->orderBy('created_at', 'desc')
            ->get()
            ->makeHidden(['password', 'remember_token']);

        return response()->json($clients);
    }

    /**
     * Créer un nouveau client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'phone' => 'required|string|max:13',
            'address' => 'required|string|max:255',
            'password' => 'required|string|min:8', // Pas de confirmation ici
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'password' => bcrypt($validated['password']),
            'role' => 'client'
        ]);

        return response()->json([
            'message' => 'Client créé avec succès',
            'client' => $user->only(['id', 'name', 'email', 'phone', 'address', 'role'])
        ], 201);
    }

    /**
     * Met à jour les informations d’un client
     */
    public function update(Request $request, $id)
    {
        $client = User::where('role', 'client')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                Rule::unique('users')->ignore($client->id)
            ],
            'phone' => 'nullable|string|max:13',
            'address' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8'
        ]);

        $client->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $client->phone,
            'address' => $validated['address'] ?? $client->address,
            'password' => isset($validated['password']) ? bcrypt($validated['password']) : $client->password
        ]);

        return response()->json([
            'message' => 'Client mis à jour avec succès',
            'client' => $client->only(['id', 'name', 'email', 'phone', 'address', 'role'])
        ]);
    }

    /**
     * Supprime un client
     */
    public function destroy($id)
    {
        $client = User::where('role', 'client')->findOrFail($id);
        $client->delete();

        return response()->json([
            'message' => 'Client supprimé avec succès'
        ]);
    }

    /**
     * Voir un client spécifique (optionnel)
     */
    public function show($id)
    {
        $client = User::where('role', 'client')->findOrFail($id);

        return response()->json(
            $client->makeHidden(['password', 'remember_token'])
        );
    }
}

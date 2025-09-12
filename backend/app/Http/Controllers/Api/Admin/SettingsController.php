<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * Generic helper: fetch a category settings keyed map.
     */
    protected function getCategory(string $category, array $defaults): array
    {
        try {
            $rows = Setting::where('category', $category)->get();
        } catch (\Throwable $e) {
            // Si la table n'existe pas encore (migration non exécutée) retourner seulement les defaults
            if (str_contains($e->getMessage(), 'Base table or view not found') || str_contains($e->getMessage(), 'no such table')) {
                return $defaults;
            }
            throw $e; // autre erreur -> remonter
        }
        $data = $defaults;
        foreach ($rows as $row) {
            $val = $row->value;
            if (is_array($val) && Arr::has($val, 'value')) {
                $val = $val['value'];
            }
            $data[$row->key] = $val;
        }
        return $data;
    }

    /**
     * Generic helper: upsert category settings with allowed keys only.
     */
    protected function upsertCategory(string $category, array $allowed, array $payload): array
    {
        $filtered = Arr::only($payload, $allowed);
    DB::transaction(function () use ($filtered, $category) {
            foreach ($filtered as $key => $value) {
                Setting::updateOrCreate(
            // Inclure la catégorie dans les critères de recherche (meilleure isolation logique)
            ['category' => $category, 'key' => $key],
            ['value' => $value]
                );
            }
        });
        return $filtered;
    }

    public function general(Request $request)
    {
        $defaults = [
            'appName' => config('app.name', 'SoniShop'),
            'appVersion' => '1.0.0',
            'language' => 'fr',
            'timezone' => config('app.timezone', 'UTC'),
            'debugMode' => (bool) config('app.debug'),
            'autoCache' => true,
        ];
        if ($request->isMethod('get')) {
            return response()->json($this->getCategory('general', $defaults));
        }
        $data = $request->validate([
            'appName' => 'sometimes|string|max:100',
            'appVersion' => 'sometimes|string|max:50',
            'language' => ['sometimes','string', Rule::in(['fr','en','es'])],
            'timezone' => 'sometimes|string|max:60',
            'debugMode' => 'sometimes|boolean',
            'autoCache' => 'sometimes|boolean',
        ]);
        $saved = $this->upsertCategory('general', array_keys($defaults), $data);
        return response()->json($saved, 200);
    }

    public function profile(Request $request)
    {
        // Admin profile uses current authenticated user fields (no new storage needed)
        $user = $request->user();
        if ($request->isMethod('get')) {
            return response()->json([
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->city ?? $user->quartier,
                'bio' => null,
                'avatar' => $user->avatar_url,
            ]);
        }
        $data = $request->validate([
            'firstName' => 'sometimes|string|max:60',
            'lastName' => 'sometimes|string|max:60',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string|max:40',
            'address' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
        ]);
        if (isset($data['firstName'])) $user->first_name = $data['firstName'];
        if (isset($data['lastName'])) $user->last_name = $data['lastName'];
        if (isset($data['email'])) $user->email = $data['email'];
        if (isset($data['phone'])) $user->phone = $data['phone'];
        if (isset($data['address'])) $user->city = $data['address'];
        $user->save();
        return response()->json(['saved' => true]);
    }

    public function notifications(Request $request)
    {
        $defaults = [
            'emailOrders' => true,
            'emailProducts' => false,
            'emailCustomers' => true,
            'pushOrders' => true,
            'pushProducts' => false,
            'pushCustomers' => false,
            'smsOrders' => false,
            'smsProducts' => false,
            'smsCustomers' => false,
        ];
        if ($request->isMethod('get')) {
            return response()->json($this->getCategory('notifications', $defaults));
        }
        $data = $request->validate([
            '*.emailOrders' => 'sometimes|boolean',
        ]);
        // simpler: just take all booleans present
        $payload = [];
        foreach ($defaults as $k => $_) {
            if ($request->has($k)) $payload[$k] = (bool) $request->boolean($k);
        }
        $saved = $this->upsertCategory('notifications', array_keys($defaults), $payload);
        return response()->json($saved, 200);
    }

    public function shop(Request $request)
    {
        $defaults = [
            'shopName' => 'SoniShop',
            'currency' => 'XAF',
            'description' => '',
            'contactEmail' => 'contact@example.com',
            'contactPhone' => '',
            'physicalAddress' => '',
            'autoAcceptOrders' => true,
            'autoStockAlerts' => true,
        ];
        if ($request->isMethod('get')) {
            return response()->json($this->getCategory('shop', $defaults));
        }
        $data = $request->validate([
            'shopName' => 'sometimes|string|max:120',
            'currency' => 'sometimes|string|max:10',
            'description' => 'nullable|string',
            'contactEmail' => 'sometimes|email',
            'contactPhone' => 'nullable|string|max:40',
            'physicalAddress' => 'nullable|string|max:255',
            'autoAcceptOrders' => 'sometimes|boolean',
            'autoStockAlerts' => 'sometimes|boolean',
        ]);
        $saved = $this->upsertCategory('shop', array_keys($defaults), $data);
        return response()->json($saved, 200);
    }

    public function billing(Request $request)
    {
        $defaults = [
            'currentPlan' => 'Free',
            'planPrice' => '0',
            'nextBilling' => null,
            'paymentMethod' => null,
            'invoices' => [],
        ];
        if ($request->isMethod('get')) {
            return response()->json($this->getCategory('billing', $defaults));
        }
        $data = $request->validate([
            'currentPlan' => 'sometimes|string|max:60',
            'planPrice' => 'sometimes|string|max:40',
            'nextBilling' => 'nullable|string|max:60',
            'paymentMethod' => 'nullable|string|max:60',
            'invoices' => 'nullable|array',
        ]);
        $saved = $this->upsertCategory('billing', array_keys($defaults), $data);
        return response()->json($saved, 200);
    }

    public function security(Request $request)
    {
        $defaults = [
            'twoFactorEnabled' => false,
        ];
        if ($request->isMethod('get')) {
            $base = $this->getCategory('security', $defaults);
            $base['sessions'] = $this->sessionsList($request);
            return response()->json($base);
        }
        $data = $request->validate([
            'twoFactorEnabled' => 'sometimes|boolean'
        ]);
        $saved = $this->upsertCategory('security', array_keys($defaults), $data);
        return response()->json($saved, 200);
    }

    public function sessions(Request $request)
    {
        return response()->json(['sessions' => $this->sessionsList($request)]);
    }

    protected function sessionsList(Request $request): array
    {
        // Very lightweight: list current token (if Sanctum) only.
        $user = $request->user();
        if (!method_exists($user, 'tokens')) {
            return [];
        }
        return $user->tokens()->latest()->limit(10)->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'device' => $token->name ?? 'API Token',
                'location' => null,
                'current' => true, // Without user agent tracking; extend later
                'lastActive' => $token->last_used_at?->toIso8601String(),
            ];
        })->toArray();
    }
}

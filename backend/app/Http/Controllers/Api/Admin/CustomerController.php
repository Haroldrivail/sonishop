<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        $search = $request->query('search');
        $status = $request->query('status'); // vip|active|new|inactive

        $thirtyDaysAgo = now()->subDays(30)->startOfDay();

        $caseStatus = "CASE ".
            "WHEN COALESCE(SUM(orders.total),0) > 3000000 THEN 'vip' ".
            "WHEN (users.created_at >= '".$thirtyDaysAgo->toDateTimeString()."' AND COUNT(orders.id) < 3) THEN 'new' ".
            "WHEN COUNT(orders.id) > 0 THEN 'active' ".
            "ELSE 'inactive' END as computed_status";

        $query = User::query()
            ->leftJoin('orders','orders.user_id','=','users.id')
            ->select('users.*', DB::raw('COALESCE(SUM(orders.total),0) as total_spent'), DB::raw($caseStatus))
            ->withCount('orders')
            ->groupBy('users.id');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('users.name','like',"%$search%")
                  ->orWhere('users.email','like',"%$search%")
                  ->orWhere('users.phone','like',"%$search%");
            });
        }

        if ($status && in_array($status, ['vip','active','new','inactive'])) {
            $query->havingRaw('computed_status = ?', [$status]);
        }

        $paginator = $query->latest('users.created_at')->paginate($perPage);

        // Transform items (add derived status heuristics)
        $items = collect($paginator->items())->map(function($user) {
            $totalSpent = (int) $user->total_spent;
            $ordersCount = (int) $user->orders_count;
            $status = $user->computed_status ?? 'inactive';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'city' => $user->city,
                'quartier' => $user->quartier,
                'country' => $user->country,
                'created_at' => optional($user->created_at)->toIso8601String(),
                'orders_count' => $ordersCount,
                'total_spent' => $totalSpent,
                'status' => $status,
                'avatar' => $user->avatar_url,
            ];
        });

        $meta = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];

        return $this->ok([
            'items' => $items,
            'pagination' => $meta,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;
    public function stats(Request $request)
    {
        $user = $request->user();
        // Optionnel: si admin uniquement
    if ($user && $user->role === 'admin') {
            $today = Carbon::today();
            $start30 = $today->copy()->subDays(29);

            $orders30 = Order::whereBetween('created_at', [$start30->startOfDay(), $today->endOfDay()]);
            $revenue = (int) $orders30->sum('total');
            $ordersCount = (int) $orders30->count();
            $customers = (int) User::whereBetween('created_at', [$start30->startOfDay(), $today->endOfDay()])->count();
            $products = (int) Product::count();

            $topCategories = Category::query()
                ->select('categories.id','categories.name', DB::raw('COALESCE(SUM(order_items.total),0) as revenue'))
                ->leftJoin('products','products.category_id','=','categories.id')
                ->leftJoin('order_items','order_items.product_id','=','products.id')
                ->groupBy('categories.id','categories.name')
                ->orderByDesc('revenue')
                ->limit(5)
                ->get();

            // Dernières commandes avec client
            $recentOrders = Order::with('user:id,name,email')
                ->latest()
                ->take(10)
                ->get(['id','number','status','total','user_id','created_at']);

            return $this->ok([
                'revenue_30d' => $revenue,
                'orders_30d' => $ordersCount,
                'new_customers_30d' => $customers,
                'products_count' => $products,
                'top_categories' => $topCategories,
                'recent_orders' => $recentOrders,
            ]);
        }

        // Fallback simplifié pour user non admin (peut retourner panier ou commandes récentes)
    $userOrders = $user?->orders()->latest()->take(5)->get(['id','number','status','total','created_at']) ?? [];
        return $this->ok([
            'recent_orders' => $userOrders,
        ]);
    }

    public function sidebar(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';
        $items = [
            ['id' => 'overview', 'label' => 'Aperçu', 'icon' => 'home', 'href' => '/admin'],
            ['id' => 'orders', 'label' => 'Commandes', 'icon' => 'orders', 'href' => '/admin/orders'],
            ['id' => 'products', 'label' => 'Produits', 'icon' => 'box', 'href' => '/admin/products'],
        ];
        if ($isAdmin) {
            $items[] = ['id' => 'analytics', 'label' => 'Analytics', 'icon' => 'chart', 'href' => '/admin/analytics'];
            $items[] = ['id' => 'settings', 'label' => 'Paramètres', 'icon' => 'settings', 'href' => '/admin/settings'];
        }
    return $this->ok(['items' => $items]);
    }
}

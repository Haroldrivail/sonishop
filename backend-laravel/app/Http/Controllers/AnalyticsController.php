<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Category;

class AnalyticsController extends Controller
{
    public function getAnalytics(Request $request)
    {
        $range = $request->query('range', '30d');

        // Définir la plage de dates
        $startDate = match ($range) {
            '7d' => Carbon::now()->subDays(7),
            '90d' => Carbon::now()->subDays(90),
            default => Carbon::now()->subDays(30),
        };

        $endDate = Carbon::now();

        // 📈 Chiffre d'affaires total
        $totalRevenue = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled') // filtrer les annulées
            ->sum('amount');

        // 🛒 Nombre de commandes
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();

        // 👥 Nouveaux clients
        $newClients = User::whereBetween('created_at', [$startDate, $endDate])
            ->where('role', 'client')
            ->count();

        // 🛍️ Panier moyen
        $avgOrderValue = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;

        // 📊 Évolution journalière
        $salesEvolution = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // 👑 Top 5 clients
        $topClients = Order::select('customer_name', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as orders'))
    ->whereBetween('created_at', [$startDate, $endDate])
    ->groupBy('customer_name')
    ->orderByDesc('total')
    ->take(5)
    ->get()
    ->map(function ($order) {
        return [
            'name' => $order->customer_name ?? 'Inconnu',
            'total' => $order->total,
            'orders' => $order->orders,
            'growth' => 0, // facultatif
        ];
    });


        // 📦 Répartition par catégorie
        $categorySales = Category::withCount([
            'products as total_sales' => function ($query) use ($startDate, $endDate) {
                $query->select(DB::raw('SUM(order_items.quantity)'))
                    ->join('order_items', 'products.id', '=', 'order_items.product_id')
                    ->join('orders', 'orders.id', '=', 'order_items.order_id')
                    ->whereBetween('orders.created_at', [$startDate, $endDate])
                    ->where('orders.status', '!=', 'cancelled');
            }
        ])->get()->map(function ($category) {
            return [
                'name' => $category->name,
                'sales' => (int) $category->total_sales,
            ];
        });

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'avg_order_value' => $avgOrderValue,
            'new_clients' => $newClients,
            'sales_evolution' => $salesEvolution,
            'top_clients' => $topClients,
            'category_sales' => $categorySales,
        ]); 
    }
}

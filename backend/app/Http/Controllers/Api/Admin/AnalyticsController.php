<?php

namespace App\Http\Controllers\Api\Admin;

use Carbon\Carbon;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Barryvdh\DomPDF\Facades\Pdf;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class AnalyticsController extends Controller
{
    /**
     * Return aggregated metrics for the given range.
     * Query param range: 7d|30d|90d (default 30d)
     * Response shape: {
     *   range: '30d',
     *   days: [{ date: 'YYYY-MM-DD', revenue: int, orders: int, customers: int }],
     *   totals: { revenue: int, orders: int, customers: int, avg_order_value: float }
     * }
     */
    public function summary(Request $request)
    {
        $this->authorizeAdmin($request);

        $range = $request->query('range', '30d');
        $daysCount = match($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $end = Carbon::today();
        $start = $end->copy()->subDays($daysCount - 1); // inclusive window

        // Base date skeleton
        $period = collect();
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $period->push([
                'date' => $date->format('Y-m-d'),
                'revenue' => 0,
                'orders' => 0,
                'customers' => 0,
            ]);
        }
        $byDate = $period->keyBy('date');

        // Orders aggregation
        $orders = Order::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue')
            ->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        foreach ($orders as $row) {
            $key = $row->date;
            if ($byDate->has($key)) {
                $item = $byDate->get($key);
                $item['orders'] = (int) $row->orders;
                $item['revenue'] = (int) $row->revenue;
                $byDate->put($key, $item);
            }
        }

        // New customers (registered users having created_at in range)
        $customers = User::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as customers')
            ->whereBetween('created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        foreach ($customers as $row) {
            $key = $row->date;
            if ($byDate->has($key)) {
                $item = $byDate->get($key);
                $item['customers'] = (int) $row->customers;
                $byDate->put($key, $item);
            }
        }

        $days = array_values($byDate->toArray());
        $totRevenue = array_sum(array_column($days, 'revenue'));
        $totOrders = array_sum(array_column($days, 'orders'));
        $totCustomers = array_sum(array_column($days, 'customers'));

    // Top products (by revenue & quantity) limited param
        $limit = (int) $request->query('limit', 5);
    $topProducts = OrderItem::query()
            ->selectRaw('product_id, name, SUM(quantity) as qty, SUM(total) as revenue')
            ->whereBetween('created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy('product_id', 'name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        // Category distribution (based on order items joined to products)
    $categoryDistribution = OrderItem::query()
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->selectRaw('categories.id as category_id, categories.name as name, SUM(order_items.total) as revenue, SUM(order_items.quantity) as qty')
            ->whereBetween('order_items.created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(function($row) use ($totRevenue) {
                return [
                    'category_id' => $row->category_id,
                    'name' => $row->name,
                    'revenue' => (int) $row->revenue,
                    'qty' => (int) $row->qty,
                    'share' => $totRevenue > 0 ? round(($row->revenue / $totRevenue) * 100, 2) : 0,
                ];
            });

        // Performance metrics additionnelles
        $avgRating = round(\App\Models\Review::avg('rating') ?? 0, 2);
        // Hypothèses: taux retour = items dont quantity < 0 (si implémenté) sinon placeholder calculé
        $returns = OrderItem::where('quantity', '<', 0)->sum(DB::raw('ABS(quantity)')); // si pas utilisé restera 0
        $soldUnits = OrderItem::whereBetween('created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])->sum('quantity');
        $returnRate = $soldUnits > 0 ? round(($returns / $soldUnits) * 100, 2) : 0;
        $performance = [
            'customer_satisfaction' => $avgRating > 0 ? round(($avgRating / 5) * 100, 2) : 0,
            'retention_rate' => null, // nécessite données de cohortes
            'avg_delivery_time_days' => null, // nécessite champs logistiques
            'return_rate_percent' => $returnRate,
        ];

        return response()->json([
            'range' => $range,
            'days' => $days,
            'totals' => [
                'revenue' => $totRevenue,
                'orders' => $totOrders,
                'customers' => $totCustomers,
                'avg_order_value' => $totOrders > 0 ? $totRevenue / $totOrders : 0,
            ],
            'top_products' => $topProducts,
            'categories' => $categoryDistribution,
            'performance' => $performance,
        ]);
    }

    /**
     * Export summary as CSV (days + totals)
     */
    public function exportCsv(Request $request)
    {
        $this->authorizeAdmin($request);
        $range = $request->query('range', '30d');
        // Reuse logic by calling summary internally (without extra queries duplication ideally you'd extract service)
        $summary = $this->summary(clone $request)->getData(true);

        $filename = "analytics_{$range}_" . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($summary) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date','Revenue','Orders','New Customers']);
            foreach ($summary['days'] as $d) {
                fputcsv($out, [$d['date'], $d['revenue'], $d['orders'], $d['customers']]);
            }
            fputcsv($out, []);
            fputcsv($out, ['TOTALS', $summary['totals']['revenue'], $summary['totals']['orders'], $summary['totals']['customers']]);
            fclose($out);
        };
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export summary as PDF (simple table)
     */
    public function exportPdf(Request $request)
    {
        $this->authorizeAdmin($request);
        $range = $request->query('range', '30d');
        $summary = $this->summary(clone $request)->getData(true);

        $html = view('pdf.analytics', ['summary' => $summary, 'range' => $range])->render();
    $pdf = Pdf::loadHTML($html)->setPaper('a4','portrait');
        $filename = "analytics_{$range}_" . date('Ymd_His') . '.pdf';
        return $pdf->download($filename);
    }

    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }
}

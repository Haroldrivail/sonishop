<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderNote;
use Carbon\Carbon;

class OrderAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $search = trim($request->query('search', ''));
        $status = $request->query('status', 'all');
        $period = $request->query('period', 'all'); // today|week|month|all
        $perPage = (int) min(100, max(5, $request->query('per_page', 15)));

        $query = Order::with(['user:id,name,email'])
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $like = "%$search%";
                    $qq->where('number', 'like', $like)
                        ->orWhere('id', 'like', $like)
                        ->orWhereHas('user', fn($u) => $u->where('name', 'like', $like)->orWhere('email', 'like', $like));
                });
            });

        if ($period !== 'all') {
            $today = Carbon::today();
            $start = match($period) {
                'today' => $today->copy(),
                'week' => $today->copy()->startOfWeek(),
                'month' => $today->copy()->startOfMonth(),
                default => null,
            };
            if ($start) {
                $query->whereBetween('created_at', [$start->startOfDay(), $today->endOfDay()]);
            }
        }

        $orders = $query->latest()->paginate($perPage);

        $mapped = collect($orders->items())->map(function ($o) {
            $shipping = $o->shipping_info ?? [];
            $deliveryMethod = $shipping['delivery_option'] ?? $shipping['method'] ?? 'standard';
            return [
                'id' => $o->id,
                'display_id' => '#' . ($o->number ?? $o->id),
                'number' => $o->number,
                'customer' => $o->user?->name ?? 'Client inconnu',
                'email' => $o->user?->email,
                'amount' => (int) $o->total,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'delivery_method' => $deliveryMethod,
                'date' => $o->created_at?->toIso8601String(),
                'items_count' => $o->items()->count(),
            ];
        });

        return response()->json([
            'data' => $mapped,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'customer' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'amount' => 'required|integer|min:0',
            'status' => 'nullable|string',
            'payment_method' => 'nullable|string|max:50',
            'delivery_method' => 'nullable|string|max:50',
        ]);
        $number = 'ORD-' . Carbon::now()->format('YmdHis') . '-' . rand(100,999);
        $order = Order::create([
            'user_id' => $data['user_id'] ?? null,
            'number' => $number,
            'status' => $data['status'] ?? 'pending',
            'subtotal' => $data['amount'],
            'shipping_amount' => 0,
            'total' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? null,
            'shipping_info' => [ 'method' => $data['delivery_method'] ?? 'standard' ],
        ]);
        return response()->json(['data' => [
            'id' => $order->id,
            'display_id' => '#' . $order->number,
            'number' => $order->number,
            'customer' => $order->user?->name ?? ($data['customer'] ?? 'Client'),
            'email' => $order->user?->email,
            'amount' => (int)$order->total,
            'status' => $order->status,
            'payment_method' => $order->payment_method,
            'delivery_method' => $data['delivery_method'] ?? 'standard',
            'date' => $order->created_at?->toIso8601String(),
        ]], 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        $data = $request->validate(['status' => 'required|string', 'cancel_reason' => 'nullable|string|max:255']);
        $order->status = $data['status'];
        if ($data['status'] === 'cancelled' && !empty($data['cancel_reason'])) {
            $order->cancel_reason = $data['cancel_reason'];
        }
        $order->save();
        return response()->json(['data' => ['id'=>$order->id, 'status'=>$order->status, 'cancel_reason'=>$order->cancel_reason]]);
    }

    public function refund(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        $data = $request->validate(['amount' => 'required|integer|min:1']);
        $amount = $data['amount'];
        if ($amount > $order->total) {
            return response()->json(['message' => 'Montant supérieur au total'], 422);
        }
        $order->refunded_amount = $amount;
        $order->status = 'refunded';
        $order->save();
        return response()->json(['data' => ['id'=>$order->id, 'status'=>$order->status, 'refunded_amount'=>$order->refunded_amount]]);
    }

    public function addNote(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        $data = $request->validate(['content'=>'required|string']);
        $note = OrderNote::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'content' => $data['content'],
        ]);
        return response()->json(['data' => [
            'id' => $note->id,
            'content' => $note->content,
            'author' => $user->name,
            'created_at' => $note->created_at?->toIso8601String()
        ]], 201);
    }

    public function bulkStatus(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:orders,id',
            'status' => 'required|string'
        ]);
        Order::whereIn('id', $data['ids'])->update(['status'=>$data['status']]);
        return response()->json(['updated' => count($data['ids']), 'status' => $data['status']]);
    }

    public function bulkCancel(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        $data = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:orders,id',
            'reason' => 'nullable|string|max:255'
        ]);
        Order::whereIn('id', $data['ids'])->update(['status'=>'cancelled', 'cancel_reason'=>$data['reason'] ?? null]);
        return response()->json(['cancelled' => count($data['ids'])]);
    }

    public function resendEmail(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') return response()->json(['message'=>'Forbidden'],403);
        // TODO: déclencher un mail réel (Notification)
        return response()->json(['message' => 'Email resent (stub)']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;

class NotificationController extends Controller
{
    use ApiResponse;
    public function index(Request $request)
    {
        $user = $request->user();
        $items = $user->notifications()->latest()->paginate(20);
    return $this->ok($items);
    }

    public function markRead(Request $request, $id)
    {
        $n = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $n->markAsRead();
    return $this->ok(['ok' => true]);
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
    return $this->ok(['ok' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $n = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $n->delete();
    return $this->ok(['ok' => true]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;
use App\Notifications\NewContactMessage;
use App\Models\User;
use App\Http\Traits\ApiResponse;

class ContactController extends Controller
{
    use ApiResponse;
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'subject' => 'nullable|string',
            'message' => 'required|string',
        ]);

        // queue mail to support
        Mail::to(config('mail.from.address'))->queue(new ContactFormMail($data));

        // notify admins
        User::where('role', 'admin')->get()->each(function ($admin) use ($data) {
            $admin->notify(new NewContactMessage($data));
        });

    return $this->created(['ok' => true]);
    }
}

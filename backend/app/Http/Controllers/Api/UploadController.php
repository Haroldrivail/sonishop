<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Traits\ApiResponse;

class UploadController extends Controller
{
    use ApiResponse;
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,svg,gif|max:5120',
            'folder' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $folder = $data['folder'] ?? 'uploads';

        // ensure folder exists on the public disk
        $allowed = ['uploads', 'avatars', 'products', 'categories', 'tmp'];
        if (! in_array($folder, $allowed, true)) {
            $folder = 'uploads';
        }

        Storage::disk('public')->makeDirectory($folder);

        $path = $file->storePublicly("public/{$folder}");
        $url = Storage::url($path);

        if ($folder === 'avatars' && $request->user()) {
            $user = $request->user();
            $user->avatar = $url;
            $user->save();
        }

    return $this->created(['url' => $url, 'path' => $path]);
    }

    public function presign(Request $request)
    {
    return $this->error('Presign not supported for local storage.', 400);
    }
}

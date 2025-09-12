<?php

namespace App\Http\Traits;

trait ApiResponse
{
    protected function ok($data = null, array $meta = [])
    {
        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'meta' => (object) $meta,
        ]);
    }

    protected function created($data = null)
    {
        return response()->json([
            'status' => 'created',
            'data' => $data,
        ], 201);
    }

    protected function error(string $message, int $code = 400, $errors = null)
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }
}

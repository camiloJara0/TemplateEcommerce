<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success($data = null, string $message = 'Operación exitosa', int $status = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    public static function error(string $message, int $status = 400, ?string $type = null, $data = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($type) {
            $response['type'] = $type;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    public static function validation(array $errors, string $message = 'Datos inválidos'): JsonResponse
    {
        return self::error($message, 422, 'VALIDATION_ERROR', ['errors' => $errors]);
    }
}
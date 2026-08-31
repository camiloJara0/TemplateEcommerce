<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use App\Models\PushSubscription;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notificaciones = NotificationLog::mias(auth()->id())
            ->latest()
            ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'items' => $notificaciones->items(),
            'pagination' => [
                'total' => $notificaciones->total(),
                'per_page' => $notificaciones->perPage(),
                'current_page' => $notificaciones->currentPage(),
                'last_page' => $notificaciones->lastPage(),
            ],
        ]);
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
            'auth' => 'nullable|string',
            'p256dh' => 'nullable|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'endpoint' => $validated['endpoint'],
            ],
            [
                'auth' => $validated['auth'] ?? null,
                'p256dh' => $validated['p256dh'] ?? null,
            ]
        );

        return ApiResponse::success($subscription, 'Suscripción push registrada', 201);
    }

    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|url',
        ]);

        PushSubscription::where('user_id', auth()->id())
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return ApiResponse::success(null, 'Suscripción push eliminada');
    }
}
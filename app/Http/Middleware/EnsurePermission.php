<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permiso)
    {
        if (!$request->user() || !$request->user()->tienePermiso($permiso)) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        return $next($request);
    }
}
<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, ...$slugs)
    {
        if (!$request->user() || !$request->user()->tieneRol(...$slugs)) {
            return ApiResponse::error('No autorizado', 403, 'FORBIDDEN');
        }

        return $next($request);
    }
}
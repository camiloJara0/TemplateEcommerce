<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StoreLocale
{
    public function handle(Request $request, Closure $next)
    {
        $idioma = $request->header('Accept-Language')
            ?? $request->get('lang')
            ?? store_setting('default_language', 'es');

        if (is_string($idioma)) {
            app()->setLocale($idioma);
        }

        return $next($request);
    }
}
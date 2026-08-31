<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>{{ $asunto ?? config('app.name') }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #F2F6FF;
            color: #0B1220;
            -webkit-font-smoothing: antialiased;
            text-size-adjust: 100%;
        }
        table { border-collapse: collapse; width: 100%; }

        .app-shell { background-color: #F2F6FF; padding: 40px 16px; }
        .container { max-width: 600px; margin: 0 auto; }

        .card {
            background-color: #FFFFFF;
            border-radius: 20px;
            border: 1px solid rgba(100, 116, 139, 0.16);
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
            padding: 40px 40px 36px;
        }

        .header { text-align: center; margin-bottom: 32px; }
        .logo-mark {
            width: 52px; height: 52px;
            border-radius: 16px;
            background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
            color: #FFFFFF;
            font-size: 26px;
            font-weight: 700;
            line-height: 52px;
            margin: 0 auto 14px;
        }
        .brand {
            font-size: 18px;
            font-weight: 700;
            color: #0B1220;
            letter-spacing: -0.02em;
        }

        .saludo { font-size: 22px; font-weight: 700; color: #0B1220; letter-spacing: -0.02em; margin-bottom: 8px; }
        .texto { font-size: 15px; line-height: 1.6; color: #64748B; margin-bottom: 20px; }
        .texto b, .texto strong { color: #0B1220; font-weight: 600; }

        .detalle {
            display: block;
            background-color: #F8FAFC;
            border: 1px solid rgba(100, 116, 139, 0.16);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .detalle-titulo { font-size: 16px; font-weight: 600; color: #0B1220; margin-bottom: 6px; }
        .detalle-sub { font-size: 13px; color: #64748B; line-height: 1.5; }
        .detalle-sub b { color: #0B1220; font-weight: 600; }

        .badge {
            display: inline-block;
            background-color: #2563EB;
            color: #FFFFFF;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 999px;
        }
        .badge-exito { background-color: #22C55E; }
        .badge-info { background-color: #06B6D4; }
        .badge-advertencia { background-color: #F59E0B; }
        .badge-error { background-color: #EF4444; }
        .badge-claro { background-color: #EEF2FF; color: #2563EB; }

        .estados { text-align: center; margin: 8px 0 24px; }
        .estado-pill {
            display: inline-block;
            background-color: #F8FAFC;
            border: 1px solid rgba(100, 116, 139, 0.16);
            color: #0B1220;
            font-size: 13px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 999px;
        }
        .estado-flecha {
            display: inline-block;
            color: #64748B;
            font-size: 16px;
            font-weight: 600;
            padding: 0 8px;
        }

        .centro { text-align: center; margin: 28px 0 8px; }
        .btn {
            display: inline-block;
            background-color: #2563EB;
            color: #FFFFFF !important;
            font-size: 15px;
            font-weight: 600;
            padding: 14px 34px;
            border-radius: 999px;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.30);
        }
        .btn-secundario {
            background-color: #EEF2FF;
            color: #2563EB !important;
            box-shadow: none;
        }

        .nota {
            font-size: 12px;
            color: #94A3B8;
            line-height: 1.5;
            margin-top: 16px;
            border-top: 1px solid rgba(100, 116, 139, 0.16);
            padding-top: 16px;
        }

        .footer { text-align: center; padding: 28px 20px 8px; }
        .footer p { font-size: 12px; color: #94A3B8; line-height: 1.6; margin-bottom: 4px; }
        .footer a { color: #2563EB; text-decoration: none; }

        @media (prefers-color-scheme: dark) {
            body { background-color: #0A0F1E; color: #F8FAFC; }
            .app-shell { background-color: #0A0F1E; }
            .card {
                background-color: #0E1526;
                border-color: rgba(148, 163, 184, 0.14);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            }
            .brand, .saludo, .detalle-titulo, .detalle-sub b { color: #F8FAFC; }
            .texto, .detalle-sub { color: #94A3B8; }
            .texto b, .texto strong { color: #F8FAFC; }
            .detalle, .estado-pill { background-color: #0A0F1E; border-color: rgba(148, 163, 184, 0.14); }
            .estado-pill { color: #F8FAFC; }
            .estado-flecha { color: #94A3B8; }
            .nota { border-color: rgba(148, 163, 184, 0.14); color: #64748B; }
            .badge-claro, .btn-secundario { background-color: rgba(59, 130, 246, 0.18); color: #3B82F6 !important; }
            .logo-mark { background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); }
            .btn { background-color: #3B82F6; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35); }
            .footer a { color: #3B82F6; }
        }

        [data-ogsc] body, [data-ogsb] body,
        [data-ogsc] .app-shell, [data-ogsb] .app-shell { background-color: #0A0F1E !important; }
        [data-ogsc] .card, [data-ogsb] .card { background-color: #0E1526 !important; border-color: rgba(148, 163, 184, 0.14) !important; }
        [data-ogsc] .brand, [data-ogsb] .brand,
        [data-ogsc] .saludo, [data-ogsb] .saludo,
        [data-ogsc] .detalle-titulo, [data-ogsb] .detalle-titulo { color: #F8FAFC !important; }
        [data-ogsc] .texto, [data-ogsb] .texto,
        [data-ogsc] .detalle-sub, [data-ogsb] .detalle-sub { color: #94A3B8 !important; }
        [data-ogsc] .detalle, [data-ogsb] .detalle,
        [data-ogsc] .estado-pill, [data-ogsb] .estado-pill { background-color: #0A0F1E !important; border-color: rgba(148, 163, 184, 0.14) !important; }
        [data-ogsc] .btn, [data-ogsb] .btn { background-color: #3B82F6 !important; }
    </style>
</head>
<body>
    <div class="app-shell">
        <table role="presentation" class="container">
            <tr>
                <td>
                    <div class="card">
                        <div class="header">
                            <div class="logo-mark">{{ config('app.name')[0] }}</div>
                            <div class="brand">{{ config('app.name') }}</div>
                        </div>

                        @yield('contenido')

                        <p class="nota">Recibiste este correo porque tienes actividad reciente en {{ config('app.name') }}. Si no esperabas este mensaje, puedes ignorarlo con seguridad.</p>
                    </div>

                    <div class="footer">
                        <p>{{ config('app.name') }} · Todos los derechos reservados</p>
                        <p>© {{ date('Y') }} <a href="{{ config('app.url') }}">{{ config('app.url') }}</a></p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

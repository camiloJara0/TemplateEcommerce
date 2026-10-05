<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Confirma tu suscripción</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:12px;overflow:hidden;">

                    {{-- Encabezado --}}
                    <tr>
                        <td align="center"
                            style="background:#2563eb;color:#ffffff;padding:40px 20px;">
                            <h1 style="margin:0;">
                                ¡Bienvenido!
                            </h1>
                            <p style="margin-top:10px;">
                                Gracias por suscribirte a nuestras novedades.
                            </p>
                        </td>
                    </tr>

                    {{-- Contenido --}}
                    <tr>
                        <td style="padding:40px;">

                            @if(!empty($user))
                                <div style="text-align:center;margin-bottom:25px;">

                                    @if(!empty($user->foto))
                                        {{ $user->foto }}nombre }}"
                                            width="90"
                                            height="90"
                                            style="border-radius:50%;object-fit:cover;">
                                    @endif

                                    <h2 style="margin-top:15px;color:#1f2937;">
                                        Hola {{ $user->nombre ?? 'Usuario' }},
                                    </h2>
                                </div>
                            @else
                                <h2 style="color:#1f2937;">
                                    Hola,
                                </h2>
                            @endif

                            <p style="color:#4b5563;">
                                Hemos registrado correctamente tu correo electrónico para recibir:
                            </p>

                            <ul style="color:#4b5563;">
                                <li>Nuevos productos.</li>
                                <li>Promociones y descuentos exclusivos.</li>
                                <li>Novedades de la tienda.</li>
                                <li>Recomendaciones personalizadas.</li>
                            </ul>

                            <div
                                style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:15px;margin:25px 0;">
                                <strong>Correo registrado:</strong><br>
                                {{ $correo }}
                                <a href={{ $verificationUrl }}>
                                    Confirmar suscripción
                                </a>
                            </div>

                            <p style="color:#4b5563;">
                                Si no realizaste esta suscripción, puedes ignorar este mensaje.
                            </p>

                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td
                            style="background:#f8fafc;padding:25px;text-align:center;font-size:12px;color:#6b7280;">

                            <strong>{{ config('app.name') }}</strong><br>
                            Gracias por formar parte de nuestra comunidad.

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
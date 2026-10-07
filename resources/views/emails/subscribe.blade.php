<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirma tu suscripción</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;">
        <tr>
          <td align="center" style="background:#2563eb;color:#ffffff;padding:36px 20px;">
            <h1 style="margin:0;font-size:26px;">¡Bienvenido!</h1>
            <p style="margin-top:10px;font-size:15px;color:#dbeafe;">
              Gracias por suscribirte a nuestras novedades.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px;">
            <h2 style="margin-top:0;color:#1f2937;font-size:20px;">
              @if(!empty($user) && !empty($user->nombre))
                Hola {{ $user->nombre }},
              @else
                Hola,
              @endif
            </h2>

            <p style="color:#4b5563;line-height:1.7;">
              Hemos registrado correctamente tu correo electrónico para recibir:
            </p>

            <ul style="color:#4b5563;line-height:1.9;">
              <li>Nuevos productos.</li>
              <li>Promociones y descuentos exclusivos.</li>
              <li>Novedades de la tienda.</li>
              <li>Recomendaciones personalizadas.</li>
            </ul>

            <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:18px;margin:26px 0;text-align:center;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">Correo registrado</p>
              <p style="margin:0 0 18px;font-weight:bold;color:#111827;">{{ $correo }}</p>
              <a href="{{ $verificationUrl }}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;">
                Confirmar suscripción
              </a>
            </div>

            <p style="color:#4b5563;font-size:14px;">
              Si no realizaste esta suscripción, puedes ignorar este mensaje.
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f8fafc;padding:24px;text-align:center;font-size:12px;color:#6b7280;">
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

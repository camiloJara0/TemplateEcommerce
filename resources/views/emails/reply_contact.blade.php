<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Respuesta a su solicitud</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.6;">

    <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
        
        <h2 style="color: #2563eb;">
            Hola {{ $contact_message['nombre'] ?? 'Usuario' }},
        </h2>

        <p>
            Hemos recibido su mensaje y queremos agradecerle por contactarnos.
        </p>

        <p>
            A continuación encontrará nuestra respuesta:
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            {!! nl2br(e($mensaje)) !!}
        </div>

        <hr style="margin: 30px 0;">

        <h3>Datos de su consulta</h3>

        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Nombre:</td>
                <td style="padding: 8px;">{{ $contact_message->nombre ?? '' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold;">Correo:</td>
                <td style="padding: 8px;">{{ $contact_message->correo ?? '' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold;">Asunto:</td>
                <td style="padding: 8px;">{{ $contact_message->asunto ?? '' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold;">Mensaje:</td>
                <td style="padding: 8px;">
                    {!! nl2br(e($contact_message->mensaje ?? '')) !!}
                </td>
            </tr>
        </table>

        <hr style="margin: 30px 0;">

        <p>
            Si tiene alguna duda adicional, estaremos atentos a ayudarle.
        </p>

        <p>
            Cordialmente,<br>
            <strong>{{ config('app.name') }}</strong>
        </p>

    </div>

</body>
</html>
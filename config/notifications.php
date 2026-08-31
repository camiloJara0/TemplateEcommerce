<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración de notificaciones
    |--------------------------------------------------------------------------
    |
    | Canales activos por defecto. 'database' guarda el log de notificación,
    | 'mail' envía correo, 'push' envía web-push y 'log' solo registra en el
    | canal de log de Laravel (útil para desarrollo con MAIL_MAILER=log).
    |
    */

    'channels' => ['database', 'mail'],
];
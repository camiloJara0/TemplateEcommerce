<?php

return [
    'vapid_subject' => env('VAPID_SUBJECT', 'mailto:no-reply@taskflow.com'),
    'vapid_public_key' => env('VAPID_PUBLIC_KEY'),
    'vapid_private_key' => env('VAPID_PRIVATE_KEY'),

    'default_icon' => '/pwa-192x192.png',
    'default_badge' => '/pwa-192x192.png',
    'ttl' => 86400,
];

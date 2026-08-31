<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Permisos por rol
    |--------------------------------------------------------------------------
    |
    | Mapa de permisos por slug de rol. 'x.*' otorga todos los permisos del
    | módulo x y '*' otorga acceso total. Es la forma más simple de gestionar
    | permisos sin tablas adicionales: se edita este archivo y se despliega.
    |
    | Módulos disponibles (fases del template):
    |   productos, inventario, pedidos, pagos, envios, cupones,
    |   reviews, clientes, usuarios, reportes, config
    |
    */

    'roles' => [
        'admin' => ['*'],

        'vendedor' => [
            'productos.*',
            'inventario.*',
            'pedidos.ver',
            'pedidos.gestionar',
            'clientes.ver',
            'reviews.moderar',
            'cupones.ver',
        ],

        'cliente' => [
            // Los clientes no tienen permisos de panel; sus acciones
            // se autorizan por autenticación directa.
        ],

        'operador_logistica' => [
            'pedidos.ver',
            'pedidos.gestionar',
            'envios.*',
        ],
    ],
];
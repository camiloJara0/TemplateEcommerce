<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $general = [
            ['store_name', 'Mi Tienda', 'general'],
            ['store_tagline', 'Calidad y estilo en un solo lugar', 'general'],
            ['logo', '', 'general'],
            ['currency', 'COP', 'general'],
            ['tax_rate', 0.19, 'general'],
            ['default_language', 'es', 'general'],
            ['support_email', 'soporte@mitienda.com', 'general'],
            ['support_phone', '+57 300 000 0000', 'general'],
        ];

        $colores = [
            ['color_primario', '#2563EB', 'colores'],
            ['color_secundario', '#3B82F6', 'colores'],
            ['color_fondo', '#FFFFFF', 'colores'],
        ];

        $seo = [
            ['meta_title', 'Mi Tienda | Compra online', 'seo'],
            ['meta_description', 'Descubre los mejores productos con envío a todo el país.', 'seo'],
            ['meta_keywords', 'tienda online, productos, ofertas', 'seo'],
            ['og_image', '', 'seo'],
        ];

        foreach (array_merge($general, $colores, $seo) as [$clave, $valor, $grupo]) {
            Setting::updateOrCreate(['key' => $clave], [
                'value' => $valor,
                'group' => $grupo,
            ]);
        }
    }
}
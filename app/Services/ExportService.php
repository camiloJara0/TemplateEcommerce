<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Str;

class ExportService
{
    public function csv(array $encabezados, array $filas, string $nombre): Response
    {
        $output = fopen('php://temp', 'r+');

        fputcsv($output, $encabezados);

        foreach ($filas as $fila) {
            fputcsv($output, array_values($fila));
        }

        rewind($output);
        $contenido = stream_get_contents($output);
        fclose($output);

        return response($contenido)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $nombre . '.csv"');
    }

    public function pdf(string $vista, array $datos, string $nombre): Response
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($vista, $datos)
            ->setPaper('letter', 'landscape');

        return $pdf->download($nombre . '.pdf');
    }

    public function excel(array $encabezados, array $filas, string $nombre): Response
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        $xml .= 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
        $xml .= '<Worksheet ss:Name="' . $this->xmlEscape($nombre) . '">';
        $xml .= '<Table>';

        $xml .= '<Row>';
        foreach ($encabezados as $encabezado) {
            $xml .= '<Cell><Data ss:Type="String">' . $this->xmlEscape($encabezado) . '</Data></Cell>';
        }
        $xml .= '</Row>';

        foreach ($filas as $fila) {
            $xml .= '<Row>';
            foreach (array_values($fila) as $valor) {
                $esNumero = is_numeric($valor);
                $tipo = $esNumero ? 'Number' : 'String';
                $xml .= '<Cell><Data ss:Type="' . $tipo . '">' . $this->xmlEscape((string) $valor) . '</Data></Cell>';
            }
            $xml .= '</Row>';
        }

        $xml .= '</Table></Worksheet></Workbook>';

        return response($xml)
            ->header('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $nombre . '.xls"');
    }

    private function xmlEscape(string $valor): string
    {
        return htmlspecialchars($valor, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    public static function nombre(string $base): string
    {
        return $base . '-' . Str::slug(now()->toDateTimeString());
    }
}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #0B1220; }
        h1 { font-size: 18px; color: #2563EB; margin-bottom: 4px; }
        .meta { color: #64748B; margin-bottom: 16px; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #2563EB; color: #fff; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
        td { padding: 5px 8px; border-bottom: 1px solid #E2E8F0; }
        tr:nth-child(even) td { background-color: #F8FAFC; }
    </style>
</head>
<body>
    <h1>{{ $titulo }}</h1>
    <div class="meta">Generado el {{ now()->format('d/m/Y H:i') }}</div>
    <table>
        <thead>
            <tr>
                @foreach($encabezados as $encabezado)
                    <th>{{ $encabezado }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($filas as $fila)
                <tr>
                    @foreach(array_values($fila) as $valor)
                        <td>{{ $valor }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
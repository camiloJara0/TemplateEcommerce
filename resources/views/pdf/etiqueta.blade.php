<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Etiqueta {{ $shipment->tracking_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #0B1220; font-size: 11px; width: 100%; }
        .etiqueta { border: 2px solid #0B1220; padding: 10px; }
        .header { display: flex; justify-content: space-between; border-bottom: 1px solid #0B1220; padding-bottom: 6px; margin-bottom: 8px; }
        .brand { font-size: 14px; font-weight: bold; }
        .carrier { font-size: 11px; text-transform: uppercase; font-weight: bold; }
        .row { margin-bottom: 6px; }
        .label { font-size: 8px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
        .valor { font-size: 12px; font-weight: bold; }
        .valor-sm { font-size: 10px; }
        .barcode { margin-top: 8px; text-align: center; }
        table.bc { border-collapse: collapse; margin: 0 auto; }
        table.bc td { height: 42px; padding: 0; }
        table.bc td.bar { background: #000; }
        .tracking-text { text-align: center; font-size: 12px; font-weight: bold; letter-spacing: 2px; margin-top: 3px; }
        .footer { margin-top: 8px; border-top: 1px solid #0B1220; padding-top: 5px; display: flex; justify-content: space-between; font-size: 9px; }
    </style>
</head>
<body>
    <div class="etiqueta">
        <div class="header">
            <div class="brand">{{ $tienda['nombre'] }}</div>
            <div class="carrier">{{ strtoupper($shipment->carrier) }}</div>
        </div>

        <div class="row">
            <div class="label">Destinatario</div>
            <div class="valor">{{ $shipment->destinatario ?? $shipment->order?->user?->nombre ?? '—' }}</div>
        </div>

        <div class="row">
            <div class="label">Dirección</div>
            <div class="valor-sm">{{ $shipment->direccion }}</div>
            <div class="valor-sm">{{ $shipment->ciudad }}{{ $shipment->codigo_postal ? ' · CP ' . $shipment->codigo_postal : '' }}</div>
        </div>

        <div class="row" style="display: flex; justify-content: space-between;">
            <div>
                <div class="label">Pedido</div>
                <div class="valor-sm">{{ $shipment->order?->numero ?? '—' }}</div>
            </div>
            <div>
                <div class="label">Peso (kg)</div>
                <div class="valor-sm">{{ number_format((float) $shipment->weight, 2) }}</div>
            </div>
            <div>
                <div class="label">Entrega est.</div>
                <div class="valor-sm">{{ $shipment->estimated_delivery?->format('d/m/Y') ?? '—' }}</div>
            </div>
        </div>

        <div class="barcode">
            <table class="bc"><tr>
                @foreach($barcode as $indice => $ancho)
                    <td class="{{ $indice % 2 === 0 ? 'bar' : '' }}" style="width: {{ $ancho * 1.4 }}px;"></td>
                @endforeach
            </tr></table>
            <div class="tracking-text">{{ $shipment->tracking_number }}</div>
        </div>

        <div class="footer">
            <span>Origen: {{ $tienda['nombre'] }}</span>
            <span>{{ now()->format('d/m/Y H:i') }}</span>
        </div>
    </div>
</body>
</html>

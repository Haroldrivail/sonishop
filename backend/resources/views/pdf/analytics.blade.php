<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Rapport Analytics {{ strtoupper($range) }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size:12px; color:#111; }
        h1 { font-size:18px; margin:0 0 10px; }
        table { width:100%; border-collapse: collapse; margin-bottom:18px; }
        th, td { border:1px solid #ddd; padding:6px 8px; text-align:left; }
        th { background:#f5f5f5; }
        .text-right { text-align:right; }
        .small { font-size:10px; color:#555; }
    </style>
</head>
<body>
    <h1>Rapport Analytics ({{ $range }})</h1>
    <p class="small">Généré le {{ date('Y-m-d H:i') }}</p>

    <h3>Synthèse</h3>
    <table>
        <tr>
            <th>Revenu Total</th>
            <th>Commandes</th>
            <th>Nouveaux Clients</th>
            <th>Panier Moyen</th>
        </tr>
        <tr>
            <td class="text-right">{{ number_format($summary['totals']['revenue'],0,'',' ') }}</td>
            <td class="text-right">{{ $summary['totals']['orders'] }}</td>
            <td class="text-right">{{ $summary['totals']['customers'] }}</td>
            <td class="text-right">{{ number_format($summary['totals']['avg_order_value'],0,'',' ') }}</td>
        </tr>
    </table>

    <h3>Détails par jour</h3>
    <table>
        <tr>
            <th>Date</th>
            <th>Revenu</th>
            <th>Commandes</th>
            <th>Nouveaux Clients</th>
        </tr>
        @foreach($summary['days'] as $d)
            <tr>
                <td>{{ $d['date'] }}</td>
                <td class="text-right">{{ number_format($d['revenue'],0,'',' ') }}</td>
                <td class="text-right">{{ $d['orders'] }}</td>
                <td class="text-right">{{ $d['customers'] }}</td>
            </tr>
        @endforeach
    </table>

    @if(!empty($summary['top_products']))
    <h3>Top Produits</h3>
    <table>
        <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Revenu</th>
        </tr>
        @foreach($summary['top_products'] as $p)
            <tr>
                <td>{{ $p['name'] }}</td>
                <td class="text-right">{{ $p['qty'] }}</td>
                <td class="text-right">{{ number_format($p['revenue'],0,'',' ') }}</td>
            </tr>
        @endforeach
    </table>
    @endif

    @if(!empty($summary['categories']))
    <h3>Catégories</h3>
    <table>
        <tr>
            <th>Catégorie</th>
            <th>Revenu</th>
            <th>Qté</th>
            <th>Part (%)</th>
        </tr>
        @foreach($summary['categories'] as $c)
            <tr>
                <td>{{ $c['name'] }}</td>
                <td class="text-right">{{ number_format($c['revenue'],0,'',' ') }}</td>
                <td class="text-right">{{ $c['qty'] }}</td>
                <td class="text-right">{{ $c['share'] }}</td>
            </tr>
        @endforeach
    </table>
    @endif
</body>
</html>

# CX Overview — API Contract

The frontend calls five `GET` endpoints. All paths are relative to `VITE_API_BASE_URL` (default `/api`).
Responses are JSON. The mock data in `src/api/mockData.js` follows this contract exactly, so you can
diff your responses against it.

| # | Path | Used by |
|---|------|---------|
| 1 | `GET /api/cx/filters` | Header dropdowns (zone, channel, month) |
| 2 | `GET /api/cx/overview` | Live pill, CX Health card, Business KPI achievement bars |
| 3 | `GET /api/cx/business-kpis/trend` | Business KPIs → Trend Analysis chart |
| 4 | `GET /api/cx/attention` | Needs Attention section |
| 5 | `GET /api/cx/purchase-funnel` | Purchase funnel section |

Endpoints 2–5 all take the filter params:

| Param | Type | Example | Notes |
|-------|------|---------|-------|
| `zone` | string | `all`, `north` | from `/cx/filters → zones[].value` |
| `channel` | string | `all`, `nexa` | from `/cx/filters → channels[].value` |
| `month` | `YYYY-MM` | `2026-08` | from `/cx/filters → months[].value` |

Sections load independently: if `/cx/attention` fails, only that card shows an error + Retry.

**General rule:** send raw numbers, not formatted strings. The UI formats (`2450000 → 24.5 L`,
`10400 → 10.4 K`) and computes percentages (`actual / target`).

---

## 1. `GET /api/cx/filters`

```json
{
  "zones":    [{ "value": "all", "label": "All zones" }, { "value": "north", "label": "North" }],
  "channels": [{ "value": "all", "label": "All channels" }, { "value": "nexa", "label": "NEXA" }],
  "months":   [{ "value": "2026-08", "label": "August 2026" }, { "value": "2026-07", "label": "July 2026" }],
  "defaults": { "zone": "all", "channel": "all", "month": "2026-08" }
}
```

List order = dropdown order (newest month first). `defaults` = what the page loads with.

## 2. `GET /api/cx/overview?zone=all&channel=all&month=2026-08`

```json
{
  "status": { "isLive": true, "label": "August 2026", "updatedAt": "2026-10-14T09:30:00+05:30" },
  "cxHealth": {
    "score": 72,
    "max": 100,
    "delta": 3,
    "comparedTo": "Jul",
    "dimensions": [
      { "key": "ease",          "label": "Ease",          "score": 78, "target": 80, "delta": 2 },
      { "key": "emotion",       "label": "Emotion",       "score": 66, "target": 72, "delta": -2 },
      { "key": "effectiveness", "label": "Effectiveness", "score": 72, "target": 75, "delta": 1 }
    ]
  },
  "trend": {
    "rangeLabel": "Jun – Aug",
    "dimensions": {
      "ease": {
        "ucl": 82,
        "lcl": 70,
        "points": [
          { "period": "2026-06", "label": "Jun", "value": 75 },
          { "period": "2026-07", "label": "Jul", "value": 76 },
          { "period": "2026-08", "label": "Aug", "value": 78 }
        ]
      },
      "emotion":       { "ucl": 74, "lcl": 60, "points": [ "...same shape..." ] },
      "effectiveness": { "ucl": 77, "lcl": 63, "points": [ "...same shape..." ] }
    }
  },
  "businessKpis": [
    { "key": "revenue",    "label": "Revenue",    "actual": 10400, "target": 12200, "unit": "INR Cr" },
    { "key": "leads",      "label": "Leads",      "actual": 3500,  "target": 4200,  "unit": "count" },
    { "key": "test-drive", "label": "Test Drive", "actual": 1600,  "target": 2200,  "unit": "count" },
    { "key": "bookings",   "label": "Bookings",   "actual": 2900,  "target": 3200,  "unit": "count" },
    { "key": "net-sales",  "label": "Net Sales",  "actual": 1400,  "target": 1800,  "unit": "count" }
  ]
}
```

- `status.isLive` → green pulsing dot + "Live ·" prefix. `false` for past months.
- `cxHealth.delta` / `comparedTo` → the "+3 vs Jul" pill. `comparedTo` may be `null`.
- `dimensions` → max 3 rings (blue, teal, lavender in that order). Clicking a dimension shows
  `trend.dimensions[<key>]` as "<Label> trend". Keys must match between the two.
- `ucl` / `lcl` are optional (omit or `null` to hide the dashed lines). Last point = highlighted month.
- `businessKpis[].key` is passed to endpoint 3 as `kpi`.

## 3. `GET /api/cx/business-kpis/trend?kpi=revenue&zone=all&channel=all&month=2026-08`

```json
{
  "kpi": "revenue",
  "label": "Revenue",
  "unit": "INR Cr",
  "points": [
    { "period": "2026-06", "label": "Jun", "actual": 9180,  "target": 11500 },
    { "period": "2026-07", "label": "Jul", "actual": 9720,  "target": 11800 },
    { "period": "2026-08", "label": "Aug", "actual": 10400, "target": 12200 }
  ]
}
```

- Oldest first, ending at `month`. The design shows 3 months; more also works.
- The chart plots achievement % = `actual / target` (Revenue → 79%, 82%, 85%).

## 4. `GET /api/cx/attention?zone=all&channel=all&month=2026-08`

```json
{
  "recommendationsUrl": "/recommendations",
  "items": [
    {
      "id": "att-1",
      "severity": "critical",
      "category": "Growth & Conversion",
      "categoryIcon": "growth",
      "dueDate": "2026-10-15",
      "overdue": false,
      "metric": { "value": 19, "format": "percent" },
      "title": "Cancellation reversal rate",
      "subtitle": "68% of goal · 339 didn’t convert",
      "link": "/attention/att-1"
    }
  ]
}
```

| Field | Values |
|-------|--------|
| `severity` | `critical` (red) · `at-risk` (amber) · `watch` (teal) |
| `categoryIcon` | `growth` · `experience` · `digital` (unknown → generic icon) |
| `dueDate` | `YYYY-MM-DD`, shown as "by 15 Oct" |
| `overdue` | `true` adds the red "Overdue" tag |
| `metric.format` | `percent` → "19%" · `seconds` → "3.8s" · `count` → "24.5 L" · `score` → "41" |

The design shows 3 cards in a row; send them in priority order. `subtitle` is free text.

## 5. `GET /api/cx/purchase-funnel?zone=all&channel=all&month=2026-08`

```json
{
  "stages": [
    {
      "key": "awareness",
      "label": "Awareness",
      "icon": "awareness",
      "status": "critical",
      "metric": { "label": "Total traffic", "actual": 2450000, "target": 3000000, "format": "count" },
      "movers": {
        "up":   [
          { "key": "organic", "label": "Organic sessions", "delta": 8,   "unit": "%" },
          { "key": "ctr",     "label": "Paid search CTR",  "delta": 0.4, "unit": "pp" }
        ],
        "down": [
          { "key": "bounce",  "label": "Bounce rate",      "delta": 3,   "unit": "pp" }
        ]
      }
    }
  ]
}
```

| Field | Values |
|-------|--------|
| `icon` | `awareness` · `interest` · `consideration` · `booking` · `delivery` · `post-purchase` |
| `status` | `on-track` (green) · `at-risk` (amber) · `critical` (red) — colours the icon dot and "% of goal" |
| `metric.format` | `count` (Indian short scale: K / L / Cr) · `percent` · `score` · `seconds` |
| `movers.up` / `movers.down` | KPIs that improved / worsened. Counts show as ↑ 2 ↓ 1; clicking one opens the list |
| `movers[].unit` | `%` → "+8%" · `pp` → "+0.4 pp" · `count` → "+1.2 K" · `seconds` → "+0.6s" |

Six stages in funnel order. "% of goal" is computed by the UI.

---

## Errors

Return a non-2xx status with a JSON body; the UI shows `message` with a Retry button:

```json
{ "message": "Data for 2026-09 is not published yet", "code": "NOT_READY" }
```

## Auth / CORS

- Requests are sent with `credentials: "include"` (cookies). If you use tokens, fill in
  `getAuthHeaders()` in `src/api/client.js`.
- In dev, Vite proxies `/api` → `VITE_PROXY_TARGET` (default `http://localhost:8000`), so no CORS
  setup is needed locally. In production, serve the API on the same origin or allow the frontend
  origin in CORS.

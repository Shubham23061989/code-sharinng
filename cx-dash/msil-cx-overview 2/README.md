# MSIL · CX Overview (React + Vite)

Implementation of the **CX Overview** screen from the Figma file
*MBB Color style variation – 14/10/2026* (MSIL).

## Run

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:5173
```

Runs on **mock data** by default — no backend needed.

## Switch to the real backend

In `.env.local`:

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=http://localhost:8000   # your backend
```

Restart `npm run dev`. Endpoints and JSON shapes are in **[API_CONTRACT.md](./API_CONTRACT.md)**.

## Where things live

```
src/
  api/
    endpoints.js     ← endpoint paths (placeholders)
    client.js        ← fetch wrapper: query params, errors, abort, auth header hook
    cxService.js     ← getFilters / getOverview / getKpiTrend (mock ↔ real switch)
    mockData.js      ← mock responses matching the contract
  hooks/useApi.js    ← loading / error / refetch / abort handling
  components/
    Sidebar.jsx, OverviewHeader.jsx, FilterSelect.jsx
    CxHealthCard.jsx     (rings + selectable dimensions → "<dimension> trend" chart with UCL/LCL)
    BusinessKpisCard.jsx (Trend Analysis: KPI list + achievement % chart · Achievement: bars)
    NeedsAttention.jsx   (critical / at-risk / watch cards)
    PurchaseFunnel.jsx   (6 stages, ↑/↓ KPI counts open a details panel)
    LineChart.jsx, HealthRings.jsx, StateViews.jsx
  styles/
    tokens.css       ← colours, radii, spacing (tweak here to match Figma Dev Mode)
    layout.css, dashboard.css, base.css
```

## Behaviour

- Changing zone / channel / month refetches the overview; stale requests are cancelled.
- CX Health: click Ease / Emotion / Effectiveness to switch the trend chart.
- Business KPIs open on **Trend Analysis** (as in the design): pick a KPI on the left to load its
  achievement-% trend. **Achievement** shows the bar view; the selected KPI is shared between tabs.
- Needs Attention and Purchase funnel load independently, each with its own loading/error state.
- Purchase funnel: click ↑ / ↓ counts to see which KPIs improved or declined for that stage.
- Loading skeletons, error state with Retry, and empty states on every card.
- Responsive: two columns → one column under 1180px; sidebar becomes a slide-in drawer under 960px.

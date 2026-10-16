// ─────────────────────────────────────────────────────────────
//  API ENDPOINTS (placeholders) — see API_CONTRACT.md for the
//  exact request params and JSON response shapes.
//  All paths are relative to VITE_API_BASE_URL (default "/api").
//  Every endpoint except FILTERS takes ?zone=&channel=&month=
// ─────────────────────────────────────────────────────────────
export const ENDPOINTS = {
  /** GET → zones, channels, months for the header dropdowns */
  FILTERS: '/cx/filters',

  /** GET → status, CX Health (score, dimensions, per-dimension trend), business KPI actuals */
  OVERVIEW: '/cx/overview',

  /** GET &kpi= → monthly actual vs target for one business KPI (Trend Analysis tab) */
  KPI_TREND: '/cx/business-kpis/trend',

  /** GET → items for the "Needs Attention" section */
  ATTENTION: '/cx/attention',

  /** GET → six purchase-funnel stages with headline metric and KPI movers */
  PURCHASE_FUNNEL: '/cx/purchase-funnel',
};

/** Links used by "View all recommendations" / "View more" (placeholder routes) */
export const ROUTES = {
  RECOMMENDATIONS: '#/recommendations',
};

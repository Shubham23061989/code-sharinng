const trim = (n, digits) => {
  const s = n.toFixed(digits);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
};
const smart = (n) => trim(n, n < 10 ? 2 : n < 100 ? 1 : 0);

/** 10400 → "10.4 K", 950 → "950", 1250000 → "1.3 M" (Business KPIs) */
export function formatCompact(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const abs = Math.abs(value);
  const fmt = (n) => n.toFixed(1).replace(/\.0$/, '');
  if (abs >= 1_000_000) return `${fmt(value / 1_000_000)} M`;
  if (abs >= 1_000) return `${fmt(value / 1_000)} K`;
  return String(value);
}

/** Indian short scale: 2450000 → "24.5 L", 184000 → "1.84 L", 62400 → "62.4 K", 3.2e7 → "3.2 Cr" */
export function formatIndian(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  const abs = Math.abs(value);
  if (abs >= 1e7) return `${smart(value / 1e7)} Cr`;
  if (abs >= 1e5) return `${smart(value / 1e5)} L`;
  if (abs >= 1e3) return `${smart(value / 1e3)} K`;
  return smart(value);
}

/**
 * Formats a metric by its `format` from the API.
 * count → Indian short scale · percent → "86%" · seconds → "3.8s" · score → "41"
 */
export function formatMetric(value, format = 'count') {
  if (value === null || value === undefined) return '–';
  switch (format) {
    case 'percent':
      return `${trim(value, 1)}%`;
    case 'seconds':
      return `${trim(value, 1)}s`;
    case 'score':
      return trim(value, 1);
    default:
      return formatIndian(value);
  }
}

export function formatDelta(delta) {
  if (delta === null || delta === undefined) return '';
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return '0';
}

/** Change of a funnel KPI: unit "%" → "+8%", "pp" → "+0.4 pp", "count" → "+1.2 K" */
export function formatChange(delta, unit = '%') {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const abs = Math.abs(delta);
  if (unit === 'pp') return `${sign}${trim(abs, 1)} pp`;
  if (unit === 'count') return `${sign}${formatIndian(abs)}`;
  if (unit === 'seconds') return `${sign}${trim(abs, 1)}s`;
  return `${sign}${trim(abs, 1)}%`;
}

export function deltaTone(delta) {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
}

/** Achievement % (0–∞), rounded. Guarded against target 0. */
export function achievementPct(actual, target) {
  if (!target) return 0;
  return Math.round((actual / target) * 100);
}

/** "2026-10-15" → "15 Oct" */
export function formatDueDate(iso) {
  if (!iso) return '';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, m, d] = String(iso).split('-').map(Number);
  if (!m || !d) return iso;
  return `${d} ${MONTHS[m - 1]}`;
}

// Mock data that follows API_CONTRACT.md exactly.
// Defaults (All zones · All channels · August 2026) reproduce the Figma values.
import { MOCK_DELAY_MS } from '../config/env';

const MONTHS = [
  { value: '2026-03', label: 'March 2026', short: 'Mar' },
  { value: '2026-04', label: 'April 2026', short: 'Apr' },
  { value: '2026-05', label: 'May 2026', short: 'May' },
  { value: '2026-06', label: 'June 2026', short: 'Jun' },
  { value: '2026-07', label: 'July 2026', short: 'Jul' },
  { value: '2026-08', label: 'August 2026', short: 'Aug' },
];

const BASE_SCORE = [65, 66, 67, 68, 69, 72];
const ZONE_OFFSET = { all: 0, north: 2, south: -1, east: -3, west: 1, central: -2 };
const CHANNEL_OFFSET = { all: 0, arena: 1, nexa: 3, commercial: -4, 'true-value': -1 };

// Monthly series per CX dimension (index aligned with MONTHS)
const DIMENSIONS = [
  { key: 'ease', label: 'Ease', target: 80, ucl: 82, lcl: 70, series: [72, 73, 74, 75, 76, 78] },
  { key: 'emotion', label: 'Emotion', target: 72, ucl: 74, lcl: 60, series: [67, 69, 70, 70, 68, 66] },
  { key: 'effectiveness', label: 'Effectiveness', target: 75, ucl: 77, lcl: 63, series: [68, 69, 69, 70, 71, 72] },
];

const BASE_KPIS = [
  { key: 'revenue', label: 'Revenue', actual: 10400, target: 12200, unit: 'INR Cr' },
  { key: 'leads', label: 'Leads', actual: 3500, target: 4200, unit: 'count' },
  { key: 'test-drive', label: 'Test Drive', actual: 1600, target: 2200, unit: 'count' },
  { key: 'bookings', label: 'Bookings', actual: 2900, target: 3200, unit: 'count' },
  { key: 'net-sales', label: 'Net Sales', actual: 1400, target: 1800, unit: 'count' },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v, step = 100) => Math.round(v / step) * step;
const monthIndex = (month) => {
  const i = MONTHS.findIndex((m) => m.value === month);
  return i < 0 ? MONTHS.length - 1 : i;
};
const offset = (zone = 'all', channel = 'all') => (ZONE_OFFSET[zone] ?? 0) + (CHANNEL_OFFSET[channel] ?? 0);
const lastN = (idx, n) => MONTHS.slice(Math.max(0, idx - n + 1), idx + 1).map((m) => ({ ...m, i: MONTHS.indexOf(m) }));

export function mockFilters() {
  return {
    zones: [
      { value: 'all', label: 'All zones' },
      { value: 'north', label: 'North' },
      { value: 'south', label: 'South' },
      { value: 'east', label: 'East' },
      { value: 'west', label: 'West' },
      { value: 'central', label: 'Central' },
    ],
    channels: [
      { value: 'all', label: 'All channels' },
      { value: 'arena', label: 'Arena' },
      { value: 'nexa', label: 'NEXA' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'true-value', label: 'True Value' },
    ],
    months: [...MONTHS].reverse().map(({ value, label }) => ({ value, label })),
    defaults: { zone: 'all', channel: 'all', month: '2026-08' },
  };
}

export function mockOverview({ zone, channel, month } = {}) {
  const idx = monthIndex(month);
  const off = offset(zone, channel);
  const score = clamp(BASE_SCORE[idx] + off, 0, 100);
  const prev = idx > 0 ? clamp(BASE_SCORE[idx - 1] + off, 0, 100) : score;
  const win = lastN(idx, 3);
  const factor = 1 + (score - 72) * 0.015;

  return {
    status: { isLive: idx === MONTHS.length - 1, label: MONTHS[idx].label, updatedAt: '2026-10-14T09:30:00+05:30' },
    cxHealth: {
      score,
      max: 100,
      delta: score - prev,
      comparedTo: idx > 0 ? MONTHS[idx - 1].short : null,
      dimensions: DIMENSIONS.map((d) => {
        const cur = clamp(d.series[idx] + off, 0, 100);
        const before = idx > 0 ? clamp(d.series[idx - 1] + off, 0, 100) : cur;
        return { key: d.key, label: d.label, score: cur, target: d.target, delta: cur - before };
      }),
    },
    trend: {
      rangeLabel: `${win[0].short} – ${win[win.length - 1].short}`,
      dimensions: Object.fromEntries(
        DIMENSIONS.map((d) => [
          d.key,
          {
            ucl: d.ucl,
            lcl: d.lcl,
            points: win.map((m) => ({ period: m.value, label: m.short, value: clamp(d.series[m.i] + off, 0, 100) })),
          },
        ]),
      ),
    },
    businessKpis: BASE_KPIS.map((k) => ({ ...k, actual: round(k.actual * factor) })),
  };
}

export function mockKpiTrend({ kpi = 'revenue', zone, channel, month } = {}) {
  const k = BASE_KPIS.find((x) => x.key === kpi) ?? BASE_KPIS[0];
  const kIdx = BASE_KPIS.indexOf(k);
  const idx = monthIndex(month);
  const off = offset(zone, channel);
  const latestPct = Math.round((k.actual / k.target) * 100);
  const win = lastN(idx, 3);
  return {
    kpi: k.key,
    label: k.label,
    unit: k.unit,
    points: win.map((m, j) => {
      const back = win.length - 1 - j; // 0 for latest month
      const pct = latestPct - back * 3 - (back ? kIdx % 2 : 0) - (MONTHS.length - 1 - idx) * 2 + off;
      const target = round(k.target * (1 - back * 0.03));
      return { period: m.value, label: m.short, actual: round((target * pct) / 100, 10), target };
    }),
  };
}

export function mockAttention() {
  return {
    recommendationsUrl: '#/recommendations',
    items: [
      {
        id: 'att-1',
        severity: 'critical',
        category: 'Growth & Conversion',
        categoryIcon: 'growth',
        dueDate: '2026-10-15',
        overdue: false,
        metric: { value: 19, format: 'percent' },
        title: 'Cancellation reversal rate',
        subtitle: '68% of goal · 339 didn’t convert',
        link: '#/attention/att-1',
      },
      {
        id: 'att-2',
        severity: 'at-risk',
        category: 'Customer Experience',
        categoryIcon: 'experience',
        dueDate: '2026-10-31',
        overdue: false,
        metric: { value: 27, format: 'percent' },
        title: 'Lead-to-test-drive conversion',
        subtitle: '74% of goal · 1,347 missed a test drive',
        link: '#/attention/att-2',
      },
      {
        id: 'att-3',
        severity: 'watch',
        category: 'Digital & Technology',
        categoryIcon: 'digital',
        dueDate: '2026-09-30',
        overdue: true,
        metric: { value: 3.8, format: 'seconds' },
        title: 'Accessories module load time',
        subtitle: 'vs 1.5s benchmark',
        link: '#/attention/att-3',
      },
    ],
  };
}

// KPI movers behind each ↑ / ↓ count (shown in the popover)
const mv = (key, label, value, format, delta, unit, description, status) => ({
  key, label, value, format, delta, unit, description, status,
});

export function mockPurchaseFunnel({ zone, channel, month } = {}) {
  const idx = monthIndex(month);
  const f = 1 + (offset(zone, channel) - (MONTHS.length - 1 - idx) * 2) * 0.015;
  const stage = (key, label, status, metric, up, down) => ({
    key,
    label,
    icon: key,
    status,
    metric: { ...metric, actual: metric.format === 'count' ? round(metric.actual * f, 100) : metric.actual },
    movers: { up, down },
  });
  return {
    stages: [
      stage('awareness', 'Awareness', 'critical',
        { label: 'Total traffic', actual: 2450000, target: 3000000, format: 'count' },
        [
          mv('brand-search', 'Brand search volume', 620000, 'count', 4.2, '%', 'Festive campaign lifted branded queries for Brezza and Fronx.', 'on-track'),
          mv('organic', 'Organic sessions', 1120000, 'count', 8, '%', 'New model pages started ranking for compact SUV searches.', 'on-track'),
        ],
        [
          mv('bounce', 'Bounce rate', 48, 'percent', 3, 'pp', 'Landing pages slowed after the hero video was added.', 'critical'),
        ]),
      stage('interest', 'Interest', 'on-track',
        { label: 'Qualified leads', actual: 184000, target: 175000, format: 'count' },
        [
          mv('enquiries', 'Online enquiries', 96000, 'count', 12, '%', 'EMI calculator CTA drove more enquiry submissions.', 'on-track'),
          mv('callback', 'Callback requests', 41000, 'count', 6, '%', 'Click-to-call added on mobile model pages.', 'on-track'),
        ],
        [
          mv('lead-quality', 'Lead quality score', 62, 'score', -2, '%', 'More incomplete forms from paid social traffic.', 'at-risk'),
        ]),
      stage('consideration', 'Consideration', 'at-risk',
        { label: 'Net test drives', actual: 62400, target: 64000, format: 'count' },
        [
          mv('home-td', 'Home test drives', 18300, 'count', 9, '%', 'Doorstep test drives expanded to 40 more cities.', 'on-track'),
        ],
        [
          mv('td-noshow', 'Test drive no-shows', 14, 'percent', 4, 'pp', 'Reminder SMS failed for two days in the West zone.', 'at-risk'),
          mv('td-slot', 'Slot lead time', 2.6, 'score', 0.6, 'count', 'Average days to next free slot went up at NEXA outlets.', 'at-risk'),
        ]),
      stage('booking', 'Booking', 'critical',
        { label: 'Bookings', actual: 28100, target: 32000, format: 'count' },
        [
          mv('online-bookings', 'Online bookings', 7400, 'count', 5, '%', 'Pay-to-book flow got a shorter checkout.', 'on-track'),
        ],
        [
          mv('cancellations', 'Booking cancellations', 11.4, 'percent', 2.1, 'pp', 'Waiting period on CNG variants pushed customers away.', 'critical'),
          mv('finance-approval', 'Finance approval rate', 71, 'percent', -3, '%', 'Two partner banks tightened approval criteria.', 'critical'),
        ]),
      stage('delivery', 'Delivery', 'at-risk',
        { label: 'On-time delivery', actual: 86, target: 92, format: 'percent' },
        [
          mv('pdi', 'PDI pass rate', 97, 'percent', 1.5, 'pp', 'Pre-delivery inspection checklist was digitised.', 'on-track'),
          mv('doc-ready', 'Docs ready at handover', 91, 'percent', 4, '%', 'RTO paperwork now starts at booking.', 'on-track'),
        ],
        [
          mv('wait', 'Avg. delivery wait', 19, 'score', 2, '%', 'Supply delays on top variants in the East zone.', 'at-risk'),
        ]),
      stage('post-purchase', 'Post purchase', 'critical',
        { label: 'PSF / NPS', actual: 41, target: 50, format: 'score' },
        [
          mv('psf-calls', 'PSF call completion', 88, 'percent', 3, '%', 'Follow-up calls moved to an automated scheduler.', 'on-track'),
        ],
        [
          mv('complaints', 'Service complaints', 3200, 'count', 7, '%', 'Most complaints are about first-service wait times.', 'critical'),
          mv('repeat', 'Repeat-visit rate', 54, 'percent', -1.2, 'pp', 'Fewer customers returning for the second free service.', 'at-risk'),
        ]),
    ],
  };
}

/** Resolves like a network call; honours AbortSignal like fetch does. */
export function withMockDelay(data, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const t = setTimeout(() => resolve(structuredClone(data)), MOCK_DELAY_MS);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
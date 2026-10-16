import { useState } from 'react';
import Icon from './Icon';
import LineChart from './LineChart';
import { CardSkeleton, EmptyState, ErrorState, Skeleton } from './StateViews';
import { useApi } from '../hooks/useApi';
import { getKpiTrend } from '../api/cxService';
import { achievementPct, formatCompact } from '../utils/format';

const TABS = [
  { key: 'achievement', label: 'Achievement' },
  { key: 'trend', label: 'Trend Analysis' },
];

/* ── Achievement tab: horizontal bars ── */
function KpiBar({ kpi, selected, onSelect }) {
  const pct = achievementPct(kpi.actual, kpi.target);
  const width = Math.min(pct, 100);
  return (
    <li>
      <button type="button" className={`kpi-row ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => onSelect(kpi.key)}>
        <span className="kpi-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
          aria-label={`${kpi.label} ${pct}% of target`}>
          <span className="kpi-bar__fill" style={{ width: `${width}%` }} />
          <span className="kpi-bar__label">{kpi.label}</span>
          <span className="kpi-bar__pct" style={{ left: `calc(${width}% - 8px)` }}>{pct}%</span>
        </span>
        <span className="kpi-row__values">
          <strong>{formatCompact(kpi.actual)}</strong>
          <span> / {formatCompact(kpi.target)}</span>
        </span>
      </button>
    </li>
  );
}

/* ── Trend Analysis tab: KPI list on the left, achievement % chart on the right ── */
function KpiTrendView({ kpis, selectedKey, onSelect, filters }) {
  const { data, error, isInitialLoading, isRefreshing, reload } = useApi(
    (signal) => getKpiTrend({ kpi: selectedKey, ...filters }, signal),
    [selectedKey, filters.zone, filters.channel, filters.month],
  );
  const points = (data?.points || []).map((p) => ({ ...p, pct: achievementPct(p.actual, p.target) }));

  return (
    <div className="kpi-trend">
      <ul className="kpi-menu" role="listbox" aria-label="Select KPI">
        {kpis.map((k) => {
          const active = k.key === selectedKey;
          return (
            <li key={k.key}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`kpi-menu__item ${active ? 'is-active' : ''}`}
                onClick={() => onSelect(k.key)}
              >
                <span>{k.label}</span>
                <Icon name="chevronRight" size={14} />
              </button>
            </li>
          );
        })}
      </ul>

      <div className={`kpi-trend__chart ${isRefreshing ? 'is-refreshing' : ''}`}>
        {isInitialLoading ? (
          <Skeleton height={220} radius={12} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} compact />
        ) : !points.length ? (
          <EmptyState message="No trend data for this KPI." />
        ) : (
          <>
            <span className="chart-legend">
              <i aria-hidden="true" /> {data.label}
            </span>
            <LineChart
              key={data.kpi}
              labels={points.map((p) => p.label)}
              series={[{ key: `kpi-${data.kpi}`, color: 'var(--c-trend)', values: points.map((p) => p.pct), area: true }]}
              formatValue={(v) => `${v}%`}
              ariaLabel={`${data.label} achievement by month: ${points.map((p) => `${p.label} ${p.pct}%`).join(', ')}`}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function BusinessKpisCard({ kpis, loading, error, onRetry, filters }) {
  const [tab, setTab] = useState('trend');
  const [selectedKey, setSelectedKey] = useState('revenue');
  const selected = kpis?.some((k) => k.key === selectedKey) ? selectedKey : kpis?.[0]?.key;

  return (
    <section className="card business-kpis" aria-labelledby="business-kpis-title">
      <div className="card__head">
        <h2 id="business-kpis-title" className="card__title">Business KPIs</h2>
        <div className="segmented" role="tablist" aria-label="Business KPI view">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`segmented__btn ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !kpis ? (
        <CardSkeleton rows={5} />
      ) : error && !kpis ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !kpis?.length ? (
        <EmptyState />
      ) : tab === 'achievement' ? (
        <>
          <div className="kpi-list__head">
            <span>KPI</span>
            <span>Actual / target</span>
          </div>
          <ul className="kpi-list">
            {kpis.map((k) => (
              <KpiBar key={k.key} kpi={k} selected={k.key === selected} onSelect={setSelectedKey} />
            ))}
          </ul>
        </>
      ) : (
        <KpiTrendView kpis={kpis} selectedKey={selected} onSelect={setSelectedKey} filters={filters} />
      )}
    </section>
  );
}
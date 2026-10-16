import { useState } from 'react';
import HealthRings, { RING_COLORS } from './HealthRings';
import LineChart from './LineChart';
import { CardSkeleton, ErrorState, EmptyState } from './StateViews';
import { deltaTone, formatDelta } from '../utils/format';

export default function CxHealthCard({ health, trend, loading, error, onRetry }) {
  const [selectedKey, setSelectedKey] = useState('ease');
  const dims = health?.dimensions || [];
  const selected = dims.find((d) => d.key === selectedKey) || dims[0];
  const series = selected && trend?.dimensions?.[selected.key];

  return (
    <section className="card cx-health" aria-labelledby="cx-health-title">
      <div className="card__head">
        <h2 id="cx-health-title" className="card__title">CX Health</h2>
        {health && (
          <span className="score-pill">
            <strong>
              {health.score} / {health.max}
            </strong>
            {health.comparedTo && (
              <span className={`delta delta--${deltaTone(health.delta)}`}>
                {formatDelta(health.delta)} vs {health.comparedTo}
              </span>
            )}
          </span>
        )}
      </div>

      {loading && !health ? (
        <CardSkeleton rows={4} />
      ) : error && !health ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !health ? (
        <EmptyState />
      ) : (
        <div className="cx-health__body">
          <div className="cx-health__score">
            <HealthRings score={health.score} max={health.max} dimensions={dims} size={140} />

            <ul className="dimension-list" role="listbox" aria-label="CX dimensions">
              {dims.map((d, i) => {
                const active = d.key === selected?.key;
                return (
                  <li key={d.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`dimension-row ${active ? 'is-active' : ''}`}
                      onClick={() => setSelectedKey(d.key)}
                    >
                      <span className="dimension-row__dot" style={{ background: RING_COLORS[i % RING_COLORS.length] }} />
                      <span className="dimension-row__label">{d.label}</span>
                      <span className="dimension-row__value">
                        <strong>{d.score}</strong>
                        <span> / {d.target}</span>
                      </span>
                      <span className={`delta delta--${deltaTone(d.delta)}`}>{formatDelta(d.delta)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="cx-health__trend">
            <div className="subpanel__head">
              <h3 className="subpanel__title">{selected?.label} trend</h3>
              <p className="subpanel__meta">{trend?.rangeLabel}</p>
            </div>

            {series?.points?.length ? (
              <LineChart
                key={selected.key}
                labels={series.points.map((p) => p.label)}
                series={[{ key: `dim-${selected.key}`, color: 'var(--c-trend)', values: series.points.map((p) => p.value), area: true }]}
                refLines={[
                  { label: 'UCL', value: series.ucl },
                  { label: 'LCL', value: series.lcl },
                ].filter((r) => r.value != null)}
                ariaLabel={`${selected.label} trend ${series.points.map((p) => `${p.label} ${p.value}`).join(', ')}`}
              />
            ) : (
              <EmptyState message="No trend data." />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
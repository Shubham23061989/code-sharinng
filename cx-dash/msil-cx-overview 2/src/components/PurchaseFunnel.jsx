import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { ErrorState, EmptyState, Skeleton } from './StateViews';
import { useApi } from '../hooks/useApi';
import { getPurchaseFunnel } from '../api/cxService';
import { achievementPct, formatChange, formatMetric } from '../utils/format';

// API sends a stage icon key; mapped to local icons.
const STAGE_ICON = {
  awareness: 'megaphone',
  interest: 'userPlus',
  consideration: 'car',
  booking: 'calendarCheck',
  delivery: 'key',
  'post-purchase': 'wrench',
};

const STATUS_LABEL = { 'on-track': 'On track', 'at-risk': 'At risk', critical: 'Critical' };
const POPOVER_W = 380;

/* ───────── one funnel stage ───────── */
function StageColumn({ stage, picked, onPick }) {
  const { metric } = stage;
  const pct = achievementPct(metric.actual, metric.target);
  const status = STATUS_LABEL[stage.status] ? stage.status : 'at-risk';
  const up = stage.movers?.up?.length ?? 0;
  const down = stage.movers?.down?.length ?? 0;

  const moverBtn = (direction, count) => (
    <button
      type="button"
      data-mover-trigger
      className={`mover mover--${direction} ${picked === direction ? 'is-active' : ''}`}
      onClick={() => onPick(stage.key, direction)}
      disabled={!count}
      aria-haspopup="dialog"
      aria-expanded={picked === direction}
      aria-label={`${count} ${direction === 'up' ? 'positive' : 'negative'} KPIs in ${stage.label}`}
    >
      <Icon name={direction === 'up' ? 'arrowUp' : 'arrowDown'} size={14} strokeWidth={2} />
      <span>{count}</span>
    </button>
  );

  return (
    <li className={`stage ${picked ? 'is-active' : ''}`} data-stage={stage.key}>
      <div className="stage__head">
        <h3 className="stage__name">{stage.label}</h3>
        <span className="stage__icon" title={STATUS_LABEL[status]}>
          <Icon name={STAGE_ICON[stage.icon] || 'bars'} size={18} />
          <i className={`sev-dot sev-dot--${status}`} aria-hidden="true" />
          <span className="visually-hidden">{STATUS_LABEL[status]}</span>
        </span>
      </div>

      <div className="stage__metric">
        <p className="stage__metric-label">{metric.label}</p>
        <p className="stage__value">
          <strong>{formatMetric(metric.actual, metric.format)}</strong>
          <span> / {formatMetric(metric.target, metric.format)}</span>
        </p>
        <p className="stage__goal">
          <span className={`goal goal--${status}`}>{pct}%</span> of goal
        </p>
      </div>

      <div className="stage__movers">
        {moverBtn('up', up)}
        {moverBtn('down', down)}
      </div>
    </li>
  );
}

/* ───────── popover: pages through the KPIs behind an ↑ / ↓ count ───────── */
function MoverPopover({ stage, direction, position, onClose }) {
  const list = stage.movers?.[direction] || [];
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const positive = direction === 'up';
  const kind = positive ? 'Positive' : 'Negative';
  const titleId = `kpi-pop-${stage.key}-${direction}`;
  const m = list[idx];

  const go = useCallback((n) => setIdx((i) => Math.min(list.length - 1, Math.max(0, i + n))), [list.length]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const onDown = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest?.('[data-mover-trigger]')) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [go, onClose]);

  if (!m) return null;
  const status = STATUS_LABEL[m.status] ? m.status : positive ? 'on-track' : 'critical';

  return (
    <div
      ref={ref}
      className={`kpi-popover kpi-popover--${direction}`}
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="kpi-popover__head">
        <h4 id={titleId}>
          {kind} KPIs · {idx + 1} of {list.length}
        </h4>
        <span className="kpi-popover__stage">{stage.label}</span>
        <button type="button" className="kpi-popover__close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={14} />
        </button>
      </div>

      <div className="kpi-popover__body" aria-live="polite">
        <span className="kpi-popover__badge" aria-hidden="true">
          <Icon name={positive ? 'arrowUp' : 'arrowDown'} size={16} strokeWidth={2} />
        </span>
        <div className="kpi-popover__content">
          <div className="kpi-popover__row">
            <p className="kpi-popover__name">{m.label}</p>
            {m.value != null && <span className="kpi-popover__value">{formatMetric(m.value, m.format)}</span>}
            <span className="kpi-popover__delta">{formatChange(m.delta, m.unit)}</span>
          </div>
          {m.description && <p className="kpi-popover__desc">{m.description}</p>}
          <p className={`kpi-popover__status goal--${status}`}>
            {kind} · {STATUS_LABEL[status].toLowerCase()}
          </p>
        </div>
      </div>

      <div className="kpi-popover__foot">
        <div className="kpi-popover__dots">
          {list.map((item, i) => (
            <button
              key={item.key}
              type="button"
              className={`kpi-popover__dot ${i === idx ? 'is-active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Show ${item.label}`}
              aria-current={i === idx}
            />
          ))}
        </div>
        <span className="kpi-popover__count">
          {idx + 1} of {list.length}
        </span>
        <button type="button" className="kpi-popover__nav" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous KPI">
          <Icon name="chevronLeft" size={16} />
        </button>
        <button
          type="button"
          className="kpi-popover__nav"
          onClick={() => go(1)}
          disabled={idx === list.length - 1}
          aria-label="Next KPI"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ───────── section ───────── */
export default function PurchaseFunnel({ filters, onViewMore }) {
  const [picked, setPicked] = useState(null); // { stage, direction }
  const [position, setPosition] = useState(null);
  const sectionRef = useRef(null);
  const { data, error, isInitialLoading, isRefreshing, reload } = useApi(
    (signal) => getPurchaseFunnel(filters, signal),
    [filters.zone, filters.channel, filters.month],
    { enabled: !!filters.month },
  );

  useEffect(() => setPicked(null), [filters.zone, filters.channel, filters.month]);

  // Place the popover over the clicked stage (kept inside the card), and re-place on resize.
  useLayoutEffect(() => {
    if (!picked) return undefined;
    const place = () => {
      const section = sectionRef.current;
      const stageEl = section?.querySelector(`[data-stage="${picked.stage}"]`);
      if (!section || !stageEl) return;
      const s = section.getBoundingClientRect();
      const st = stageEl.getBoundingClientRect();
      const width = Math.min(POPOVER_W, s.width - 32);
      const left = Math.max(16, Math.min(st.left - s.left - 8, s.width - width - 16));
      setPosition({ top: st.top - s.top - 16, left });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [picked, data]);

  const pick = (stage, direction) =>
    setPicked((p) => (p && p.stage === stage && p.direction === direction ? null : { stage, direction }));
  const close = useCallback(() => setPicked(null), []);
  const pickedStage = picked && data?.stages?.find((s) => s.key === picked.stage);

  return (
    <section
      ref={sectionRef}
      className={`card funnel ${isRefreshing ? 'is-refreshing' : ''}`}
      aria-labelledby="funnel-title"
    >
      <div className="card__head">
        <h2 id="funnel-title" className="card__title">Purchase funnel</h2>
        <div className="funnel__actions">
          <span className="funnel__hint">Select a KPI count for details</span>
          <button type="button" className="btn-primary" onClick={onViewMore}>
            View more <Icon name="arrowRight" size={15} />
          </button>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="funnel__stages">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={210} radius={14} />
          ))}
        </div>
      ) : error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.stages?.length ? (
        <EmptyState />
      ) : (
        <ol className="funnel__stages">
          {data.stages.map((s) => (
            <StageColumn key={s.key} stage={s} picked={picked?.stage === s.key ? picked.direction : null} onPick={pick} />
          ))}
        </ol>
      )}

      {pickedStage && position && (
        <MoverPopover
          key={`${picked.stage}-${picked.direction}`}
          stage={pickedStage}
          direction={picked.direction}
          position={position}
          onClose={close}
        />
      )}
    </section>
  );
}
// Lightweight SVG line chart (no chart library).
// Renders at the container's real pixel size (ResizeObserver), so text never scales
// and the chart fills whatever height its parent gives it.
// Points sit in the centre of equal-width columns, with the month label directly below each point.
import { useId, useLayoutEffect, useRef, useState } from 'react';

const PAD = { t: 28, r: 52, b: 44, l: 8 };

function smoothPath(pts) {
  if (!pts.length) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function niceDomain(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) || 1;
  return [min - span * 0.2, max + span * 0.2];
}

function useSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.w === Math.round(width) && s.h === Math.round(height) ? s : { w: Math.round(width), h: Math.round(height) }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

export default function LineChart({
  labels,
  series,
  refLines = [],
  activeIndex = labels.length - 1,
  minHeight = 220,
  formatValue = (v) => v,
  showPointLabels = true,
  ariaLabel,
}) {
  const [wrapRef, { w: W, h: H }] = useSize();
  const uid = useId().replace(/:/g, '');

  const all = [...series.flatMap((s) => s.values), ...refLines.map((r) => r.value)].filter((v) => v != null);
  const [min, max] = niceDomain(all.length ? all : [0, 1]);

  const plotL = PAD.l;
  const plotR = W - PAD.r;
  const band = (plotR - plotL) / Math.max(labels.length, 1);
  const x = (i) => plotL + band * (i + 0.5);
  const y = (v) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const baseY = H - PAD.b;
  const primary = series[0];
  const ready = W > 0 && H > 0;

  return (
    <div className="line-chart-wrap" ref={wrapRef} style={{ minHeight }}>
      {ready && (
        <svg className="line-chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
          {/* reference lines (UCL / LCL) */}
          {refLines.map((r) => (
            <g key={r.label} className="line-chart__ref">
              <line x1={0} x2={W} y1={y(r.value)} y2={y(r.value)} />
              <text x={0} y={y(r.value) - 6}>
                {r.label} {formatValue(r.value)}
              </text>
            </g>
          ))}

          {/* baseline */}
          <line className="line-chart__baseline" x1={0} x2={W} y1={baseY} y2={baseY} />

          {/* active month guide */}
          <line className="line-chart__guide" x1={x(activeIndex)} x2={x(activeIndex)} y1={6} y2={baseY + 8} />

          {/* series */}
          {series.map((s) => {
            const pts = s.values.map((v, i) => ({ x: x(i), y: y(v) }));
            const gid = `grad-${uid}-${s.key}`;
            return (
              <g key={s.key}>
                <defs>
                  <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.18 }} />
                    <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                {s.area && pts.length > 1 && (
                  <path
                    className="line-chart__area"
                    d={`${smoothPath(pts)} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`}
                    fill={`url(#${gid})`}
                  />
                )}
                <path
                  className="line-chart__line"
                  d={smoothPath(pts)}
                  style={{ stroke: s.color }}
                  strokeDasharray={s.dashed ? '5 5' : undefined}
                />
              </g>
            );
          })}

          {/* points + value labels */}
          {primary.values.map((v, i) => {
            const active = i === activeIndex;
            return (
              <g key={i}>
                <circle
                  className={`line-chart__dot ${active ? 'is-active' : ''}`}
                  cx={x(i)}
                  cy={y(v)}
                  r={active ? 6 : 4}
                  style={{ '--dot': primary.color }}
                />
                {showPointLabels && !active && (
                  <text className="line-chart__value" x={x(i)} y={y(v) - 12} textAnchor="middle">
                    {formatValue(v)}
                  </text>
                )}
                {active && (
                  <g className="line-chart__active-label">
                    <circle cx={x(i) + 15} cy={y(v)} r={3} style={{ fill: 'var(--primary)' }} />
                    <text x={x(i) + 23} y={y(v)} dominantBaseline="central">
                      {formatValue(v)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* month labels: centred under each point */}
          {labels.map((l, i) => {
            const active = i === activeIndex;
            const cy = baseY + 24;
            return active ? (
              <g key={l} className="line-chart__xpill">
                <rect x={x(i) - 22} y={cy - 12} width={44} height={24} rx={12} />
                <text x={x(i)} y={cy} textAnchor="middle" dominantBaseline="central">
                  {l}
                </text>
              </g>
            ) : (
              <text key={l} className="line-chart__xlabel" x={x(i)} y={cy} textAnchor="middle" dominantBaseline="central">
                {l}
              </text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
// Concentric progress rings: one ring per CX dimension, overall score in the centre.
const RING_COLORS = ['var(--c-ease)', 'var(--c-emotion)', 'var(--c-effectiveness)'];

export default function HealthRings({ score, max = 100, dimensions = [], size = 132 }) {
  const stroke = 8;
  const gap = 3;
  const c = size / 2;

  return (
    <div className="health-rings" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img"
        aria-label={`CX Health ${score} of ${max}. ${dimensions.map((d) => `${d.label} ${d.score}`).join(', ')}`}>
        {dimensions.map((d, i) => {
          const r = c - stroke / 2 - i * (stroke + gap);
          const circ = 2 * Math.PI * r;
          const pct = Math.max(0, Math.min(1, d.score / max));
          return (
            <g key={d.key} transform={`rotate(-90 ${c} ${c})`}>
              <circle cx={c} cy={c} r={r} fill="none" style={{ stroke: 'var(--ring-track)' }} strokeWidth={stroke} />
              <circle
                className="health-rings__arc"
                cx={c}
                cy={c}
                r={r}
                fill="none"
                style={{ stroke: RING_COLORS[i % RING_COLORS.length] }}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circ * pct} ${circ}`}
              />
            </g>
          );
        })}
      </svg>
      <div className="health-rings__center">
        <span className="health-rings__score">{score}</span>
        <span className="health-rings__max">of {max}</span>
      </div>
    </div>
  );
}

export { RING_COLORS };

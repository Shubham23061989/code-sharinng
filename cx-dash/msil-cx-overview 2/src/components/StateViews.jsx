import Icon from './Icon';

export function Skeleton({ height = 16, width = '100%', radius = 8, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ height, width, borderRadius: radius }} aria-hidden="true" />;
}

export function CardSkeleton({ rows = 5 }) {
  return (
    <div className="card-skeleton" role="status" aria-label="Loading">
      <Skeleton height={18} width="40%" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={34} />
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry, compact = false }) {
  return (
    <div className={`error-state ${compact ? 'is-compact' : ''}`} role="alert">
      <Icon name="alert" size={20} />
      <div>
        <p className="error-state__title">Couldn’t load this data</p>
        <p className="error-state__msg">{error?.message || 'Something went wrong.'}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn-ghost" onClick={onRetry}>
          <Icon name="refresh" size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'No data for the selected filters.' }) {
  return <p className="empty-state">{message}</p>;
}

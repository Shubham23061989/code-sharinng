import Icon from './Icon';
import { ErrorState, EmptyState, Skeleton } from './StateViews';
import { useApi } from '../hooks/useApi';
import { getAttention } from '../api/cxService';
import { ROUTES } from '../api/endpoints';
import { formatDueDate, formatMetric } from '../utils/format';

export const SEVERITY = {
  critical: { label: 'Critical' },
  'at-risk': { label: 'At risk' },
  watch: { label: 'Watch' },
};

// API sends a category key; unknown keys fall back to a generic icon.
const CATEGORY_ICON = { growth: 'trendUp', experience: 'smile', digital: 'devices' };

function AttentionCard({ item }) {
  const sev = SEVERITY[item.severity] ? item.severity : 'watch';
  return (
    <li className={`attention-card attention-card--${sev}`}>
      <div className="attention-card__top">
        <span className="attention-card__category">
          <span className="attention-card__icon">
            <Icon name={CATEGORY_ICON[item.categoryIcon] || 'alert'} size={15} />
          </span>
          {item.category}
        </span>
        <span className="attention-card__due">
          {item.overdue && <span className="tag tag--overdue">Overdue</span>}
          {item.dueDate && <span className="attention-card__due-date">by {formatDueDate(item.dueDate)}</span>}
        </span>
      </div>

      <div className="attention-card__body">
        <span className="attention-card__metric">{formatMetric(item.metric?.value, item.metric?.format)}</span>
        <div className="attention-card__text">
          <p className="attention-card__title">{item.title}</p>
          <p className="attention-card__sub">{item.subtitle}</p>
        </div>
        <a className="icon-link" href={item.link || '#'} aria-label={`Open ${item.title}`}>
          <Icon name="arrowRight" size={16} />
        </a>
      </div>
      <span className="visually-hidden">Severity: {SEVERITY[sev].label}</span>
    </li>
  );
}

export default function NeedsAttention({ filters }) {
  const { data, error, isInitialLoading, isRefreshing, reload } = useApi(
    (signal) => getAttention(filters, signal),
    [filters.zone, filters.channel, filters.month],
    { enabled: !!filters.month },
  );

  return (
    <section className={`card attention ${isRefreshing ? 'is-refreshing' : ''}`} aria-labelledby="attention-title">
      <div className="card__head">
        <div className="attention__heading">
          <h2 id="attention-title" className="card__title">Needs Attention</h2>
          <ul className="severity-legend" aria-label="Severity legend">
            {Object.entries(SEVERITY).map(([key, s]) => (
              <li key={key}>
                <i className={`sev-dot sev-dot--${key}`} aria-hidden="true" /> {s.label}
              </li>
            ))}
          </ul>
        </div>
        <a className="btn-primary" href={data?.recommendationsUrl || ROUTES.RECOMMENDATIONS}>
          View all recommendations <Icon name="arrowRight" size={15} />
        </a>
      </div>

      {isInitialLoading ? (
        <div className="attention__grid">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={112} radius={14} />
          ))}
        </div>
      ) : error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.items?.length ? (
        <EmptyState message="Nothing needs attention right now." />
      ) : (
        <ul className="attention__grid">
          {data.items.map((item) => (
            <AttentionCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
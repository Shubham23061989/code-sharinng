import { useEffect, useState } from 'react';
import OverviewHeader from './OverviewHeader';
import CxHealthCard from './CxHealthCard';
import BusinessKpisCard from './BusinessKpisCard';
import NeedsAttention from './NeedsAttention';
import PurchaseFunnel from './PurchaseFunnel';
import { ErrorState } from './StateViews';
import { useApi } from '../hooks/useApi';
import { getFilters, getOverview } from '../api/cxService';

const FALLBACK_FILTERS = { zone: 'all', channel: 'all', month: '' };

export default function CxOverviewPage({ onNavigate }) {
  const [filters, setFilters] = useState(null);
  const filterReq = useApi((signal) => getFilters(signal), []);

  // Apply backend defaults once the filter options arrive.
  useEffect(() => {
    if (filters) return;
    if (filterReq.data) setFilters({ ...FALLBACK_FILTERS, ...filterReq.data.defaults });
    else if (filterReq.error) setFilters(FALLBACK_FILTERS);
  }, [filterReq.data, filterReq.error, filters]);

  const overview = useApi(
    (signal) => getOverview(filters, signal),
    [filters?.zone, filters?.channel, filters?.month],
    { enabled: !!filters },
  );

  const current = filters || FALLBACK_FILTERS;
  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const data = overview.data;
  const loading = !filters || overview.loading;

  return (
    <div className="page">
      <OverviewHeader
        status={data?.status}
        filterOptions={filterReq.data}
        filters={current}
        onFilterChange={handleFilterChange}
        loading={overview.isRefreshing}
      />

      {filterReq.error && <ErrorState error={filterReq.error} onRetry={filterReq.reload} compact />}

      <div className={`overview-grid ${overview.isRefreshing ? 'is-refreshing' : ''}`}>
        <CxHealthCard
          health={data?.cxHealth}
          trend={data?.trend}
          loading={loading}
          error={overview.error}
          onRetry={overview.reload}
        />
        <BusinessKpisCard
          kpis={data?.businessKpis}
          loading={loading}
          error={overview.error}
          onRetry={overview.reload}
          filters={current}
        />
      </div>

      <NeedsAttention filters={current} />
      <PurchaseFunnel filters={current} onViewMore={() => onNavigate?.('purchase-funnel')} />
    </div>
  );
}

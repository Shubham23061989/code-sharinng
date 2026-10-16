import FilterSelect from './FilterSelect';

export default function OverviewHeader({ status, filterOptions, filters, onFilterChange, loading }) {
  return (
    <header className="overview-header">
      <div className="overview-header__title">
        <h1>CX Overview</h1>
        {status && (
          <span className={`live-pill ${status.isLive ? 'is-live' : ''}`}>
            <span className="live-pill__dot" aria-hidden="true" />
            {status.isLive ? 'Live · ' : ''}
            {status.label}
          </span>
        )}
        {loading && <span className="overview-header__sync" role="status">Updating…</span>}
      </div>

      <div className="overview-header__filters">
        <FilterSelect
          id="filter-zone"
          label="Zone"
          icon="pin"
          value={filters.zone}
          options={filterOptions?.zones}
          onChange={(v) => onFilterChange('zone', v)}
        />
        <FilterSelect
          id="filter-channel"
          label="Channel"
          icon="store"
          value={filters.channel}
          options={filterOptions?.channels}
          onChange={(v) => onFilterChange('channel', v)}
        />
        <FilterSelect
          id="filter-month"
          label="Month"
          icon="calendar"
          value={filters.month}
          options={filterOptions?.months}
          onChange={(v) => onFilterChange('month', v)}
        />
      </div>
    </header>
  );
}

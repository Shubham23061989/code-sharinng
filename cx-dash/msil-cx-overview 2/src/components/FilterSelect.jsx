import Icon from './Icon';

/** Native <select> styled as the pill dropdown from the design (keyboard + screen-reader friendly). */
export default function FilterSelect({ id, label, icon, value, options, onChange, disabled }) {
  return (
    <label className="filter-pill" htmlFor={id}>
      <span className="visually-hidden">{label}</span>
      <Icon name={icon} size={14} className="filter-pill__icon" />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled || !options?.length}>
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron" size={14} className="filter-pill__chevron" />
    </label>
  );
}

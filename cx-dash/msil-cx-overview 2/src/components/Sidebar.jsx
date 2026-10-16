import Icon from './Icon';
import { NAV_ITEMS, NAV_SECTION } from '../config/navigation';

export default function Sidebar({ activeKey, onNavigate, open, onClose, hasNotifications = true }) {
  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Primary">
        <div className="sidebar__section">
          <span className="sidebar__section-badge">
            <Icon name={NAV_SECTION.icon} size={18} />
          </span>
          <span>{NAV_SECTION.label}</span>
        </div>

        <nav className="sidebar__nav">
          <ul className="sidebar__list">
            {NAV_ITEMS.map((item) => {
              const active = item.key === activeKey;
              return (
                <li key={item.key}>
                  <a
                    href={`#${item.path}`}
                    className={`sidebar__link ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.key);
                    }}
                  >
                    <Icon name={item.icon} size={17} />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          {/* PLACEHOLDER: swap for the signed-in user's avatar/name once an auth/user endpoint exists */}
          <a href="#/account" className="sidebar__account" onClick={(e) => e.preventDefault()}>
            <span className="avatar" aria-hidden="true">
              <Icon name="user" size={18} />
            </span>
            <span>My account</span>
          </a>
          <button type="button" className="sidebar__bell" aria-label="Notifications">
            <Icon name="bell" size={18} />
            {hasNotifications && <span className="sidebar__bell-dot" aria-hidden="true" />}
          </button>
        </div>
      </aside>
    </>
  );
}

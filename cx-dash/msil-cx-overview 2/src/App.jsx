import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CxOverviewPage from './components/CxOverviewPage';
import Icon from './components/Icon';
import { NAV_ITEMS } from './config/navigation';
import { USE_MOCK } from './config/env';

function ComingSoon({ label }) {
  return (
    <div className="page">
      <div className="card placeholder-page">
        <h1>{label}</h1>
        <p>This section isn’t built yet.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('cx-overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((n) => n.key === active);

  return (
    <div className="app-shell">
      <Sidebar
        activeKey={active}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(key) => {
          setActive(key);
          setMenuOpen(false);
        }}
      />

      <main className="main">
        <div className="mobile-bar">
          <button type="button" className="btn-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <span className="mobile-bar__brand">MSIL</span>
        </div>

        {USE_MOCK && <div className="mock-banner">
          {/* Mock data · set VITE_USE_MOCK=false to call the API */}
          </div>}

        {active === 'cx-overview' ? <CxOverviewPage onNavigate={setActive} /> : <ComingSoon label={activeItem?.label} />}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { NAV_SECTIONS } from './navConfig';

function getPageTitle(pathname) {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.to || pathname.startsWith(item.to + '/')) return item.label;
    }
  }
  return 'Stackenzo Inventory';
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarWidth = collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className="app-main"
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.15s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Topbar pageTitle={getPageTitle(location.pathname)} onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="container-page" style={{ flex: 1, width: '100%' }}>
          <Outlet />
        </main>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .app-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}

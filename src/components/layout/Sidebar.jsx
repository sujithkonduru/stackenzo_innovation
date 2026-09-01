import { NavLink } from 'react-router-dom';
import { Boxes, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { NAV_SECTIONS } from './navConfig';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { session } = useAuth();
  const role = session?.role;

  const width = collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)';

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 60,
            display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}
      <aside
        className={`app-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 70,
          transition: 'width 0.15s ease, transform 0.2s ease'
        }}
      >
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid var(--sidebar-border)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Boxes size={17} />
            </div>
            {!collapsed && (
              <div style={{ lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 14.5 }}>Stackenzo</div>
                <div style={{ color: 'var(--sidebar-fg)', fontSize: 11, fontWeight: 500 }}>Inventory</div>
              </div>
            )}
          </div>
          <button
            className="mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Close menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--sidebar-fg)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((i) => !i.roles || i.roles.includes(role));
            if (!items.length) return null;
            return (
              <div key={section.label} style={{ marginBottom: 18 }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: 'var(--sidebar-fg)',
                      opacity: 0.55,
                      padding: '0 10px 6px'
                    }}
                  >
                    {section.label}
                  </div>
                )}
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    onClick={onCloseMobile}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 10px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 500,
                      marginBottom: 2,
                      color: isActive ? 'var(--sidebar-fg-active)' : 'var(--sidebar-fg)',
                      background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    })}
                  >
                    <item.icon size={17} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <button
          onClick={onToggleCollapse}
          className="collapse-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: '12px 16px',
            borderTop: '1px solid var(--sidebar-border)',
            background: 'none',
            border: 'none',
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'var(--sidebar-border)',
            color: 'var(--sidebar-fg)',
            cursor: 'pointer',
            fontSize: 12.5
          }}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>
      </aside>
      <style>{`
        @media (max-width: 900px) {
          .sidebar-overlay { display: block !important; }
          .app-sidebar { transform: translateX(-100%); width: var(--sidebar-width) !important; }
          .app-sidebar.open { transform: translateX(0); }
          .mobile-close-btn { display: flex !important; }
          .collapse-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

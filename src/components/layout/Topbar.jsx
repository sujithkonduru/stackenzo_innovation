import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings as SettingsIcon, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';

export default function Topbar({ pageTitle, onOpenMobileSidebar }) {
  const { session, endSession, switchOrganization } = useAuth();
  const { organizations } = useOrganization();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const orgRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (orgRef.current && !orgRef.current.contains(e.target)) setOrgMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleLogout() {
    endSession();
    navigate('/login');
  }

  const initials = (session?.userName || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <button
          onClick={onOpenMobileSidebar}
          className="mobile-menu-btn"
          aria-label="Open menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          <Menu size={20} />
        </button>
        <h1
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            margin: 0,
            color: 'var(--foreground)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div ref={orgRef} style={{ position: 'relative' }} className="org-selector">
          <button
            onClick={() => setOrgMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: 12.5,
              cursor: 'pointer',
              maxWidth: 180
            }}
          >
            <Building2 size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.organizationName || 'No organization'}
            </span>
            <ChevronDown size={13} />
          </button>
          {orgMenuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 220,
                zIndex: 40,
                maxHeight: 280,
                overflowY: 'auto'
              }}
            >
              {organizations.length === 0 && (
                <div style={{ padding: 12, fontSize: 12.5, color: 'var(--muted)' }}>
                  No organizations found
                </div>
              )}
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id, org.name);
                    setOrgMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 12px',
                    background: org.id === session?.organizationId ? 'var(--primary-soft)' : 'none',
                    border: 'none',
                    fontSize: 13,
                    color: 'var(--foreground)',
                    cursor: 'pointer'
                  }}
                >
                  {org.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          aria-label="Notifications"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--muted)',
            cursor: 'pointer'
          }}
        >
          <Bell size={16} />
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 8
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {initials}
            </div>
            <div className="user-meta" style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
                {session?.userName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{session?.role}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '115%',
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 190,
                zIndex: 40,
                overflow: 'hidden'
              }}
            >
              <MenuItem icon={User} label="My Profile" onClick={() => { setMenuOpen(false); navigate('/settings'); }} />
              <MenuItem icon={SettingsIcon} label="Settings" onClick={() => { setMenuOpen(false); navigate('/settings'); }} />
              <div style={{ borderTop: '1px solid var(--border)' }} />
              <MenuItem icon={LogOut} label="Logout" danger onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn { display: flex !important; }
          .user-meta { display: none; }
        }
        @media (max-width: 640px) {
          .org-selector { display: none; }
        }
      `}</style>
    </header>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        width: '100%',
        padding: '10px 14px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        fontSize: 13,
        cursor: 'pointer',
        color: danger ? 'var(--danger)' : 'var(--foreground)'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

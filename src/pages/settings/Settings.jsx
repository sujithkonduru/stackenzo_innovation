import { useState } from 'react';
import { User, Building2, Palette, Bell, Save, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Switch from '../../components/forms/Switch';
import NumberInput from '../../components/forms/NumberInput';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { USER_ROLES, LOCAL_STORAGE_KEYS, DEFAULT_EXPIRY_SOON_DAYS } from '../../utils/constants';

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'organization', label: 'Organization', icon: Building2 },
  { key: 'application', label: 'Application', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell }
];

export default function Settings() {
  const { session, startSession } = useAuth();
  const { currentOrganizationName } = useOrganization();
  const { mode, setTheme } = useTheme();
  const toast = useToast();
  const [active, setActive] = useState('profile');

  const [profile, setProfile] = useState({
    userName: session?.userName || '',
    role: session?.role || USER_ROLES.EMPLOYEE,
    userId: session?.userId || ''
  });

  const [expiryDays, setExpiryDays] = useState(
    () => localStorage.getItem(LOCAL_STORAGE_KEYS.EXPIRY_THRESHOLD) || String(DEFAULT_EXPIRY_SOON_DAYS)
  );

  function saveProfile() {
    startSession({
      organizationId: session.organizationId,
      organizationName: session.organizationName,
      userId: profile.userId || null,
      userName: profile.userName,
      role: profile.role
    });
    toast.success('Profile updated');
  }

  function saveExpiryThreshold() {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPIRY_THRESHOLD, expiryDays);
    toast.success('Expiry threshold saved');
  }

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, organization, and application preferences." />

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }} className="settings-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active === s.key ? 'var(--primary-soft)' : 'transparent',
                color: active === s.key ? 'var(--primary)' : 'var(--foreground)',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}
        </div>

        <div>
          {active === 'profile' && (
            <Card style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>My Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="Your name" value={profile.userName} onChange={(e) => setProfile({ ...profile, userName: e.target.value })} />
                <Select
                  label="Role"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  options={[
                    { value: USER_ROLES.ADMIN, label: 'Admin' },
                    { value: USER_ROLES.MANAGER, label: 'Manager / Approver' },
                    { value: USER_ROLES.EMPLOYEE, label: 'Employee / Staff' }
                  ]}
                />
                <Input
                  label="User ID"
                  value={profile.userId}
                  onChange={(e) => setProfile({ ...profile, userId: e.target.value })}
                  hint="Must match an existing row in the backend's users table — required for material requests, approvals, and returns."
                />
                <Button onClick={saveProfile} icon={Save} style={{ alignSelf: 'flex-start' }}>Save Profile</Button>
              </div>
            </Card>
          )}

          {active === 'organization' && (
            <Card style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Organization</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                You're currently working in <strong style={{ color: 'var(--foreground)' }}>{currentOrganizationName}</strong>.
                Switch organizations from the dropdown in the top navigation bar, or manage organization
                details from the <a href="/organization" style={{ color: 'var(--primary)' }}>Organization</a> page.
              </p>
            </Card>
          )}

          {active === 'application' && (
            <Card style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Appearance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['light', 'dark', 'system'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: 8,
                        border: `1px solid ${mode === m ? 'var(--primary)' : 'var(--border-strong)'}`,
                        background: mode === m ? 'var(--primary-soft)' : 'var(--surface)',
                        color: mode === m ? 'var(--primary)' : 'var(--foreground)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Inventory Alerts</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <NumberInput
                  label="Expiring Soon Threshold (days)"
                  min="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  hint="Batches expiring within this many days are flagged as 'Expiring Soon'."
                />
                <Button onClick={saveExpiryThreshold}>Save</Button>
              </div>
            </Card>
          )}

          {active === 'notifications' && (
            <Card style={{ maxWidth: 480 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Notifications</h3>
              <div style={{ display: 'flex', gap: 8, padding: 12, background: 'var(--info-soft)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
                <Info size={15} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
                  The backend doesn't have a notifications system, so these toggles are local-only for now and
                  don't change server behavior.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Switch label="Low stock alerts" checked disabled />
                <Switch label="Expiry alerts" checked disabled />
                <Switch label="Material request updates" checked disabled />
              </div>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

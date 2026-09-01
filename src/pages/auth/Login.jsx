import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Building2, Info, Plus, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getOrganizations, createOrganization } from '../../services/organizationApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import { USER_ROLES } from '../../utils/constants';
import { isRequired, isEmail, validateForm, hasErrors } from '../../utils/validation';

export default function Login() {
  const { startSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [creatingOrg, setCreatingOrg] = useState(false);

  const [form, setForm] = useState({
    organizationId: '',
    userName: '',
    userId: '',
    role: USER_ROLES.EMPLOYEE
  });
  const [newOrg, setNewOrg] = useState({ name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    setLoadingOrgs(true);
    try {
      const list = await getOrganizations();
      setOrganizations(list);
    } catch {
      setOrganizations([]);
    } finally {
      setLoadingOrgs(false);
    }
  }

  async function handleCreateOrg(e) {
    e.preventDefault();
    const orgErrors = validateForm(newOrg, {
      name: isRequired,
      email: isEmail,
      phone: isRequired,
      address: isRequired
    });
    if (hasErrors(orgErrors)) {
      setErrors(orgErrors);
      return;
    }
    setSubmitting(true);
    try {
      const org = await createOrganization(newOrg);
      toast.success('Organization created successfully');
      await loadOrganizations();
      setForm((f) => ({ ...f, organizationId: org.id }));
      setCreatingOrg(false);
    } catch (err) {
      toast.error(err.message || 'Unable to create organization');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formErrors = validateForm(form, {
      organizationId: isRequired,
      userName: isRequired
    });
    if (hasErrors(formErrors)) {
      setErrors(formErrors);
      return;
    }
    const org = organizations.find((o) => o.id === form.organizationId);
    startSession({
      organizationId: form.organizationId,
      organizationName: org?.name || '',
      userId: form.userId || null,
      userName: form.userName,
      role: form.role
    });
    toast.success(`Welcome, ${form.userName}!`);
    navigate('/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: 20
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Boxes size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Stackenzo</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>INVENTORY</div>
          </div>
        </div>

        <Card style={{ padding: 28 }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: 'var(--foreground)' }}>
            Start your session
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 18px', lineHeight: 1.5 }}>
            Pick your organization and identify yourself to continue.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 8,
              background: 'var(--info-soft)',
              border: '1px solid var(--info)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 20
            }}
          >
            <Info size={15} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
              This backend does not yet implement authentication (<code>api/auth.js</code> is empty).
              This screen sets a local session only — it does not verify a password. If you plan to
              submit material requests, ask your database admin for your existing <strong>User ID</strong>{' '}
              from the <code>users</code> table, since requests require one and there is no signup API yet.
            </p>
          </div>

          {!creatingOrg ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Select
                  label="Organization"
                  required
                  value={form.organizationId}
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                  options={organizations.map((o) => ({ value: o.id, label: o.name }))}
                  placeholder={loadingOrgs ? 'Loading organizations...' : 'Select organization'}
                  error={errors.organizationId}
                  disabled={loadingOrgs}
                />
                <button
                  type="button"
                  onClick={() => setCreatingOrg(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 8,
                    padding: 0
                  }}
                >
                  <Plus size={13} /> Create a new organization
                </button>
              </div>

              <Input
                label="Your name"
                required
                placeholder="e.g. Priya Sharma"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                error={errors.userName}
              />

              <Select
                label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={[
                  { value: USER_ROLES.ADMIN, label: 'Admin' },
                  { value: USER_ROLES.MANAGER, label: 'Manager / Approver' },
                  { value: USER_ROLES.EMPLOYEE, label: 'Employee / Staff' }
                ]}
              />

              <Input
                label="User ID (optional)"
                placeholder="UUID from the users table, if you have one"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                hint="Required only for creating/approving material requests and returns."
              />

              <Button type="submit" fullWidth size="lg" icon={UserCircle} style={{ marginTop: 6 }}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: -4 }}>
                <Building2 size={15} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>
                  New Organization
                </span>
              </div>
              <Input
                label="Organization name"
                required
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                error={errors.name}
              />
              <Input
                label="Email"
                required
                type="email"
                value={newOrg.email}
                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Phone"
                required
                value={newOrg.phone}
                onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
                error={errors.phone}
              />
              <Input
                label="Address"
                required
                value={newOrg.address}
                onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                error={errors.address}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <Button type="button" variant="secondary" fullWidth onClick={() => setCreatingOrg(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth loading={submitting}>
                  Create Organization
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

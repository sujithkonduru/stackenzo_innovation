import { useState } from 'react';
import { Building2, Plus, Pencil, Power } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import Input from '../../components/forms/Input';
import FormActions from '../../components/forms/FormActions';
import { useApiList } from '../../hooks/useApiList';
import { useDebounce } from '../../hooks/useDebounce';
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deactivateOrganization
} from '../../services/organizationApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { isRequired, isEmail, validateForm, hasErrors } from '../../utils/validation';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Organization() {
  const toast = useToast();
  const { switchOrganization, session } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refresh } = useApiList(() => getOrganizations(), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const filtered = data.filter((org) =>
    org.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(org) {
    setEditing(org);
    setForm({ name: org.name || '', email: org.email || '', phone: org.phone || '', address: org.address || '' });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const formErrors = validateForm(form, {
      name: isRequired,
      email: isEmail,
      phone: isRequired,
      address: isRequired
    });
    if (hasErrors(formErrors)) {
      setErrors(formErrors);
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateOrganization({ organizationId: editing.id, ...form });
        toast.success('Organization updated successfully');
      } else {
        await createOrganization(form);
        toast.success('Organization created successfully');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to save organization');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await deactivateOrganization(confirming.id);
      toast.success('Organization deactivated');
      setConfirming(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to deactivate organization');
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Organization',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)',
              color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}
          >
            <Building2 size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', header: 'Phone' },
    { key: 'address', header: 'Address', render: (row) => (
      <span style={{ color: 'var(--muted)' }}>{row.address}</span>
    ) },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => <StatusBadge status={row.is_active === false ? 'INACTIVE' : 'ACTIVE'} />
    }
  ];

  return (
    <div>
      <PageHeader
        title="Organization"
        description="Manage the organizations connected to your Stackenzo account."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New Organization
          </Button>
        }
      />

      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search organizations..." style={{ maxWidth: 320 }} />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No organizations found"
          emptyDescription="Create your first organization to get started."
          emptyAction={<Button icon={Plus} onClick={openCreate}>New Organization</Button>}
          rowActions={(row) => (
            <RowActionsMenu
              items={[
                { label: 'Edit', icon: Pencil, onClick: () => openEdit(row) },
                {
                  label: row.is_active === false ? 'Reactivate' : 'Deactivate',
                  icon: Power,
                  danger: row.is_active !== false,
                  onClick: () => setConfirming(row)
                }
              ]}
            />
          )}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Organization' : 'New Organization'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Organization'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Organization name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
          <Input label="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={errors.address} />
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate Organization?"
        message={`This will deactivate "${confirming?.name}". You can reactivate it later from the same menu.`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}

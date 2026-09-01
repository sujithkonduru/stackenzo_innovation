import { useState } from 'react';
import { MapPin, Plus, Pencil, Power } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import Input from '../../components/forms/Input';
import { useLocations } from '../../hooks/useLocations';
import { useDebounce } from '../../hooks/useDebounce';
import { createLocation, updateLocation, deactivateLocation } from '../../services/locationApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { isRequired, validateForm, hasErrors } from '../../utils/validation';

const emptyForm = { name: '', code: '', address: '' };

export default function Locations() {
  const toast = useToast();
  const { currentOrganizationName } = useOrganization();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refresh } = useLocations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const filtered = data.filter(
    (loc) =>
      loc.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      loc.code?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(loc) {
    setEditing(loc);
    setForm({ name: loc.name || '', code: loc.code || '', address: loc.address || '' });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const formErrors = validateForm(form, { name: isRequired, code: isRequired, address: isRequired });
    if (hasErrors(formErrors)) return setErrors(formErrors);
    setSaving(true);
    try {
      if (editing) {
        await updateLocation({ locationId: editing.id, ...form });
        toast.success('Location updated successfully');
      } else {
        await createLocation({ organization_name: currentOrganizationName, ...form });
        toast.success('Location created successfully');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to save location');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await deactivateLocation(confirming.id);
      toast.success('Location deactivated');
      setConfirming(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to deactivate location');
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Location',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--info-soft)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.code}</div>
          </div>
        </div>
      )
    },
    { key: 'address', header: 'Address', render: (row) => <span style={{ color: 'var(--muted)' }}>{row.address}</span> },
    { key: 'is_active', header: 'Status', render: (row) => <StatusBadge status={row.is_active === false ? 'INACTIVE' : 'ACTIVE'} /> }
  ];

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Warehouses, stores, and sites where inventory is stocked."
        actions={<Button icon={Plus} onClick={openCreate}>New Location</Button>}
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search locations..." style={{ maxWidth: 320 }} />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No locations found"
          emptyDescription="Add a location to start tracking inventory there."
          emptyAction={<Button icon={Plus} onClick={openCreate}>New Location</Button>}
          rowActions={(row) => (
            <RowActionsMenu
              items={[
                { label: 'Edit', icon: Pencil, onClick: () => openEdit(row) },
                { label: row.is_active === false ? 'Reactivate' : 'Deactivate', icon: Power, danger: row.is_active !== false, onClick: () => setConfirming(row) }
              ]}
            />
          )}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Location' : 'New Location'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Location'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Location name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Location code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} error={errors.code} />
          <Input label="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={errors.address} />
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate Location?"
        message={`This will deactivate "${confirming?.name}".`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}

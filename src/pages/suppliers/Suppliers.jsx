import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Pencil, Power, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import Input from '../../components/forms/Input';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useDebounce } from '../../hooks/useDebounce';
import { createSupplier, updateSupplier, deactivateSupplier } from '../../services/supplierApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { isRequired, isEmail, isPhone, validateForm, hasErrors } from '../../utils/validation';

const emptyForm = { name: '', email: '', phone: '', address: '', tax_id: '' };

export default function Suppliers() {
  const toast = useToast();
  const navigate = useNavigate();
  const { currentOrganizationId } = useOrganization();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refresh } = useSuppliers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const filtered = data.filter(
    (s) =>
      s.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      tax_id: supplier.tax_id || ''
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const formErrors = validateForm(form, {
      name: isRequired,
      email: isEmail,
      phone: isPhone,
      address: isRequired
    });
    if (hasErrors(formErrors)) return setErrors(formErrors);
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier({ supplierId: editing.id, ...form });
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier({ organization_id: currentOrganizationId, ...form });
        toast.success('Supplier created successfully');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to save supplier');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await deactivateSupplier(confirming.id);
      toast.success('Supplier deactivated');
      setConfirming(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to deactivate supplier');
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Supplier',
      sortable: true,
      render: (row) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate(`/suppliers/${row.id}`)}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--info-soft)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Truck size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', header: 'Phone' },
    { key: 'tax_id', header: 'Tax ID' },
    { key: 'is_active', header: 'Status', render: (row) => <StatusBadge status={row.is_active === false ? 'INACTIVE' : 'ACTIVE'} /> }
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Vendors you purchase inventory from."
        actions={<Button icon={Plus} onClick={openCreate}>New Supplier</Button>}
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." style={{ maxWidth: 320 }} />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No suppliers found"
          emptyDescription="Add a supplier to start recording purchases."
          emptyAction={<Button icon={Plus} onClick={openCreate}>New Supplier</Button>}
          rowActions={(row) => (
            <RowActionsMenu
              items={[
                { label: 'View Details', icon: Eye, onClick: () => navigate(`/suppliers/${row.id}`) },
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
        title={editing ? 'Edit Supplier' : 'New Supplier'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Supplier'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Supplier name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
          <Input label="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} error={errors.address} />
          <Input label="Tax ID" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate Supplier?"
        message={`This will deactivate "${confirming?.name}".`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}

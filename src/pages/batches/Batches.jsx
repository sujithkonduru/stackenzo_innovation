import { useMemo, useState } from 'react';
import { Layers, Plus, Pencil } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import Modal from '../../components/modals/Modal';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import DateInput from '../../components/forms/DateInput';
import NumberInput from '../../components/forms/NumberInput';
import { useBatches } from '../../hooks/useBatches';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { createBatch, updateBatch } from '../../services/batchApi';
import { useToast } from '../../context/ToastContext';
import { useOrganization } from '../../context/OrganizationContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, daysUntil, toInputDate } from '../../utils/formatDate';
import { isRequired, validateForm, hasErrors } from '../../utils/validation';

const FILTERS = ['All', 'Expired', 'Expiring in 7 Days', 'Expiring in 30 Days', 'Valid'];

const emptyForm = { product_id: '', batch_number: '', expiry_date: '', purchase_price: '', selling_price: '' };

export default function Batches() {
  const toast = useToast();
  const { currentOrganizationName } = useOrganization();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [filter, setFilter] = useState('All');
  const { data, loading, refresh } = useBatches();
  const { data: products } = useProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const expiryStatus = (dateStr) => {
    if (!dateStr) return null;
    const d = daysUntil(dateStr);
    if (d < 0) return 'Expired';
    if (d <= 30) return 'Expiring Soon';
    return 'Valid';
  };

  const filtered = useMemo(() => {
    return data.filter((b) => {
      const matchesSearch =
        b.batch_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.product_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'All') return true;
      const d = daysUntil(b.expiry_date);
      if (d === null) return filter === 'Valid' ? false : false;
      if (filter === 'Expired') return d < 0;
      if (filter === 'Expiring in 7 Days') return d >= 0 && d <= 7;
      if (filter === 'Expiring in 30 Days') return d >= 0 && d <= 30;
      if (filter === 'Valid') return d > 30;
      return true;
    });
  }, [data, debouncedSearch, filter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(batch) {
    setEditing(batch);
    setForm({
      product_id: batch.product_id,
      batch_number: batch.batch_number || '',
      expiry_date: toInputDate(batch.expiry_date),
      purchase_price: String(batch.purchase_price ?? ''),
      selling_price: String(batch.selling_price ?? '')
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const formErrors = validateForm(form, {
      product_id: isRequired,
      batch_number: isRequired,
      purchase_price: isRequired,
      selling_price: isRequired
    });
    if (hasErrors(formErrors)) return setErrors(formErrors);

    setSaving(true);
    try {
      if (editing) {
        await updateBatch({
          batchId: editing.id,
          batch_number: form.batch_number,
          expiry_date: form.expiry_date || null,
          purchase_price: Number(form.purchase_price),
          selling_price: Number(form.selling_price)
        });
        toast.success('Batch updated successfully');
      } else {
        await createBatch({
          organization_name: currentOrganizationName,
          product_id: form.product_id,
          batch_number: form.batch_number,
          expiry_date: form.expiry_date || null,
          purchase_price: Number(form.purchase_price),
          selling_price: Number(form.selling_price)
        });
        toast.success('Batch created successfully');
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to save batch');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: 'batch_number',
      header: 'Batch',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.batch_number}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.product_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'expiry_date',
      header: 'Expiry',
      sortable: true,
      render: (row) => {
        if (!row.expiry_date) return '—';
        const status = expiryStatus(row.expiry_date);
        const tone = status === 'Expired' ? 'EXPIRED' : status === 'Expiring Soon' ? 'EXPIRING_SOON' : 'SAFE';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {formatDate(row.expiry_date)}
            <StatusBadge status={tone} />
          </div>
        );
      }
    },
    { key: 'purchase_price', header: 'Purchase Price', render: (row) => formatCurrency(row.purchase_price) },
    { key: 'selling_price', header: 'Selling Price', render: (row) => formatCurrency(row.selling_price) }
  ];

  return (
    <div>
      <PageHeader
        title="Product Batches"
        description="Track batch-level pricing and expiry across your catalog."
        actions={<Button icon={Plus} onClick={openCreate}>New Batch</Button>}
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search batch or product..." style={{ maxWidth: 300 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border-strong)'}`,
                  background: filter === f ? 'var(--primary-soft)' : 'var(--surface)',
                  color: filter === f ? 'var(--primary)' : 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No batches found"
          emptyDescription="Create a batch to start tracking pricing and expiry."
          emptyAction={<Button icon={Plus} onClick={openCreate}>New Batch</Button>}
          rowActions={(row) => (
            <RowActionsMenu items={[{ label: 'Edit', icon: Pencil, onClick: () => openEdit(row) }]} />
          )}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Batch' : 'New Batch'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create Batch'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Product"
            required
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            error={errors.product_id}
            disabled={Boolean(editing)}
          />
          <Input label="Batch Number" required value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} error={errors.batch_number} />
          <DateInput label="Expiry Date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          <NumberInput label="Purchase Price" required prefix="₹" min="0" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} error={errors.purchase_price} />
          <NumberInput label="Selling Price" required prefix="₹" min="0" step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} error={errors.selling_price} />
        </form>
      </Modal>
    </div>
  );
}

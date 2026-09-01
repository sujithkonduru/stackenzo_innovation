import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Pencil, Power, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchInput from '../../components/common/SearchInput';
import StatusBadge from '../../components/common/StatusBadge';
import Badge from '../../components/common/Badge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { deactivateProduct } from '../../services/productApi';
import { useToast } from '../../context/ToastContext';

export default function Products() {
  const toast = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, refresh } = useProducts();

  const [confirming, setConfirming] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const filtered = data.filter((p) => {
    const q = debouncedSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q)
    );
  });

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await deactivateProduct(confirming.id);
      toast.success('Product deactivated');
      setConfirming(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to deactivate product');
    } finally {
      setDeactivating(false);
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (row) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate(`/products/${row.id}`)}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.sku || 'No SKU'}</div>
          </div>
        </div>
      )
    },
    { key: 'category_name', header: 'Category', render: (row) => row.category_name ? <Badge tone="primary">{row.category_name}</Badge> : '—' },
    { key: 'unit', header: 'Unit' },
    { key: 'manufacturer', header: 'Manufacturer', render: (row) => row.manufacturer || '—' },
    { key: 'reorder_level', header: 'Reorder Level' },
    { key: 'has_expiry', header: 'Expiry', render: (row) => (row.has_expiry ? <Badge tone="info">Enabled</Badge> : <Badge tone="neutral">Disabled</Badge>) },
    { key: 'is_active', header: 'Status', render: (row) => <StatusBadge status={row.is_active === false ? 'INACTIVE' : 'ACTIVE'} /> }
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        actions={<Button icon={Plus} onClick={() => navigate('/products/create')}>New Product</Button>}
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, SKU, or barcode..." style={{ maxWidth: 360 }} />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No products found"
          emptyDescription="Add your first product to start tracking inventory."
          emptyAction={<Button icon={Plus} onClick={() => navigate('/products/create')}>New Product</Button>}
          rowActions={(row) => (
            <RowActionsMenu
              items={[
                { label: 'View Details', icon: Eye, onClick: () => navigate(`/products/${row.id}`) },
                { label: 'Edit', icon: Pencil, onClick: () => navigate(`/products/edit/${row.id}`) },
                { label: row.is_active === false ? 'Reactivate' : 'Deactivate', icon: Power, danger: row.is_active !== false, onClick: () => setConfirming(row) }
              ]}
            />
          )}
        />
      </Card>

      <ConfirmModal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        onConfirm={handleDeactivate}
        loading={deactivating}
        title="Deactivate Product?"
        message={`This will deactivate "${confirming?.name}". It will no longer appear in POS or new purchase entries.`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}

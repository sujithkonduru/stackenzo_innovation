import { useMemo, useState } from 'react';
import { Boxes } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/forms/Select';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/tables/DataTable';
import { useInventory } from '../../hooks/useInventory';
import { useLocations } from '../../hooks/useLocations';
import { useCategories } from '../../hooks/useCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, daysUntil } from '../../utils/formatDate';

const STOCK_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock', 'Expired'];
const EXPIRY_FILTERS = ['All', 'Expired', 'Expiring Soon', 'Valid'];

function getStockStatus(row) {
  const qty = Number(row.quantity) || 0;
  const reorder = Number(row.reorder_level) || 0;
  if (row.expiry_date && daysUntil(row.expiry_date) < 0) return 'Expired';
  if (qty <= 0) return 'Out of Stock';
  if (qty <= reorder) return 'Low Stock';
  return 'In Stock';
}

export default function Inventory() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('All');

  const { data, loading } = useInventory({
    locationId: locationId || undefined,
    categoryId: categoryId || undefined,
    name: debouncedSearch || undefined
  });
  const { data: locations } = useLocations();
  const { data: categories } = useCategories();

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (stockStatus && getStockStatus(row) !== stockStatus) return false;
      if (expiryFilter !== 'All') {
        const d = row.expiry_date ? daysUntil(row.expiry_date) : null;
        if (expiryFilter === 'Expired' && !(d !== null && d < 0)) return false;
        if (expiryFilter === 'Expiring Soon' && !(d !== null && d >= 0 && d <= 30)) return false;
        if (expiryFilter === 'Valid' && !(d === null || d > 30)) return false;
      }
      return true;
    });
  }, [data, stockStatus, expiryFilter]);

  const columns = [
    {
      key: 'product_name',
      header: 'Product',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.product_name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{row.sku || 'No SKU'}</div>
        </div>
      )
    },
    { key: 'batch_number', header: 'Batch', render: (row) => row.batch_number || '—' },
    { key: 'location_name', header: 'Location', render: (row) => row.location_name || '—' },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'unit', header: 'Unit' },
    { key: 'expiry_date', header: 'Expiry', render: (row) => (row.expiry_date ? formatDate(row.expiry_date) : '—') },
    { key: 'reorder_level', header: 'Reorder Level' },
    {
      key: 'status',
      header: 'Stock Status',
      render: (row) => {
        const s = getStockStatus(row);
        const map = { 'In Stock': 'IN_STOCK', 'Low Stock': 'LOW_STOCK', 'Out of Stock': 'OUT_OF_STOCK', Expired: 'EXPIRED' };
        return <StatusBadge status={map[s]} />;
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Real-time stock levels across all locations and batches."
      />
      <Card padding={0}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search products..." style={{ maxWidth: 260 }} />
          <div style={{ width: 170 }}>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="All Categories" />
          </div>
          <div style={{ width: 170 }}>
            <Select value={locationId} onChange={(e) => setLocationId(e.target.value)} options={locations.map((l) => ({ value: l.id, label: l.name }))} placeholder="All Locations" />
          </div>
          <div style={{ width: 170 }}>
            <Select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} options={STOCK_STATUSES} placeholder="All Stock Status" />
          </div>
          <div style={{ width: 170 }}>
            <Select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)} options={EXPIRY_FILTERS} placeholder="Expiry" />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No inventory found"
          emptyDescription="Once products are stocked at a location, they'll appear here."
          pageSize={12}
        />
      </Card>
    </div>
  );
}

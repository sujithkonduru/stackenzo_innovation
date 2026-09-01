import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Package } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import DataTable from '../../components/tables/DataTable';
import { PageLoader } from '../../components/common/Loader';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { useBatches } from '../../hooks/useBatches';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, daysUntil } from '../../utils/formatDate';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products, loading: productsLoading } = useProducts();
  const { data: inventory, loading: inventoryLoading } = useInventory({ productId: id });
  const { data: batches, loading: batchesLoading } = useBatches({ productId: id });

  const product = products.find((p) => p.id === id);
  const loading = productsLoading || inventoryLoading || batchesLoading;

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        action={<Button onClick={() => navigate('/products')}>Back to Products</Button>}
      />
    );
  }

  const availableQuantity = inventory.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

  const batchColumns = [
    { key: 'batch_number', header: 'Batch #', sortable: true },
    {
      key: 'expiry_date',
      header: 'Expiry',
      render: (row) => {
        if (!product.has_expiry || !row.expiry_date) return '—';
        const d = daysUntil(row.expiry_date);
        const tone = d < 0 ? 'EXPIRED' : d <= 30 ? 'EXPIRING_SOON' : 'SAFE';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {formatDate(row.expiry_date)}
            <StatusBadge status={tone} />
          </div>
        );
      }
    },
    { key: 'purchase_price', header: 'Purchase Price', render: (row) => formatCurrency(row.purchase_price) },
    { key: 'selling_price', header: 'Selling Price', render: (row) => formatCurrency(row.selling_price) },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => {
        const stock = inventory.filter((i) => i.batch_id === row.id).reduce((s, i) => s + (Number(i.quantity) || 0), 0);
        return stock;
      }
    }
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Products', to: '/products' }, { label: product.name }]} />}
        title={product.name}
        description={product.sku ? `SKU: ${product.sku}` : undefined}
        actions={
          <>
            <Link to="/products">
              <Button variant="secondary" icon={ArrowLeft}>Back</Button>
            </Link>
            <Button icon={Pencil} onClick={() => navigate(`/products/edit/${product.id}`)}>Edit</Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)', gap: 16, marginBottom: 16 }} className="pd-grid">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{product.name}</div>
              <StatusBadge status={product.is_active === false ? 'INACTIVE' : 'ACTIVE'} />
            </div>
          </div>
          <DetailRow label="SKU" value={product.sku || '—'} />
          <DetailRow label="Barcode" value={product.barcode || '—'} />
          <DetailRow label="Category" value={product.category_name ? <Badge tone="primary">{product.category_name}</Badge> : '—'} />
          <DetailRow label="Manufacturer" value={product.manufacturer || '—'} />
          <DetailRow label="Unit" value={product.unit} />
          <DetailRow label="Reorder Level" value={product.reorder_level} />
          <DetailRow label="Expiry Enabled" value={product.has_expiry ? 'Yes' : 'No'} />
          {product.description && <DetailRow label="Description" value={product.description} />}
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Stock Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 8 }}>
            <SummaryStat label="Available Quantity" value={availableQuantity} highlight />
            <SummaryStat label="Total Purchased" value="—" note />
            <SummaryStat label="Total Sold" value="—" note />
            <SummaryStat label="Total Issued" value="—" note />
            <SummaryStat label="Total Returned" value="—" note />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
            Purchased / Sold / Issued / Returned totals require a stock-movement history endpoint,
            which the backend doesn't expose yet (see Reports → Backend Integration Notes).
          </p>
        </Card>
      </div>

      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Batch Information</h3>
        </div>
        <DataTable
          columns={batchColumns}
          data={batches}
          loading={false}
          emptyTitle="No batches for this product"
          emptyDescription={product.has_expiry ? 'Add a batch to start tracking expiry and stock.' : undefined}
        />
      </Card>

      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>Stock Movement History</h3>
        <EmptyState
          title="Not available yet"
          description="There is no GET endpoint for stock_movements on the backend, so movement history (type, quantity, batch, location, date, performed by) can't be shown yet."
        />
      </Card>

      <style>{`
        @media (max-width: 800px) {
          .pd-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function SummaryStat({ label, value, highlight, note }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: highlight ? 'var(--primary-soft)' : 'var(--background)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: note ? 'var(--muted-2)' : highlight ? 'var(--primary)' : 'var(--foreground)' }}>
        {value}
      </div>
    </div>
  );
}

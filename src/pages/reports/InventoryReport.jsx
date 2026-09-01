import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/tables/DataTable';
import KpiCard from '../../components/common/KpiCard';
import { Boxes, IndianRupee, MapPin } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function InventoryReport() {
  const { data, loading } = useInventory();

  const totalUnits = data.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const totalValue = data.reduce((s, r) => s + Number(r.quantity || 0) * Number(r.purchase_price || 0), 0);
  const locationCount = new Set(data.map((r) => r.location_id)).size;

  const columns = [
    { key: 'product_name', header: 'Product', sortable: true },
    { key: 'location_name', header: 'Location' },
    { key: 'batch_number', header: 'Batch', render: (r) => r.batch_number || '—' },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'purchase_price', header: 'Cost Value', render: (r) => formatCurrency((Number(r.quantity) || 0) * (Number(r.purchase_price) || 0)) },
    { key: 'selling_price', header: 'Selling Value', render: (r) => formatCurrency((Number(r.quantity) || 0) * (Number(r.selling_price) || 0)) },
    { key: 'expiry_date', header: 'Expiry', render: (r) => (r.expiry_date ? formatDate(r.expiry_date) : '—') }
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Reports', to: '/reports' }, { label: 'Inventory Report' }]} />}
        title="Inventory Report"
        actions={<Link to="/reports"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <KpiCard icon={Boxes} title="Total Units" value={totalUnits} />
        <KpiCard icon={IndianRupee} title="Cost Value" value={formatCurrencyCompact(totalValue)} tone="success" />
        <KpiCard icon={MapPin} title="Locations" value={locationCount} tone="info" />
      </div>
      <Card padding={0}>
        <DataTable columns={columns} data={data} loading={loading} emptyTitle="No inventory data" pageSize={15} />
      </Card>
    </div>
  );
}

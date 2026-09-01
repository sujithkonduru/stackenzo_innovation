import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import { useInventory } from '../../hooks/useInventory';

export default function LowStockReport() {
  const { data, loading } = useInventory({ lowStock: 'true' });

  const columns = [
    { key: 'product_name', header: 'Product', sortable: true },
    { key: 'sku', header: 'SKU', render: (r) => r.sku || '—' },
    { key: 'location_name', header: 'Location' },
    { key: 'quantity', header: 'Available', render: (r) => <Badge tone="warning">{r.quantity}</Badge> },
    { key: 'reorder_level', header: 'Reorder Level' },
    { key: 'shortfall', header: 'Shortfall', render: (r) => Math.max(0, Number(r.reorder_level || 0) - Number(r.quantity || 0)) }
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Reports', to: '/reports' }, { label: 'Low Stock Report' }]} />}
        title="Low Stock Report"
        description="Products at or below their configured reorder level."
        actions={<Link to="/reports"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <Card padding={0}>
        <DataTable columns={columns} data={data} loading={loading} emptyTitle="Nothing is low on stock" pageSize={15} />
      </Card>
    </div>
  );
}

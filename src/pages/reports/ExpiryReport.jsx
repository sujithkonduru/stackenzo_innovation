import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useBatches } from '../../hooks/useBatches';
import { formatDate, daysUntil } from '../../utils/formatDate';

export default function ExpiryReport() {
  const { data, loading } = useBatches();
  const withExpiry = data.filter((b) => b.expiry_date);

  const columns = [
    { key: 'product_name', header: 'Product', sortable: true },
    { key: 'batch_number', header: 'Batch' },
    { key: 'expiry_date', header: 'Expiry Date', sortable: true, render: (r) => formatDate(r.expiry_date) },
    {
      key: 'days_left',
      header: 'Days Left',
      render: (r) => {
        const d = daysUntil(r.expiry_date);
        return d < 0 ? `${Math.abs(d)} days ago` : `${d} days`;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const d = daysUntil(r.expiry_date);
        const status = d < 0 ? 'EXPIRED' : d <= 30 ? 'EXPIRING_SOON' : 'SAFE';
        return <StatusBadge status={status} />;
      }
    }
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Reports', to: '/reports' }, { label: 'Expiry Report' }]} />}
        title="Expiry Report"
        description="Every batch with an expiry date, sorted soonest first."
        actions={<Link to="/reports"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <Card padding={0}>
        <DataTable columns={columns} data={withExpiry} loading={loading} emptyTitle="No expiry-tracked batches" pageSize={15} />
      </Card>
    </div>
  );
}

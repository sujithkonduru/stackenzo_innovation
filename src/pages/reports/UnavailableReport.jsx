import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { FileWarning } from 'lucide-react';

const REASONS = {
  '/reports/purchases': 'There is no GET endpoint for purchases — only POST /purchase/create exists on the backend.',
  '/reports/sales': "api/sale.js has a working GET /sale/get, but it isn't mounted in index.js yet, so this report can't reach it.",
  '/reports/stock-movements': 'There is no GET endpoint that reads the stock_movements table, even though purchases, sales, and requests all write to it.'
};

export default function UnavailableReport({ title }) {
  const location = useLocation();
  const reason = REASONS[location.pathname] || 'This report needs a backend endpoint that does not exist yet.';

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Reports', to: '/reports' }, { label: title }]} />}
        title={title}
        actions={<Link to="/reports"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <Card>
        <EmptyState icon={FileWarning} title="Not available yet" description={reason} />
      </Card>
    </div>
  );
}

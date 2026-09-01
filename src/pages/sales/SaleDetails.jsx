import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { useApiList } from '../../hooks/useApiList';
import { useOrganization } from '../../context/OrganizationContext';
import { getSales } from '../../services/saleApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function SaleDetails() {
  const { id } = useParams();
  const { currentOrganizationId } = useOrganization();
  const { data, loading } = useApiList(
    () => getSales({ organization_id: currentOrganizationId }),
    [currentOrganizationId],
    { skip: !currentOrganizationId }
  );

  if (loading) return <PageLoader />;

  const sale = data.find((s) => s.id === id);

  if (!sale) {
    return <EmptyState title="Sale not found" action={<Link to="/sales"><Button>Back to Sales</Button></Link>} />;
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Sales History', to: '/sales' }, { label: sale.invoice_number }]} />}
        title={`Invoice ${sale.invoice_number}`}
        description={formatDateTime(sale.created_at)}
        actions={<Link to="/sales"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />
      <Card padding={0} style={{ marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Product', 'Batch', 'Qty', 'Unit Price', 'Tax %', 'Total'].map((h) => (
                <th key={h} style={{ textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(sale.items || []).map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.product_name}</td>
                <td style={tdStyle}>{item.batch_number || '—'}</td>
                <td style={tdStyle}>{item.quantity}</td>
                <td style={tdStyle}>{formatCurrency(item.unit_price)}</td>
                <td style={tdStyle}>{item.tax_percent}%</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(item.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card style={{ maxWidth: 320, marginLeft: 'auto' }}>
        <SummaryLine label="Subtotal" value={formatCurrency(sale.subtotal)} />
        <SummaryLine label="Tax" value={formatCurrency(sale.tax_amount)} />
        <SummaryLine label="Discount" value={formatCurrency(sale.discount)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(sale.total_amount)}</span>
        </div>
      </Card>
    </div>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const tdStyle = { padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13.5 };

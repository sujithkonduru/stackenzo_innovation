import { useNavigate } from 'react-router-dom';
import { Receipt, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import DataTable from '../../components/tables/DataTable';
import { useApiList } from '../../hooks/useApiList';
import { useOrganization } from '../../context/OrganizationContext';
import { getSales } from '../../services/saleApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function Sales() {
  const navigate = useNavigate();
  const { currentOrganizationId } = useOrganization();
  const { data, loading, error } = useApiList(
    () => getSales({ organization_id: currentOrganizationId }),
    [currentOrganizationId],
    { skip: !currentOrganizationId }
  );

  const columns = [
    { key: 'invoice_number', header: 'Invoice', sortable: true, render: (row) => <span style={{ fontWeight: 600 }}>{row.invoice_number}</span> },
    { key: 'created_at', header: 'Date', sortable: true, render: (row) => formatDate(row.created_at) },
    { key: 'customer_name', header: 'Customer', render: (row) => row.customer_name || 'Walk-in' },
    { key: 'subtotal', header: 'Subtotal', render: (row) => formatCurrency(row.subtotal) },
    { key: 'tax_amount', header: 'Tax', render: (row) => formatCurrency(row.tax_amount) },
    { key: 'discount', header: 'Discount', render: (row) => formatCurrency(row.discount) },
    { key: 'total_amount', header: 'Total', render: (row) => <span style={{ fontWeight: 700 }}>{formatCurrency(row.total_amount)}</span> }
  ];

  return (
    <div>
      <PageHeader title="Sales History" description="All completed sales for this organization." />

      {error && (
        <Card style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--warning-soft)', border: '1px solid var(--warning)' }}>
          <Info size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.5 }}>
            Couldn't load sales: <strong>{error}</strong>. If this is a 404 from the API itself (not "no sales yet"),
            it likely means <code>api/sale.js</code> isn't mounted in <code>index.js</code> yet — see Backend
            Integration Notes.
          </div>
        </Card>
      )}

      <Card padding={0}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyTitle="No sales found"
          emptyDescription="Sales made through the POS will appear here."
          getRowId={(row) => row.id}
        />
      </Card>
    </div>
  );
}

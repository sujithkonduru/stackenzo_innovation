import { useNavigate } from 'react-router-dom';
import { Undo2, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import { useApiList } from '../../hooks/useApiList';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { getUserMaterialItems } from '../../services/employeeApi';
import { formatDate } from '../../utils/formatDate';

export default function Returns() {
  const navigate = useNavigate();
  const { currentOrganizationId } = useOrganization();
  const { session } = useAuth();

  const { data, loading } = useApiList(
    () =>
      getUserMaterialItems({
        organization_id: currentOrganizationId,
        user_id: session?.userId || undefined
      }),
    [currentOrganizationId, session?.userId],
    { skip: !currentOrganizationId }
  );

  const returnable = data.filter((item) => item.request_status === 'APPROVED' && Number(item.remaining_quantity) > 0);

  const columns = [
    { key: 'product_name', header: 'Product', sortable: true },
    { key: 'project_name', header: 'Project', render: (row) => row.project_name || '—' },
    { key: 'approved_quantity', header: 'Issued Quantity' },
    { key: 'returned_quantity', header: 'Returned Quantity' },
    { key: 'remaining_quantity', header: 'Remaining', render: (row) => <Badge tone="warning">{row.remaining_quantity}</Badge> },
    { key: 'approved_at', header: 'Issued Date', render: (row) => (row.approved_at ? formatDate(row.approved_at) : '—') },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <Button size="sm" onClick={() => navigate(`/returns/create?request_id=${row.request_id}&product_id=${row.product_id}`)}>
          Return
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Material Returns"
        description="Return materials issued to you from approved requests."
        actions={<Button icon={Plus} onClick={() => navigate('/returns/create')}>New Return</Button>}
      />
      {!session?.userId && (
        <Card style={{ marginBottom: 16, background: 'var(--warning-soft)', border: '1px solid var(--warning)' }}>
          <p style={{ fontSize: 13, margin: 0, color: 'var(--foreground)' }}>
            Your session has no User ID set — set one from Settings to see items issued to you (returns can only
            be made by the person who requested the material).
          </p>
        </Card>
      )}
      <Card padding={0}>
        <DataTable
          columns={columns}
          data={returnable}
          loading={loading}
          getRowId={(row) => `${row.request_id}-${row.product_id}`}
          emptyTitle="Nothing to return"
          emptyDescription="Materials you've been issued from approved requests will appear here."
        />
      </Card>
    </div>
  );
}

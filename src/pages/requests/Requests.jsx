import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/forms/Select';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable, { RowActionsMenu } from '../../components/tables/DataTable';
import { useRequests } from '../../hooks/useRequests';
import { formatDate } from '../../utils/formatDate';
import { MATERIAL_REQUEST_STATUSES } from '../../utils/constants';

export default function Requests() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const { data, loading } = useRequests({ status: status || undefined });

  const columns = [
    {
      key: 'project_name',
      header: 'Project',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate(`/requests/${row.id}`)}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardList size={15} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.project_name || 'Untitled request'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(row.items || []).length} item(s)</div>
          </div>
        </div>
      )
    },
    { key: 'items', header: 'Items', render: (row) => (row.items || []).length },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'requested_at', header: 'Requested Date', sortable: true, render: (row) => formatDate(row.requested_at) },
    { key: 'approved_at', header: 'Approved Date', render: (row) => (row.approved_at ? formatDate(row.approved_at) : '—') }
  ];

  return (
    <div>
      <PageHeader
        title="Material Requests"
        description="Requests for materials from inventory, pending manager approval."
        actions={
          <>
            <div style={{ width: 190 }}>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} options={MATERIAL_REQUEST_STATUSES} placeholder="All Statuses" />
            </div>
            <Button icon={Plus} onClick={() => navigate('/requests/create')}>New Request</Button>
          </>
        }
      />
      <Card padding={0}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyTitle="No material requests found"
          emptyDescription="Create a request to draw materials from inventory."
          emptyAction={<Button icon={Plus} onClick={() => navigate('/requests/create')}>New Request</Button>}
          rowActions={(row) => (
            <RowActionsMenu items={[{ label: 'View Details', icon: Eye, onClick: () => navigate(`/requests/${row.id}`) }]} />
          )}
        />
      </Card>
    </div>
  );
}

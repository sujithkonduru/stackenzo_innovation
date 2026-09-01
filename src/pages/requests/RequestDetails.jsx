import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { PageLoader } from '../../components/common/Loader';
import { useRequests } from '../../hooks/useRequests';
import { decideMaterialRequest } from '../../services/employeeApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatDate';
import { USER_ROLES } from '../../utils/constants';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { session } = useAuth();
  const { data, loading, refresh } = useRequests();
  const request = data.find((r) => r.id === id);

  const [confirmAction, setConfirmAction] = useState(null); // 'APPROVED' | 'REJECTED'
  const [deciding, setDeciding] = useState(false);

  const canDecide = session?.role === USER_ROLES.ADMIN || session?.role === USER_ROLES.MANAGER;

  if (loading) return <PageLoader />;
  if (!request) {
    return <EmptyState title="Request not found" action={<Link to="/requests"><Button>Back to Requests</Button></Link>} />;
  }

  async function handleDecision() {
    if (!session?.userId) {
      toast.error('Your session has no User ID set. Approvals need a valid users.id — set one from Settings.');
      setConfirmAction(null);
      return;
    }
    setDeciding(true);
    try {
      await decideMaterialRequest({ request_id: request.id, approved_by: session.userId, decision: confirmAction });
      toast.success(confirmAction === 'APPROVED' ? 'Request approved' : 'Request rejected');
      setConfirmAction(null);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Unable to record decision');
    } finally {
      setDeciding(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Material Requests', to: '/requests' }, { label: request.project_name || 'Request' }]} />}
        title={request.project_name || 'Material Request'}
        actions={<Link to="/requests"><Button variant="secondary" icon={ArrowLeft}>Back</Button></Link>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16 }} className="rd-grid">
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Request Information</h3>
          <DetailRow label="Project" value={request.project_name || '—'} />
          <DetailRow label="Purpose" value={request.purpose || '—'} />
          <DetailRow label="Requested Date" value={formatDateTime(request.requested_at)} />
          <DetailRow label="Status" value={<StatusBadge status={request.status} />} />
          {request.approved_at && <DetailRow label="Approved Date" value={formatDateTime(request.approved_at)} />}

          {request.status === 'PENDING_APPROVAL' && canDecide && (
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Button variant="danger" icon={X} fullWidth onClick={() => setConfirmAction('REJECTED')}>Reject</Button>
              <Button icon={Check} fullWidth onClick={() => setConfirmAction('APPROVED')}>Approve</Button>
            </div>
          )}
          {request.status === 'PENDING_APPROVAL' && !canDecide && (
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
              Only Admins or Managers can approve or reject requests.
            </p>
          )}
        </Card>

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Items</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Product', 'Requested Qty', 'Approved Qty', 'Unit'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(request.items || []).map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.product_name}</td>
                  <td style={tdStyle}>{item.requested_quantity}</td>
                  <td style={tdStyle}>{item.approved_quantity ?? '—'}</td>
                  <td style={tdStyle}>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <ConfirmModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDecision}
        loading={deciding}
        tone={confirmAction === 'REJECTED' ? 'danger' : 'primary'}
        title={confirmAction === 'APPROVED' ? 'Approve this request?' : 'Reject this request?'}
        message={
          confirmAction === 'APPROVED'
            ? 'Approving this request will deduct the requested quantities from inventory.'
            : 'This request will be marked as rejected and no stock will be deducted.'
        }
        confirmLabel={confirmAction === 'APPROVED' ? 'Approve' : 'Reject'}
      />

      <style>{`
        @media (max-width: 800px) {
          .rd-grid { grid-template-columns: 1fr !important; }
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

const tdStyle = { padding: '11px 16px', borderBottom: '1px solid var(--border)', fontSize: 13.5 };

import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Hash } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Breadcrumb from '../../components/common/Breadcrumb';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import { useSuppliers } from '../../hooks/useSuppliers';

export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useSuppliers();
  const supplier = data.find((s) => s.id === id);

  if (loading) return <PageLoader />;

  if (!supplier) {
    return (
      <EmptyState
        title="Supplier not found"
        description="This supplier may have been removed."
        action={<Button onClick={() => navigate('/suppliers')}>Back to Suppliers</Button>}
      />
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Suppliers', to: '/suppliers' }, { label: supplier.name }]} />}
        title={supplier.name}
        actions={
          <Link to="/suppliers">
            <Button variant="secondary" icon={ArrowLeft}>Back</Button>
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16 }} className="supplier-grid">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Contact Information</h3>
            <StatusBadge status={supplier.is_active === false ? 'INACTIVE' : 'ACTIVE'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow icon={Mail} label="Email" value={supplier.email || '—'} />
            <InfoRow icon={Phone} label="Phone" value={supplier.phone || '—'} />
            <InfoRow icon={MapPin} label="Address" value={supplier.address || '—'} />
            <InfoRow icon={Hash} label="Tax ID" value={supplier.tax_id || '—'} />
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Purchase History</h3>
          <EmptyState
            title="Not available yet"
            description="Purchase history and totals need a GET /purchase endpoint, which doesn't exist on the backend yet. Once it's added, this section will show total purchase amount and recent orders from this supplier."
          />
        </Card>
      </div>
      <style>{`
        @media (max-width: 800px) {
          .supplier-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--muted)' }}>
        <Icon size={14} />
      </div>
      <div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
        <div style={{ fontSize: 13.5, color: 'var(--foreground)', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

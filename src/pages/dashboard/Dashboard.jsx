import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, IndianRupee, AlertTriangle, CalendarClock, Truck, ShoppingCart,
  Receipt, ClipboardList, ArrowRight
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import KpiCard from '../../components/common/KpiCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCards } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useRequests } from '../../hooks/useRequests';
import { useBatches } from '../../hooks/useBatches';
import { formatCurrencyCompact, formatCurrency } from '../../utils/formatCurrency';
import { formatDate, daysUntil } from '../../utils/formatDate';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { session } = useAuth();
  const { data: products, loading: productsLoading } = useProducts();
  const { data: inventory, loading: inventoryLoading } = useInventory();
  const { data: suppliers, loading: suppliersLoading } = useSuppliers();
  const { data: requests, loading: requestsLoading } = useRequests();
  const { data: batches, loading: batchesLoading } = useBatches();

  const loading = productsLoading || inventoryLoading || suppliersLoading || requestsLoading || batchesLoading;

  const metrics = useMemo(() => {
    const totalProducts = products.length;

    const inventoryValue = inventory.reduce((sum, row) => {
      const qty = Number(row.quantity) || 0;
      const price = Number(row.purchase_price ?? row.selling_price) || 0;
      return sum + qty * price;
    }, 0);

    const lowStock = inventory.filter((row) => {
      const qty = Number(row.quantity) || 0;
      const reorder = Number(row.reorder_level) || 0;
      return qty > 0 && qty <= reorder;
    });

    const outOfStock = inventory.filter((row) => (Number(row.quantity) || 0) <= 0);

    const expiringSoon = batches.filter((b) => {
      const d = daysUntil(b.expiry_date);
      return d !== null && d >= 0 && d <= 30;
    });

    const expired = batches.filter((b) => {
      const d = daysUntil(b.expiry_date);
      return d !== null && d < 0;
    });

    const pendingRequests = requests.filter((r) => r.status === 'PENDING_APPROVAL');

    const productCategoryById = {};
    products.forEach((p) => {
      productCategoryById[p.id] = p.category_name || 'Uncategorized';
    });

    const categoryMap = {};
    inventory.forEach((row) => {
      const cat = productCategoryById[row.product_id] || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + (Number(row.quantity) || 0);
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const lowStockChart = lowStock
      .slice(0, 8)
      .map((row) => ({ name: row.product_name || row.name || 'Item', quantity: Number(row.quantity) || 0 }));

    return {
      totalProducts,
      inventoryValue,
      lowStock,
      outOfStock,
      expiringSoon,
      expired,
      pendingRequests,
      categoryData,
      lowStockChart
    };
  }, [products, inventory, batches, requests]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session?.userName?.split(' ')[0] || 'there'}!`}
        description="Here's what's happening with your inventory today."
      />

      {loading ? (
        <SkeletonCards count={8} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}
        >
          <KpiCard icon={Package} title="Total Products" value={metrics.totalProducts} tone="primary" />
          <KpiCard
            icon={IndianRupee}
            title="Total Inventory Value"
            value={formatCurrencyCompact(metrics.inventoryValue)}
            tone="success"
          />
          <KpiCard icon={AlertTriangle} title="Low Stock Products" value={metrics.lowStock.length} tone="warning" />
          <KpiCard icon={CalendarClock} title="Expiring Products" value={metrics.expiringSoon.length} tone="danger" />
          <KpiCard icon={Truck} title="Total Suppliers" value={suppliers.length} tone="info" />
          <KpiCard icon={ShoppingCart} title="Today's Purchases" value="—" tone="primary" />
          <KpiCard icon={Receipt} title="Today's Sales" value="—" tone="success" />
          <KpiCard
            icon={ClipboardList}
            title="Pending Material Requests"
            value={metrics.pendingRequests.length}
            tone="warning"
          />
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
          gap: 16,
          marginBottom: 16
        }}
        className="dash-charts-row"
      >
        <Card>
          <SectionTitle title="Low Stock Products" />
          {metrics.lowStockChart.length === 0 ? (
            <EmptyState title="No low stock items" description="All products are above their reorder level." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metrics.lowStockChart} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted)" fontSize={11} />
                <YAxis dataKey="name" type="category" width={110} stroke="var(--muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <SectionTitle title="Stock by Category" />
          {metrics.categoryData.length === 0 ? (
            <EmptyState title="No inventory data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={metrics.categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {metrics.categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16
        }}
      >
        <Card>
          <SectionTitle title="Expiring Soon" action={<Link to="/batches" style={linkStyle}>View all <ArrowRight size={13} /></Link>} />
          {metrics.expiringSoon.length === 0 ? (
            <EmptyState title="Nothing expiring soon" description="No batches expire within 30 days." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {metrics.expiringSoon.slice(0, 5).map((b) => (
                <RowItem
                  key={b.id}
                  primary={b.product_name || b.batch_number}
                  secondary={`Batch ${b.batch_number}`}
                  right={<Badge tone="warning">{formatDate(b.expiry_date)}</Badge>}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Pending Requests" action={<Link to="/requests" style={linkStyle}>View all <ArrowRight size={13} /></Link>} />
          {metrics.pendingRequests.length === 0 ? (
            <EmptyState title="No pending requests" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {metrics.pendingRequests.slice(0, 5).map((r) => (
                <RowItem
                  key={r.id}
                  primary={r.project_name || 'Material request'}
                  secondary={formatDate(r.created_at || r.requested_date)}
                  right={<StatusBadge status={r.status} />}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Recent Purchases" />
          <EmptyState
            title="Not available yet"
            description="The backend has no GET endpoint for purchase history — see Backend Integration Notes."
          />
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-charts-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>{title}</h3>
      {action}
    </div>
  );
}

function RowItem({ primary, secondary, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {primary}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{secondary}</div>
      </div>
      {right}
    </div>
  );
}

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--primary)'
};

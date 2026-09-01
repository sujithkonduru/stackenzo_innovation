import { Link } from 'react-router-dom';
import { Boxes, ShoppingCart, Receipt, ArrowLeftRight, AlertTriangle, CalendarClock, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';

const REPORTS = [
  { to: '/reports/inventory', icon: Boxes, title: 'Inventory Report', description: 'Stock levels, value, and status across all locations.', available: true },
  { to: '/reports/low-stock', icon: AlertTriangle, title: 'Low Stock Report', description: 'Products at or below their reorder level.', available: true },
  { to: '/reports/expiry', icon: CalendarClock, title: 'Expiry Report', description: 'Batches that are expired or expiring soon.', available: true },
  { to: '/reports/purchases', icon: ShoppingCart, title: 'Purchase Reports', description: 'Spend by supplier, product, and time period.', available: false },
  { to: '/reports/sales', icon: Receipt, title: 'Sales Reports', description: 'Revenue, top products, and payment breakdowns.', available: false },
  { to: '/reports/stock-movements', icon: ArrowLeftRight, title: 'Stock Movement Reports', description: 'Every purchase, sale, issue, and return event.', available: false }
];

export default function Reports() {
  return (
    <div>
      <PageHeader title="Reports" description="Insights into your inventory, sales, and purchasing activity." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {REPORTS.map((r) => (
          <Link key={r.to} to={r.to} style={{ display: 'block' }}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <r.icon size={18} />
                </div>
                <ArrowRight size={16} style={{ color: 'var(--muted)' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4, color: 'var(--foreground)' }}>{r.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>{r.description}</div>
              {!r.available && (
                <div style={{ marginTop: 10, fontSize: 11.5, fontWeight: 700, color: 'var(--warning)' }}>Needs a backend endpoint</div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Card from './Card';

export default function KpiCard({ icon: Icon, title, value, trend, tone = 'primary', loading }) {
  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 108 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `var(--${tone}-soft)`,
            color: `var(--${tone})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {Icon && <Icon size={18} />}
        </div>
        {trend !== undefined && trend !== null && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 12,
              fontWeight: 700,
              color: trend >= 0 ? 'var(--success)' : 'var(--danger)'
            }}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>
          {title}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)' }}>
          {loading ? '—' : value}
        </div>
      </div>
    </Card>
  );
}

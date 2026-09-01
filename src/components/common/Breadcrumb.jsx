import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {item.to && !isLast ? (
              <Link to={item.to} style={{ color: 'var(--muted)' }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--foreground)' : 'var(--muted)', fontWeight: isLast ? 600 : 400 }}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={13} style={{ color: 'var(--muted-2)' }} />}
          </span>
        );
      })}
    </nav>
  );
}

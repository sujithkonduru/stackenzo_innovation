import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, onChange, totalItems, pageSize }) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        padding: '14px 4px 4px'
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>
        Showing <strong style={{ color: 'var(--foreground)' }}>{start}-{end}</strong> of{' '}
        <strong style={{ color: 'var(--foreground)' }}>{totalItems}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          style={navBtnStyle(page === 1)}
        >
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontSize: 13, color: 'var(--foreground)', padding: '0 8px' }}>
          Page {page} of {pageCount}
        </span>
        <button
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          aria-label="Next page"
          style={navBtnStyle(page === pageCount)}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function navBtnStyle(disabled) {
  return {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--foreground)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1
  };
}

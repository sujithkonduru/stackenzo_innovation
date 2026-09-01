import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { SkeletonTable } from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

/**
 * Reusable data table.
 * columns: [{ key, header, render?: (row) => node, sortable?: bool, width? }]
 * rowActions: (row) => node  (rendered in a trailing actions column)
 */
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  rowActions,
  pageSize = 10,
  getRowId = (row) => row.id
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <SkeletonTable cols={columns.length} />
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={11} style={{ opacity: 0.4 }} />
                      ))}
                  </span>
                </th>
              ))}
              {rowActions && (
                <th
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                    width: 60
                  }}
                >
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={getRowId(row)}
                style={{ transition: 'background 0.1s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '13px 14px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 13.5,
                      color: 'var(--foreground)',
                      verticalAlign: 'middle'
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {rowActions && (
                  <td style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)' }}>
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onChange={setPage}
        totalItems={sorted.length}
        pageSize={pageSize}
      />
    </div>
  );
}

export function RowActionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
  <button
    onClick={() => setOpen((o) => !o)}
    onBlur={() => setTimeout(() => setOpen(false), 150)}
    aria-label="Row actions"
    style={{
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      color: 'var(--muted)',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--surface-hover)';
      e.currentTarget.style.borderColor = 'var(--border-strong)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--surface)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    <MoreHorizontal size={15} />
  </button>
  
  {open && (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 4px)',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: 180,
        maxWidth: 220,
        zIndex: 40,
        overflow: 'hidden',
        padding: '4px 0'
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevents onBlur from firing before click
            item.onClick();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '10px 14px',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            color: item.danger ? 'var(--danger)' : 'var(--foreground)',
            transition: 'background 0.15s',
            borderRadius: '4px',
            margin: '1px 4px',
            width: 'calc(100% - 8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          {item.icon && (
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 16,
              height: 16,
              flexShrink: 0
            }}>
              <item.icon size={14} />
            </span>
          )}
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.shortcut && (
            <span style={{ 
              fontSize: 11, 
              color: 'var(--muted)',
              marginLeft: 'auto',
              paddingLeft: 12
            }}>
              {item.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  )}
</div>
  );
}

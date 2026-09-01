import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import FormField from './FormField';

/**
 * A searchable single-select dropdown for larger option lists
 * (products, batches, suppliers, locations, etc).
 * options: [{ value, label, sublabel? }]
 */
export default function SearchSelect({
  label,
  error,
  required,
  hint,
  options = [],
  value,
  onChange,
  placeholder = 'Search and select...',
  disabled = false,
  style
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      (o.sublabel || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <div ref={rootRef} style={{ position: 'relative' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          style={{
            width: '100%',
            height: 38,
            padding: '0 32px 0 12px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            background: disabled ? 'var(--background)' : 'var(--surface)',
            color: selected ? 'var(--foreground)' : 'var(--muted-2)',
            fontSize: 13.5,
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative'
          }}
        >
          {selected ? selected.label : placeholder}
          <ChevronDown
            size={15}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
          />
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: 280,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: 8, borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 18, top: 18, color: 'var(--muted-2)' }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search..."
                style={{
                  width: '100%',
                  height: 32,
                  padding: '0 10px 0 28px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: 13
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ position: 'absolute', right: 18, top: 18, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: 14, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                  No matches found
                </div>
              )}
              {filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery('');
                  }}
                  style={{
                    padding: '9px 12px',
                    cursor: 'pointer',
                    background: opt.value === value ? 'var(--primary-soft)' : 'transparent',
                    fontSize: 13.5
                  }}
                  onMouseEnter={(e) => {
                    if (opt.value !== value) e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ color: 'var(--foreground)', fontWeight: 500 }}>{opt.label}</div>
                  {opt.sublabel && (
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{opt.sublabel}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}

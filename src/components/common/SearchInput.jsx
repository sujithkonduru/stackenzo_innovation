import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', style }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        ...style
      }}
    >
      <Search
        size={16}
        style={{ position: 'absolute', left: 12, color: 'var(--muted-2)', pointerEvents: 'none' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: '100%',
          height: 38,
          paddingLeft: 36,
          paddingRight: value ? 32 : 12,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-strong)',
          background: 'var(--surface)',
          color: 'var(--foreground)',
          fontSize: 13.5
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            display: 'flex'
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

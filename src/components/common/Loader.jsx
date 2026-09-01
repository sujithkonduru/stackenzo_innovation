export function Skeleton({ width = '100%', height = 14, radius = 6, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--border) 25%, var(--surface-hover) 37%, var(--border) 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shine 1.4s ease infinite',
        ...style
      }}
    />
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} width={c === 0 ? '20%' : `${80 / (cols - 1)}%`} height={16} />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes skeleton-shine {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            background: 'var(--card)'
          }}
        >
          <Skeleton width={40} height={40} radius={10} style={{ marginBottom: 14 }} />
          <Skeleton width="60%" height={12} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={20} />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh'
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          animation: 'page-spin 0.7s linear infinite'
        }}
      />
      <style>{`
        @keyframes page-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

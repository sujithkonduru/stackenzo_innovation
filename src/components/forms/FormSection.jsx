export default function FormSection({ title, description, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
            {title}
          </h3>
          {description && (
            <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0 0' }}>{description}</p>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

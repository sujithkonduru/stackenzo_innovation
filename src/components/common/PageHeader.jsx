export default function PageHeader({ title, description, actions, breadcrumb }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 22
      }}
    >
      <div>
        {breadcrumb && <div style={{ marginBottom: 8 }}>{breadcrumb}</div>}
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>{title}</h1>
        {description && (
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

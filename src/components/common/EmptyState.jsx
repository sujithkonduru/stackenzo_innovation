import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description,
  action
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        color: 'var(--muted)'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--primary-soft)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}
      >
        <Icon size={26} />
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13.5, maxWidth: 360, marginBottom: action ? 18 : 0, lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {action}
    </div>
  );
}

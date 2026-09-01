const TONES = {
  neutral: { bg: 'var(--border)', fg: 'var(--muted)' },
  success: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
  danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  info: { bg: 'var(--info-soft)', fg: 'var(--info)' },
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary)' }
};

export default function Badge({ children, tone = 'neutral', dot = false, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 999,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: t.fg,
            flexShrink: 0
          }}
        />
      )}
      {children}
    </span>
  );
}

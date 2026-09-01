import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--foreground)',
    border: '1px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--foreground)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: '1px solid transparent'
  },
  dangerGhost: {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
    border: '1px solid transparent'
  }
};

const SIZES = {
  sm: { padding: '6px 12px', fontSize: 13, gap: 6, height: 32 },
  md: { padding: '9px 16px', fontSize: 14, gap: 7, height: 38 },
  lg: { padding: '11px 20px', fontSize: 15, gap: 8, height: 44 }
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        height: s.height,
        fontSize: s.fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'filter 0.12s ease, transform 0.05s ease',
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...v,
        ...style
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={s.fontSize + 2} className="spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={s.fontSize + 2} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={s.fontSize + 2} />}
      <style>{`
        .spin { animation: spin 0.7s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}

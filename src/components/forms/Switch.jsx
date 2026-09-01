export default function Switch({ label, checked, onChange, disabled }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <span
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? 'var(--primary)' : 'var(--border-strong)',
          position: 'relative',
          transition: 'background 0.15s ease',
          flexShrink: 0
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.15s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />
      </span>
      {label && <span style={{ fontSize: 13.5, color: 'var(--foreground)' }}>{label}</span>}
    </label>
  );
}

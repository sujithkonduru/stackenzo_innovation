export default function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13.5,
        color: 'var(--foreground)',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
      />
      {label}
    </label>
  );
}

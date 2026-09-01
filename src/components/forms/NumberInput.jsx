import FormField from './FormField';

export default function NumberInput({ label, error, required, hint, style, prefix, ...rest }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              fontSize: 13.5,
              pointerEvents: 'none'
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          {...rest}
          style={{
            height: 38,
            padding: prefix ? '0 12px 0 26px' : '0 12px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            background: rest.disabled ? 'var(--background)' : 'var(--surface)',
            color: 'var(--foreground)',
            fontSize: 13.5,
            width: '100%'
          }}
        />
      </div>
    </FormField>
  );
}

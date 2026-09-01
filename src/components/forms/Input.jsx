import FormField from './FormField';

export default function Input({ label, error, required, hint, style, inputStyle, ...rest }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <input
        {...rest}
        style={{
          height: 38,
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
          background: rest.disabled ? 'var(--background)' : 'var(--surface)',
          color: 'var(--foreground)',
          fontSize: 13.5,
          width: '100%',
          ...inputStyle
        }}
      />
    </FormField>
  );
}

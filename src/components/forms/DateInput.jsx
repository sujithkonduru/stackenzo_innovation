import FormField from './FormField';

export default function DateInput({ label, error, required, hint, style, ...rest }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <input
        type="date"
        {...rest}
        style={{
          height: 38,
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
          background: rest.disabled ? 'var(--background)' : 'var(--surface)',
          color: 'var(--foreground)',
          fontSize: 13.5,
          width: '100%'
        }}
      />
    </FormField>
  );
}

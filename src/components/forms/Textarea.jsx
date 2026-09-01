import FormField from './FormField';

export default function Textarea({ label, error, required, hint, rows = 3, style, ...rest }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <textarea
        rows={rows}
        {...rest}
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
          background: 'var(--surface)',
          color: 'var(--foreground)',
          fontSize: 13.5,
          width: '100%',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
      />
    </FormField>
  );
}

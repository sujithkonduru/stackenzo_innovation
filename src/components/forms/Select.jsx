import { ChevronDown } from 'lucide-react';
import FormField from './FormField';

export default function Select({
  label,
  error,
  required,
  hint,
  style,
  options = [],
  placeholder = 'Select...',
  ...rest
}) {
  return (
    <FormField label={label} error={error} required={required} hint={hint} style={style}>
      <div style={{ position: 'relative' }}>
        <select
          {...rest}
          style={{
            height: 38,
            padding: '0 32px 0 12px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            background: rest.disabled ? 'var(--background)' : 'var(--surface)',
            color: 'var(--foreground)',
            fontSize: 13.5,
            width: '100%',
            appearance: 'none',
            cursor: rest.disabled ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none'
          }}
        />
      </div>
    </FormField>
  );
}

export default function Card({ children, style, padding = 20, hoverable = false, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

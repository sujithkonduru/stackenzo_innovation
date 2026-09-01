export default function FormActions({ children, align = 'right' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 10,
        paddingTop: 16,
        borderTop: '1px solid var(--border)',
        marginTop: 8
      }}
    >
      {children}
    </div>
  );
}

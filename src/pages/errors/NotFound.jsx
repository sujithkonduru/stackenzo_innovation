import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
        background: 'var(--background)'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--primary-soft)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <CompassIcon size={32} />
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: '10px 0 6px', color: 'var(--foreground)' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, maxWidth: 380 }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

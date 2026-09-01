import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Unauthorized() {
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
          background: 'var(--danger-soft)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}
      >
        <ShieldAlert size={32} />
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)' }}>403</div>
      <h1 style={{ fontSize: 18, fontWeight: 700, margin: '10px 0 6px', color: 'var(--foreground)' }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, maxWidth: 380 }}>
        You don't have permission to access this page.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

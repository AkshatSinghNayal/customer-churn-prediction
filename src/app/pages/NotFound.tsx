import { Link } from 'react-router';
import { TrendingUp } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--cs-surface)' }}>
      <div style={{ fontSize: '120px', fontWeight: 900, color: 'var(--accent-primary)', opacity: 0.12, lineHeight: 1 }}>404</div>
      <TrendingUp size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px', marginTop: '-20px' }} />
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cs-ink)', marginBottom: '8px' }}>Page not found</h1>
      <p style={{ color: 'var(--cs-ink-muted)', fontSize: '15px', marginBottom: '28px', maxWidth: '400px', lineHeight: 1.6 }}>
        We couldn't find what you were looking for. It may have moved or doesn't exist.
      </p>
      <div className="flex gap-3">
        <Link to="/app/dashboard" className="px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent-primary)', color: '#fff' }}>
          Go to Dashboard
        </Link>
        <Link to="/" className="px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)' }}>
          Home
        </Link>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TrendingUp, Eye, EyeOff, Check } from 'lucide-react';
import { AppearanceSwitcher } from '../../components/AppearanceSwitcher';
import { AccentSwitcher } from '../../components/AccentSwitcher';
import { useTheme } from '../../context/ThemeContext';

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  const inputStyle = {
    background: 'var(--accent-glass)',
    border: '1px solid var(--cs-border)',
    color: 'var(--cs-ink)',
    fontSize: '14px',
  };

  const benefits = ['14-day free trial, no credit card', 'Unlimited predictions during trial', 'Onboarding support included', 'Cancel anytime'];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cs-surface)' }}>
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[45%] relative overflow-hidden"
        style={{ background: isDark ? `linear-gradient(135deg, var(--accent-deep), var(--cs-surface))` : `linear-gradient(135deg, var(--accent-primary), var(--accent-light))` }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden"
          style={{ fontSize: '200px', fontWeight: 900, color: '#fff', opacity: isDark ? 0.10 : 0.07 }}
        >
          CS
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>ChurnSight</span>
        </div>
        <div className="relative space-y-4">
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '20px' }}>
            Start reducing churn<br />in minutes
          </h2>
          {benefits.map(b => (
            <div key={b} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Check size={12} color="#fff" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end gap-3 p-4">
          <AppearanceSwitcher />
          <AccentSwitcher />
          <Link to="/auth/login" style={{ fontSize: '14px', color: 'var(--cs-ink-muted)' }} className="hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cs-ink)' }}>Create your account</h1>
              <p style={{ color: 'var(--cs-ink-muted)', fontSize: '15px', marginTop: '4px' }}>Free for 14 days — no credit card required</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Smith' },
                { key: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com' },
                { key: 'company', label: 'Company name', type: 'text', placeholder: 'Acme Corp' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent-primary)'; }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--cs-border)'; }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 pr-10 outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent-primary)'; }}
                    onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--cs-border)'; }}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-ink-muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '15px' }}
              >
                Create account
              </button>
            </form>
            <p className="text-center mt-6" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>
              Already have an account?{' '}
              <Link to="/auth/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

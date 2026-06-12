import { Link } from 'react-router';
import { TrendingUp, BarChart3, Brain, Bell, Shield, Zap, ArrowRight, Check } from 'lucide-react';
import { AppearanceSwitcher } from '../components/AppearanceSwitcher';
import { AccentSwitcher } from '../components/AccentSwitcher';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Predictions', desc: 'Machine learning models trained on customer attributes predict churn with high accuracy.' },
  { icon: BarChart3, title: 'Churn Analytics', desc: 'Breakdowns by contract type, internet service, payment method, and tenure.' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Real-time notifications when customers are flagged as high-risk.' },
  { icon: Shield, title: 'Risk Scoring', desc: 'Every customer gets a dynamic risk score based on their account attributes.' },
  { icon: Zap, title: 'Feature Importance', desc: 'Understand the top drivers of churn — contract type, tenure, and monthly charges.' },
  { icon: TrendingUp, title: 'Model Comparison', desc: 'Compare Logistic Regression, Random Forest, and XGBoost side by side.' },
];

const PLANS = [
  { name: 'Starter', price: '$49', period: '/mo', features: ['Up to 1,000 customers', 'Basic churn scoring', '7-day predictions', 'Email alerts'], cta: 'Get started', highlight: false },
  { name: 'Growth', price: '$149', period: '/mo', features: ['Up to 10,000 customers', 'Advanced ML models', '30-day predictions', 'Slack & email alerts', 'Segment analysis'], cta: 'Start free trial', highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited customers', 'Custom model training', 'API access', 'Dedicated CSM', 'SSO & compliance'], cta: 'Contact sales', highlight: false },
];

export function Landing() {
  const { resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';

  return (
    <div style={{ background: 'var(--cs-surface)', color: 'var(--cs-ink)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-6"
        style={{
          background: isDark ? 'rgba(18,18,18,0.85)' : 'rgba(247,250,250,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--cs-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
            <TrendingUp size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700 }}>
            Churn<span style={{ color: 'var(--accent-primary)' }}>Sight</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 flex-1 ml-8">
          {['Features', 'Pricing', 'About'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: '14px', color: 'var(--cs-ink-muted)' }} className="hover:opacity-80 transition-opacity">{l}</a>
          ))}
        </div>
        <div className="flex-1 md:flex-none" />
        <AppearanceSwitcher />
        <AccentSwitcher />
        <Link to="/auth/login" style={{ fontSize: '14px', color: 'var(--cs-ink-muted)' }} className="hover:opacity-80 transition-opacity">Login</Link>
        <Link
          to="/auth/register"
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent-primary)', color: '#fff' }}
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent-glass), transparent)`,
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ fontSize: 'clamp(80px, 20vw, 220px)', fontWeight: 900, color: 'var(--accent-primary)', opacity: 0.07 }}
        >
          CHURN
        </div>
        <span
          className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
          style={{ background: 'var(--accent-glass)', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600 }}
        >
          <Zap size={12} /> ML-Powered Churn Classification
        </span>
        <h1
          className="relative max-w-3xl mb-6"
          style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px' }}
        >
          Predict Customer Churn<br />
          <span style={{ color: 'var(--accent-primary)' }}>With Machine Learning</span>
        </h1>
        <p className="relative max-w-xl mb-8" style={{ fontSize: '18px', color: 'var(--cs-ink-muted)', lineHeight: 1.6 }}>
          ChurnSight uses Logistic Regression, Random Forest, and XGBoost to predict which customers are at risk of churning based on their account attributes.
        </p>
        <div className="relative flex items-center gap-4">
          <Link
            to="/auth/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '16px' }}
          >
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <Link
            to="/app/dashboard"
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontSize: '16px' }}
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '36px', fontWeight: 800 }}>Everything you need to<br /><span style={{ color: 'var(--accent-primary)' }}>predict churn</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-glass)' }}>
                  <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '36px', fontWeight: 800 }}>Simple, transparent <span style={{ color: 'var(--accent-primary)' }}>pricing</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, features, cta, highlight }) => (
              <div
                key={name}
                className="p-8 rounded-2xl flex flex-col"
                style={{
                  background: highlight ? 'var(--accent-primary)' : 'var(--cs-card)',
                  border: highlight ? 'none' : '1px solid var(--cs-border)',
                  boxShadow: highlight ? '0 8px 40px var(--accent-glass)' : '0 4px 24px var(--accent-glass)',
                  color: highlight ? '#fff' : 'var(--cs-ink)',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, opacity: highlight ? 0.8 : 1, color: highlight ? '#fff' : 'var(--accent-primary)' }}>{name}</div>
                <div className="mt-3 mb-6 flex items-end gap-1">
                  <span style={{ fontSize: '40px', fontWeight: 800 }}>{price}</span>
                  <span style={{ fontSize: '14px', opacity: 0.7, marginBottom: '6px' }}>{period}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2" style={{ fontSize: '14px' }}>
                      <Check size={16} style={{ color: highlight ? '#fff' : 'var(--green-safe)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/register"
                  className="text-center py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: highlight ? '#fff' : 'var(--accent-primary)',
                    color: highlight ? 'var(--accent-primary)' : '#fff',
                    fontSize: '15px',
                  }}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div
          className="max-w-2xl mx-auto p-12 rounded-3xl"
          style={{ background: `linear-gradient(135deg, var(--accent-primary), var(--accent-deep))` }}
        >
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Ready to predict churn?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '28px', fontSize: '16px' }}>Start with our free trial and see how ML can help reduce churn.</p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#fff', color: 'var(--accent-primary)', fontSize: '16px' }}
          >
            Start Free Trial <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--cs-border)', color: 'var(--cs-ink-muted)', fontSize: '14px' }}>
        © 2026 ChurnSight · All rights reserved
      </footer>
    </div>
  );
}

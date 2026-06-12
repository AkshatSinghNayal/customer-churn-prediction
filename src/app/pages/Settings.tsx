import { useState } from 'react';
import { Save, Bell, Shield, Plug, Mail, Slack, Webhook } from 'lucide-react';
import { AppearanceSwitcher } from '../components/AppearanceSwitcher';
import { AccentSwitcher } from '../components/AccentSwitcher';
import { useTheme, ACCENT_THEMES } from '../context/ThemeContext';

const TABS = ['General', 'Notifications', 'Integrations', 'Security', 'Theme'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
      <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--cs-ink)', borderBottom: '1px solid var(--cs-border)', paddingBottom: '12px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--cs-ink)' }}>{label}</div>
        {hint && <div style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
      style={{ background: checked ? 'var(--accent-primary)' : 'var(--cs-border)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export function Settings() {
  const [tab, setTab] = useState('General');
  const [saved, setSaved] = useState(false);
  const { accentTheme, appearance, resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';

  const [notifs, setNotifs] = useState({
    criticalAlerts: true,
    weeklyReport: true,
    modelUpdates: false,
    emailDigest: true,
    slackAlerts: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: true,
    auditLog: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    background: 'var(--accent-glass)',
    border: '1px solid var(--cs-border)',
    color: 'var(--cs-ink)',
    fontSize: '14px',
    padding: '8px 12px',
    borderRadius: '10px',
    outline: 'none',
    width: '240px',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Settings</h1>
          <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Manage your ChurnSight preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
          style={{ background: saved ? 'var(--green-safe)' : 'var(--accent-primary)', color: '#fff', fontSize: '14px' }}
        >
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? 'var(--accent-primary)' : 'var(--cs-card)',
              color: tab === t ? '#fff' : 'var(--cs-ink-muted)',
              border: `1px solid ${tab === t ? 'transparent' : 'var(--cs-border)'}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <Section title="Organization Details">
          <Field label="Company Name" hint="Shown in reports and exports">
            <input defaultValue="Acme Corp" style={inputStyle} />
          </Field>
          <Field label="Industry" hint="Used to benchmark against industry averages">
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>SaaS</option>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>E-commerce</option>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Fintech</option>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Healthcare</option>
            </select>
          </Field>
          <Field label="Fiscal Year Start">
            <select style={{ ...inputStyle, cursor: 'pointer' }}>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>January</option>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>April</option>
              <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>July</option>
            </select>
          </Field>
          <Field label="Risk Threshold (High)" hint="Score above which customers are flagged as high-risk">
            <input type="number" defaultValue="70" style={{ ...inputStyle, width: '80px' }} />
          </Field>
        </Section>
      )}

      {tab === 'Notifications' && (
        <Section title="Notification Preferences">
          {[
            { key: 'criticalAlerts', label: 'Critical Churn Alerts', hint: 'Get notified when a customer reaches critical risk' },
            { key: 'weeklyReport', label: 'Weekly Summary Report', hint: 'Email digest every Monday at 9am' },
            { key: 'modelUpdates', label: 'Model Retrain Alerts', hint: 'Notify when ML models are retrained' },
            { key: 'emailDigest', label: 'Daily Email Digest', hint: 'Summary of all alerts from the past 24h' },
            { key: 'slackAlerts', label: 'Slack Alerts', hint: 'Send alerts to your Slack workspace' },
          ].map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <Toggle
                checked={notifs[key as keyof typeof notifs]}
                onChange={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
              />
            </Field>
          ))}
        </Section>
      )}

      {tab === 'Integrations' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: Mail, name: 'SendGrid', status: 'connected', desc: 'Send win-back email campaigns automatically' },
            { icon: Slack, name: 'Slack', status: 'disconnected', desc: 'Post churn alerts to your Slack channels' },
            { icon: Webhook, name: 'Webhook', status: 'connected', desc: 'Custom webhook for your internal tools' },
            { icon: Plug, name: 'Salesforce', status: 'disconnected', desc: 'Sync churn scores to CRM opportunities' },
          ].map(({ icon: Icon, name, status, desc }) => (
            <div key={name} className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glass)' }}>
                    <Icon size={20} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--cs-ink)' }}>{name}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: status === 'connected' ? 'rgba(102,187,106,0.15)' : 'var(--accent-glass)', color: status === 'connected' ? 'var(--green-safe)' : 'var(--cs-ink-muted)' }}
                >
                  {status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginBottom: '12px' }}>{desc}</p>
              <button
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: status === 'connected' ? 'rgba(239,83,80,0.12)' : 'var(--accent-primary)', color: status === 'connected' ? 'var(--coral-churn)' : '#fff' }}
              >
                {status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Security' && (
        <Section title="Security Settings">
          {[
            { key: 'twoFactor', label: 'Two-Factor Authentication', hint: 'Require 2FA for all team members' },
            { key: 'sessionTimeout', label: 'Auto Session Timeout', hint: 'Sign out after 30 minutes of inactivity' },
            { key: 'auditLog', label: 'Audit Logging', hint: 'Log all user actions for compliance' },
          ].map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <Toggle
                checked={security[key as keyof typeof security]}
                onChange={() => setSecurity(s => ({ ...s, [key]: !s[key as keyof typeof security] }))}
              />
            </Field>
          ))}
        </Section>
      )}

      {tab === 'Theme' && (
        <Section title="Appearance & Theme">
          <Field label="Appearance Mode" hint="Light, Dark, or follow your system setting">
            <AppearanceSwitcher />
          </Field>
          <Field label="Accent Color" hint="Change the brand color used throughout the app">
            <AccentSwitcher />
          </Field>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)', marginBottom: '12px' }}>Current Theme</p>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--accent-glass)' }}>
              <div className="w-8 h-8 rounded-full" style={{ background: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--cs-ink)', fontSize: '14px' }}>{ACCENT_THEMES[accentTheme].name}</div>
                <div style={{ fontSize: '12px', color: 'var(--cs-ink-muted)' }}>{appearance.charAt(0).toUpperCase() + appearance.slice(1)} mode</div>
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

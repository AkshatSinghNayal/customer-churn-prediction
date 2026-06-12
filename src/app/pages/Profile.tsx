import { useState } from 'react';
import { User, Mail, Building, Shield, Camera, Save } from 'lucide-react';

const ACTIVITY = [
  { action: 'Viewed Acme Corporation churn prediction', time: '10 min ago' },
  { action: 'Marked 3 alerts as read', time: '2 hours ago' },
  { action: 'Exported customer risk report', time: '5 hours ago' },
  { action: 'Updated risk threshold to 70', time: '1 day ago' },
  { action: 'Connected SendGrid integration', time: '2 days ago' },
];

export function Profile() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'John Doe',
    email: 'john.doe@acmecorp.com',
    company: 'Acme Corporation',
    role: 'Head of Customer Success',
    timezone: 'UTC-5 (EST)',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--accent-glass)',
    border: '1px solid var(--cs-border)',
    color: 'var(--cs-ink)',
    fontSize: '14px',
    padding: '10px 14px',
    borderRadius: '12px',
    outline: 'none',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Profile</h1>
        <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Manage your personal information and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="p-6 rounded-2xl flex items-center gap-6" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-primary)', fontSize: '28px', fontWeight: 800, color: '#fff' }}
          >
            JD
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-primary)', color: '#fff' }}
          >
            <Camera size={14} />
          </button>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--cs-ink)' }}>{form.name}</div>
          <div style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>{form.role}</div>
          <div style={{ fontSize: '13px', color: 'var(--accent-primary)', marginTop: '4px' }}>{form.company}</div>
        </div>
        <div className="ml-auto">
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(102,187,106,0.15)', color: 'var(--green-safe)' }}
          >
            Active
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--cs-ink)', borderBottom: '1px solid var(--cs-border)', paddingBottom: '12px' }}>Personal Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', icon: User },
            { key: 'email', label: 'Email Address', icon: Mail },
            { key: 'company', label: 'Company', icon: Building },
            { key: 'role', label: 'Role', icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-ink-muted)' }} />
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent-primary)'; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--cs-border)'; }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timezone</label>
          <select
            value={form.timezone}
            onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC-8 (PST)</option>
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC-7 (MST)</option>
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC-6 (CST)</option>
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC-5 (EST)</option>
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC+0 (GMT)</option>
            <option style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>UTC+1 (CET)</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
            style={{ background: saved ? 'var(--green-safe)' : 'var(--accent-primary)', color: '#fff', fontSize: '14px' }}
          >
            <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Activity log */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--cs-ink)', marginBottom: '16px' }}>Recent Activity</h3>
        <div className="space-y-3">
          {ACTIVITY.map(({ action, time }, i) => (
            <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--cs-border)' : 'none' }}>
              <span style={{ fontSize: '14px', color: 'var(--cs-ink)' }}>{action}</span>
              <span style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', flexShrink: 0, marginLeft: '12px' }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

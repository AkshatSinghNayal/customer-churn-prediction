import { useState, useEffect, useCallback } from 'react';
import { BellOff, CheckCheck, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { api } from '../services/api';
import type { Alert } from '../types';

const severityConfig: Record<string, { icon: React.ComponentType<{ size?: number }>, color: string, bg: string, label: string }> = {
  critical: { icon: AlertCircle, color: 'var(--coral-churn)', bg: 'rgba(239,83,80,0.12)', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'var(--amber-watch)', bg: 'rgba(255,167,38,0.12)', label: 'Warning' },
  info: { icon: Info, color: 'var(--accent-primary)', bg: 'var(--accent-glass)', label: 'Info' },
};

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = useCallback(() => {
    const params: Record<string, boolean | string> = {};
    if (filter === 'unread') params.read = false;
    else if (filter !== 'all') params.severity = filter;
    api.getAlerts(params).then(setAlerts);
  }, [filter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = filter === 'all' ? alerts : filter === 'unread'
    ? alerts.filter(a => !a.read)
    : alerts.filter(a => a.severity === filter);

  const markRead = async (id: string) => {
    await api.updateAlert(id, { read: true });
    fetchAlerts();
  };

  const markAllRead = async () => {
    for (const a of alerts.filter(a => !a.read)) {
      await api.updateAlert(a.id, { read: true });
    }
    fetchAlerts();
  };

  const dismiss = async (id: string) => {
    await api.updateAlert(id, { dismissed: true });
    fetchAlerts();
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const summaryCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Alerts</h1>
          <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent-glass)', color: 'var(--accent-primary)' }}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: summaryCounts.critical, color: 'var(--coral-churn)', bg: 'rgba(239,83,80,0.12)' },
          { label: 'Warnings', count: summaryCounts.warning, color: 'var(--amber-watch)', bg: 'rgba(255,167,38,0.12)' },
          { label: 'Info', count: summaryCounts.info, color: 'var(--accent-primary)', bg: 'var(--accent-glass)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color }}>{count}</div>
            <div style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'unread', 'critical', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: filter === f ? 'var(--accent-primary)' : 'var(--cs-card)',
              color: filter === f ? '#fff' : 'var(--cs-ink-muted)',
              border: `1px solid ${filter === f ? 'transparent' : 'var(--cs-border)'}`,
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16" style={{ color: 'var(--cs-ink-muted)' }}>
            <BellOff size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px' }}>No alerts in this category</p>
          </div>
        ) : (
          filtered.map(alert => {
            const sevConfig = severityConfig[alert.severity] || severityConfig.info;
            const { icon: Icon, color, bg } = sevConfig;
            const timeAgo = getTimeAgo(alert.created_at);
            return (
              <div
                key={alert.id}
                className="p-5 rounded-2xl flex gap-4"
                style={{
                  background: 'var(--cs-card)',
                  border: `1px solid ${!alert.read ? color + '44' : 'var(--cs-border)'}`,
                  boxShadow: !alert.read ? `0 2px 12px ${color}22` : 'none',
                  opacity: alert.read ? 0.75 : 1,
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--cs-ink)' }}>{alert.title}</span>
                      {!alert.read && (
                        <span className="ml-2 w-2 h-2 rounded-full inline-block" style={{ background: color, verticalAlign: 'middle' }} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: '12px', color: 'var(--cs-ink-muted)' }}>{timeAgo}</span>
                      {!alert.read && (
                        <button onClick={() => markRead(alert.id)} title="Mark read" style={{ color: 'var(--cs-ink-muted)' }}>
                          <CheckCheck size={15} />
                        </button>
                      )}
                      <button onClick={() => dismiss(alert.id)} title="Dismiss" style={{ color: 'var(--cs-ink-muted)' }}>
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginTop: '4px', lineHeight: 1.5 }}>{alert.message}</p>
                  <span
                    className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: bg, color }}
                  >
                    {alert.customer_id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

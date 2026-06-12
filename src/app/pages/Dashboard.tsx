import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Users, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { SummaryStats, CustomerResponse } from '../types';

function RiskPill({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    High: 'var(--coral-churn)',
    Medium: 'var(--amber-watch)',
    Low: 'var(--green-safe)',
  };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${colors[risk] || colors.Low}22`, color: colors[risk] || colors.Low }}
    >
      {risk}
    </span>
  );
}

function KPICard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string; value: string; color: string;
}) {
  return (
    <div
      className="p-6 rounded-2xl flex flex-col gap-3"
      style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--cs-ink)' }}>{value}</div>
        <div style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,31,28,0.06)';
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,31,28,0.4)';

  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState<CustomerResponse['customers']>([]);

  useEffect(() => {
    api.getSummary().then(setSummary);
    api.getCustomers({ per_page: 5, risk_band: 'High', sort_by: 'probability' }).then(setHighRiskCustomers as any);
  }, []);

  if (!summary) {
    return <div className="space-y-6"><p style={{ color: 'var(--cs-ink-muted)' }}>Loading...</p></div>;
  }

  const riskPieData = [
    { name: 'Low Risk', value: summary.low_risk, color: '#66BB6A' },
    { name: 'Medium Risk', value: summary.medium_risk, color: '#FFA726' },
    { name: 'High Risk', value: summary.high_risk, color: '#EF5350' },
  ];

  const riskHistogram = [
    { range: 'Low', count: summary.low_risk },
    { range: 'Medium', count: summary.medium_risk },
    { range: 'High', count: summary.high_risk },
  ];

  const highRiskList = Array.isArray(highRiskCustomers) ? highRiskCustomers : (highRiskCustomers as any)?.customers || [];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{ background: isDark ? `linear-gradient(135deg, var(--accent-deep), var(--cs-card))` : `linear-gradient(135deg, var(--accent-primary), var(--accent-deep))` }}
      >
        <div
          className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden"
          style={{ fontSize: 'clamp(80px, 12vw, 160px)', fontWeight: 900, color: 'var(--accent-primary)', opacity: isDark ? 0.10 : 0.07 }}
        >
          {summary.churn_rate.toFixed(1)}%
        </div>
        <div className="relative">
          <p style={{ color: isDark ? 'var(--cs-ink-muted)' : 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>OVERALL CHURN RATE</p>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: isDark ? 'var(--cs-ink)' : '#fff', marginBottom: '8px' }}>
            {summary.churn_rate.toFixed(1)}% Churn Rate
          </h1>
          <p style={{ color: isDark ? 'var(--cs-ink-muted)' : 'rgba(255,255,255,0.8)', fontSize: '15px' }}>
            {summary.churned} of {summary.total_customers} customers have churned.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total Customers" value={summary.total_customers.toLocaleString()} color="var(--accent-primary)" />
        <KPICard icon={TrendingDown} label="Churned" value={summary.churned.toLocaleString()} color="var(--coral-churn)" />
        <KPICard icon={AlertTriangle} label="High Risk" value={summary.high_risk.toLocaleString()} color="var(--amber-watch)" />
        <KPICard icon={Activity} label="Avg Monthly Charge" value={`$${summary.avg_monthly_charges}`} color="var(--accent-primary)" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Risk distribution */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '4px' }}>Risk Distribution</h3>
          <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginBottom: '16px' }}>Customers by risk tier</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {riskPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', borderRadius: '12px', color: 'var(--cs-ink)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {riskPieData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>{name}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk score histogram */}
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)' }}>Risk Band Distribution</h3>
              <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>Number of customers per risk band</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskHistogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', borderRadius: '12px', color: 'var(--cs-ink)' }}
              />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent at-risk customers */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--cs-border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)' }}>High-Risk Customers</h3>
          <Link to="/app/customers" style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cs-border)' }}>
                {['Customer ID', 'Tenure', 'Contract', 'Monthly Charges', 'Risk Score', 'Risk Level'].map(h => (
                  <th key={h} className="px-6 py-3 text-left" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {highRiskList.map((c, i) => (
                <tr
                  key={c.customerID}
                  style={{ borderBottom: '1px solid var(--cs-border)', background: i % 2 === 0 ? 'transparent' : 'var(--accent-glass)' }}
                >
                  <td className="px-6 py-4">
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cs-ink)' }}>{c.customerID}</div>
                  </td>
                  <td className="px-6 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>{c.tenure} months</td>
                  <td className="px-6 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>{c.Contract}</td>
                  <td className="px-6 py-4" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>${c.MonthlyCharges}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: 'var(--cs-border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round(c.churn_probability * 100)}%`,
                            background: c.risk_band === 'High' ? 'var(--coral-churn)' : c.risk_band === 'Medium' ? 'var(--amber-watch)' : 'var(--green-safe)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>{Math.round(c.churn_probability * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><RiskPill risk={c.risk_band} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

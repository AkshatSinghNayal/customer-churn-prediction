import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { AnalyticsData, ChurnBreakdown } from '../types';

function ChurnBarChart({ data, dataKey, nameKey, title, desc }: {
  data: ChurnBreakdown[];
  dataKey: string;
  nameKey: string;
  title: string;
  desc: string;
}) {
  const { resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,31,28,0.06)';
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,31,28,0.4)';

  return (
    <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
      <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '4px' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginBottom: '16px' }}>{desc}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey={nameKey} tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', borderRadius: '12px', color: 'var(--cs-ink)' }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Churn Rate']}
          />
          <Bar dataKey={dataKey} fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1">
        {data.map((d) => (
          <div key={String(d[nameKey])} className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--cs-ink-muted)' }}>{d[nameKey]}</span>
            <div className="flex gap-4">
              <span style={{ color: 'var(--cs-ink)' }}>{d.churned} churned</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{Number(d.rate).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) {
    return <div className="space-y-6"><p style={{ color: 'var(--cs-ink-muted)' }}>Loading...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Analytics</h1>
        <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Churn breakdown by customer attributes</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChurnBarChart
          data={analytics.by_contract}
          dataKey="rate"
          nameKey="Contract"
          title="Churn by Contract Type"
          desc="Churn rate by contract type"
        />
        <ChurnBarChart
          data={analytics.by_internet_service}
          dataKey="rate"
          nameKey="InternetService"
          title="Churn by Internet Service"
          desc="Churn rate by internet service type"
        />
        <ChurnBarChart
          data={analytics.by_payment_method}
          dataKey="rate"
          nameKey="PaymentMethod"
          title="Churn by Payment Method"
          desc="Churn rate by payment method"
        />
        <ChurnBarChart
          data={analytics.by_senior_citizen}
          dataKey="rate"
          nameKey="SeniorCitizen"
          title="Churn by Senior Citizen Status"
          desc="Churn rate for senior vs non-senior customers"
        />
        <ChurnBarChart
          data={analytics.by_tenure_bucket}
          dataKey="rate"
          nameKey="tenure_bucket"
          title="Churn by Tenure Bucket"
          desc="Churn rate by customer tenure range"
        />
        <ChurnBarChart
          data={analytics.by_monthly_charge_band}
          dataKey="rate"
          nameKey="monthly_charge_band"
          title="Churn by Monthly Charge Band"
          desc="Churn rate by monthly charge range"
        />
      </div>
    </div>
  );
}

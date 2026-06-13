import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import type { Customer } from '../types';

function RiskPill({ risk }: { risk: string }) {
  const colors: Record<string, string> = { High: 'var(--coral-churn)', Medium: 'var(--amber-watch)', Low: 'var(--green-safe)' };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${colors[risk] || colors.Low}22`, color: colors[risk] || colors.Low }}>
      {risk}
    </span>
  );
}

export function Customers() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [data, setData] = useState<{ customers: Customer[]; total: number; total_pages: number } | null>(null);

  const [search, setSearch] = useState('');
  const [churnFilter, setChurnFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [internetFilter, setInternetFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [tenureMin, setTenureMin] = useState('');
  const [tenureMax, setTenureMax] = useState('');

  const fetchData = useCallback(() => {
    const params: Record<string, string | number | undefined> = { page, per_page: perPage };
    if (churnFilter) params.churn = churnFilter;
    if (contractFilter) params.contract = contractFilter;
    if (internetFilter) params.internet_service = internetFilter;
    if (paymentFilter) params.payment_method = paymentFilter;
    if (riskFilter) params.risk_band = riskFilter;
    if (tenureMin) params.tenure_min = Number(tenureMin);
    if (tenureMax) params.tenure_max = Number(tenureMax);
    api.getCustomers(params).then(setData as any);
  }, [page, perPage, churnFilter, contractFilter, internetFilter, paymentFilter, riskFilter, tenureMin, tenureMax]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredBySearch = data?.customers.filter(c =>
    !search || c.customerID.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Customers</h1>
          <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>{data?.total || 0} customers found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-52" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
          <Search size={15} style={{ color: 'var(--cs-ink-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by customer ID..."
            className="bg-transparent outline-none flex-1"
            style={{ fontSize: '14px', color: 'var(--cs-ink)' }}
          />
        </div>
        <select value={churnFilter} onChange={e => { setChurnFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Churn</option>
          <option value="Yes" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Churned</option>
          <option value="No" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Active</option>
        </select>
        <select value={contractFilter} onChange={e => { setContractFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Contracts</option>
          <option value="Month-to-month" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Month-to-month</option>
          <option value="One year" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>One year</option>
          <option value="Two year" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Two year</option>
        </select>
        <select value={internetFilter} onChange={e => { setInternetFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Internet</option>
          <option value="DSL" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>DSL</option>
          <option value="Fiber optic" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Fiber optic</option>
          <option value="No" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>No internet</option>
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Payment</option>
          <option value="Electronic check" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Electronic check</option>
          <option value="Mailed check" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Mailed check</option>
          <option value="Bank transfer (automatic)" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Bank transfer</option>
          <option value="Credit card (automatic)" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Credit card</option>
        </select>
        <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Risk</option>
          <option value="High" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>High Risk</option>
          <option value="Medium" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Medium Risk</option>
          <option value="Low" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Low Risk</option>
        </select>
        <input value={tenureMin} onChange={e => { setTenureMin(e.target.value); setPage(1); }} placeholder="Tenure min" type="number"
          className="px-3 py-2 rounded-xl outline-none w-24" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }} />
        <input value={tenureMax} onChange={e => { setTenureMax(e.target.value); setPage(1); }} placeholder="Tenure max" type="number"
          className="px-3 py-2 rounded-xl outline-none w-24" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '1100px', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cs-border)', background: 'var(--accent-glass)' }}>
                {['Customer ID', 'Gender', 'Senior', 'Tenure', 'Contract', 'Internet', 'Payment', 'Monthly', 'Total', 'Churn', 'Risk'].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBySearch.map((c, i) => (
                <tr key={c.customerID} style={{ borderBottom: '1px solid var(--cs-border)', background: i % 2 === 0 ? 'transparent' : 'var(--accent-glass)' }}>
                  <td className="px-4 py-4" style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--cs-ink)' }}>{c.customerID}</div>
                  </td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>{c.gender}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>{c.SeniorCitizen ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)', whiteSpace: 'nowrap' }}>{c.tenure}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>{c.Contract}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>{c.InternetService}</td>
                  <td className="px-4 py-4" style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>{c.PaymentMethod}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)', whiteSpace: 'nowrap' }}>${c.MonthlyCharges}</td>
                  <td className="px-4 py-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', whiteSpace: 'nowrap' }}>${c.TotalCharges?.toFixed(0) || '-'}</td>
                  <td className="px-4 py-4" style={{ whiteSpace: 'nowrap' }}>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: c.Churn === 'Yes' ? 'rgba(239,83,80,0.15)' : 'rgba(102,187,106,0.15)', color: c.Churn === 'Yes' ? 'var(--coral-churn)' : 'var(--green-safe)' }}>
                      {c.Churn}
                    </span>
                  </td>
                  <td className="px-4 py-4" style={{ whiteSpace: 'nowrap' }}><RiskPill risk={c.risk_band} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--cs-border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)', opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(data.total_pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold"
                  style={{ background: p === page ? 'var(--accent-primary)' : 'var(--accent-glass)', color: p === page ? '#fff' : 'var(--cs-ink)' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)', opacity: page === data.total_pages ? 0.4 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

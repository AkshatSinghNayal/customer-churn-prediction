import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { Prediction, FeatureImportance } from '../types';

const PREFERRED_MODEL_KEY = 'churnsight-preferred-model';

const INITIAL_FORM = {
  customerID: 'CUSTOM123',
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 12,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 74.95,
  TotalCharges: 899.40,
};

export function Predictions() {
  const { resolvedAppearance } = useTheme();
  const isDark = resolvedAppearance === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,31,28,0.06)';
  const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,31,28,0.4)';

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState('');
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [modelOptions, setModelOptions] = useState<string[]>(['Logistic Regression', 'Random Forest', 'XGBoost', 'LightGBM', 'Ensemble (Voting)']);
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window === 'undefined') return 'XGBoost';
    return localStorage.getItem(PREFERRED_MODEL_KEY) || 'XGBoost';
  });
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const updateForm = (key: string, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await api.predictCustom({ ...form, model_name: selectedModel } as unknown as Record<string, unknown>);
      setResult(res);
    } catch {
      setResult(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    api.getPredictions({ page, per_page: 20, risk_band: riskFilter || undefined }).then(res => {
      setPredictions(res.predictions);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    });
  }, [page, riskFilter]);

  useEffect(() => {
    api.getModels().then(data => {
      const options = Object.keys(data).filter(k => k !== '_best_model');
      if (options.length > 0) {
        setModelOptions(options);
      }
      const preferred = localStorage.getItem(PREFERRED_MODEL_KEY);
      if (preferred && data[preferred]) {
        setSelectedModel(preferred);
      } else if (data._best_model) {
        setSelectedModel(data._best_model);
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    api.getFeatureImportance().then(setFeatureImportance);
  }, []);

  const chartData = featureImportance.slice(0, 10).map(f => ({
    factor: f.feature.replace(/_/g, ' '),
    importance: f.importance,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>Churn Predictions</h1>
        <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Predictions generated from trained model</p>
      </div>

      {/* Custom prediction form */}
      <div className="rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <button
          onClick={() => setShowForm(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4"
          style={{ color: 'var(--cs-ink)' }}
        >
          <div className="flex items-center gap-3">
            <Brain size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Predict Churn for Custom Customer</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', transform: showForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>
        {showForm && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '4px' }}>Model</label>
                <select
                  value={selectedModel}
                  onChange={e => {
                    const nextModel = e.target.value;
                    setSelectedModel(nextModel);
                    localStorage.setItem(PREFERRED_MODEL_KEY, nextModel);
                  }}
                  className="w-full rounded-lg px-3 py-2 outline-none text-sm"
                  style={{ background: 'var(--accent-glass)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)' }}
                >
                  {modelOptions.map(model => (
                    <option key={model} value={model} style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>{model}</option>
                  ))}
                </select>
              </div>
              {[
                { key: 'customerID', label: 'Customer ID', type: 'text' },
                { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
                { key: 'SeniorCitizen', label: 'Senior Citizen', type: 'select', options: [0, 1] },
                { key: 'Partner', label: 'Partner', type: 'select', options: ['Yes', 'No'] },
                { key: 'Dependents', label: 'Dependents', type: 'select', options: ['Yes', 'No'] },
                { key: 'tenure', label: 'Tenure (months)', type: 'number' },
                { key: 'PhoneService', label: 'Phone Service', type: 'select', options: ['Yes', 'No'] },
                { key: 'MultipleLines', label: 'Multiple Lines', type: 'select', options: ['Yes', 'No', 'No phone service'] },
                { key: 'InternetService', label: 'Internet Service', type: 'select', options: ['DSL', 'Fiber optic', 'No'] },
                { key: 'OnlineSecurity', label: 'Online Security', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'OnlineBackup', label: 'Online Backup', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'DeviceProtection', label: 'Device Protection', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'TechSupport', label: 'Tech Support', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'StreamingTV', label: 'Streaming TV', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'StreamingMovies', label: 'Streaming Movies', type: 'select', options: ['Yes', 'No', 'No internet service'] },
                { key: 'Contract', label: 'Contract', type: 'select', options: ['Month-to-month', 'One year', 'Two year'] },
                { key: 'PaperlessBilling', label: 'Paperless Billing', type: 'select', options: ['Yes', 'No'] },
                { key: 'PaymentMethod', label: 'Payment Method', type: 'select', options: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'] },
                { key: 'MonthlyCharges', label: 'Monthly Charges ($)', type: 'number' },
                { key: 'TotalCharges', label: 'Total Charges ($)', type: 'number' },
              ].map(({ key, label, type, options }) => (
                <div key={key}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                  {type === 'select' ? (
                    <select
                      value={String(form[key as keyof typeof form])}
                      onChange={e => updateForm(key, isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                      className="w-full rounded-lg px-3 py-2 outline-none text-sm"
                      style={{ background: 'var(--accent-glass)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)' }}
                    >
                      {options!.map(o => (
                        <option key={String(o)} value={String(o)} style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>{String(o)}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={String(form[key as keyof typeof form])}
                      onChange={e => updateForm(key, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full rounded-lg px-3 py-2 outline-none text-sm"
                      style={{ background: 'var(--accent-glass)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent-primary)', color: '#fff' }}
            >
              {loading ? 'Predicting...' : 'Run Prediction'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '12px' }}>Prediction Result</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '2px' }}>CHURN PROBABILITY</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: result.risk_band === 'High' ? 'var(--coral-churn)' : result.risk_band === 'Medium' ? 'var(--amber-watch)' : 'var(--green-safe)' }}>
                {(result.churn_probability * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '2px' }}>PREDICTION</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: result.predicted_churn ? 'var(--coral-churn)' : 'var(--green-safe)' }}>
                {result.predicted_churn ? 'Will Churn' : 'Will Stay'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '2px' }}>MODEL USED</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cs-ink)' }}>
                {result.model_name || selectedModel}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '2px' }}>RISK BAND</p>
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{
                background: result.risk_band === 'High' ? 'rgba(239,83,80,0.15)' : result.risk_band === 'Medium' ? 'rgba(255,167,38,0.15)' : 'rgba(102,187,106,0.15)',
                color: result.risk_band === 'High' ? 'var(--coral-churn)' : result.risk_band === 'Medium' ? 'var(--amber-watch)' : 'var(--green-safe)',
              }}>
                {result.risk_band}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'var(--accent-glass)' }}>
            <p style={{ fontSize: '13px', color: 'var(--cs-ink)', lineHeight: 1.5 }}>{result.recommended_action}</p>
          </div>
        </div>
      )}

      {/* Feature importance */}
      <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '4px' }}>Top Churn Drivers</h3>
        <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginBottom: '16px' }}>Most important features for predicting churn</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="factor" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', borderRadius: '12px', color: 'var(--cs-ink)' }} />
            <Bar dataKey="importance" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none"
          style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', color: 'var(--cs-ink)', fontSize: '14px' }}>
          <option value="" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>All Risk Bands</option>
          <option value="High" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>High Risk</option>
          <option value="Medium" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Medium Risk</option>
          <option value="Low" style={{ background: 'var(--cs-card)', color: 'var(--cs-ink)' }}>Low Risk</option>
        </select>
        <span style={{ fontSize: '14px', color: 'var(--cs-ink-muted)' }}>{total} predictions</span>
      </div>

      {/* Prediction list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--cs-border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)' }}>Customer Predictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cs-border)', background: 'var(--accent-glass)' }}>
                {['Customer ID', 'Churn Probability', 'Risk Band', 'Predicted', 'Recommended Action'].map(h => (
                  <th key={h} className="px-6 py-3 text-left" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={p.customerID} style={{ borderBottom: '1px solid var(--cs-border)', background: i % 2 === 0 ? 'transparent' : 'var(--accent-glass)' }}>
                  <td className="px-6 py-4">
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--cs-ink)' }}>{p.customerID}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'var(--cs-border)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.round(p.churn_probability * 100)}%`,
                          background: p.risk_band === 'High' ? 'var(--coral-churn)' : p.risk_band === 'Medium' ? 'var(--amber-watch)' : 'var(--green-safe)',
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>{(p.churn_probability * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{
                      background: p.risk_band === 'High' ? 'rgba(239,83,80,0.15)' : p.risk_band === 'Medium' ? 'rgba(255,167,38,0.15)' : 'rgba(102,187,106,0.15)',
                      color: p.risk_band === 'High' ? 'var(--coral-churn)' : p.risk_band === 'Medium' ? 'var(--amber-watch)' : 'var(--green-safe)',
                    }}>
                      {p.risk_band}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: p.predicted_churn ? 'rgba(239,83,80,0.15)' : 'rgba(102,187,106,0.15)', color: p.predicted_churn ? 'var(--coral-churn)' : 'var(--green-safe)' }}>
                      {p.predicted_churn ? 'Will Churn' : 'Will Stay'}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', maxWidth: '300px' }}>
                    {p.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--cs-border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)', opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)', opacity: page === totalPages ? 0.4 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

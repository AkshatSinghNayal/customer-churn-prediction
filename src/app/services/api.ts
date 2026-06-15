import type {
  SummaryStats,
  CustomerResponse,
  ModelsResponse,
  ModelInfo,
  FeatureImportance,
  PredictionResponse,
  Prediction,
  AnalyticsData,
  Alert,
} from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  getSummary: () => get<SummaryStats>('/summary'),

  getCustomers: (params?: {
    page?: number;
    per_page?: number;
    churn?: string;
    tenure_min?: number;
    tenure_max?: number;
    contract?: string;
    internet_service?: string;
    payment_method?: string;
    risk_band?: string;
  }) => get<CustomerResponse>('/customers', params as Record<string, string | number | undefined>),

  getModels: () => get<ModelsResponse>('/models'),

  getModelDetail: (name: string) => get<ModelInfo>(`/models/${encodeURIComponent(name)}`),

  getFeatureImportance: () => get<FeatureImportance[]>('/feature-importance'),

  getPredictions: (params?: {
    page?: number;
    per_page?: number;
    risk_band?: string;
    sort_by?: string;
  }) => get<PredictionResponse>('/predictions', params as Record<string, string | number | undefined>),

  getPrediction: (customerId: string) => get<Prediction>(`/predict/${encodeURIComponent(customerId)}`),

  getAnalytics: () => get<AnalyticsData>('/analytics'),

  getAlerts: (params?: { read?: boolean; severity?: string }) =>
    get<Alert[]>('/alerts', params as Record<string, string | number | undefined>),

  updateAlert: (alertId: string, data: { read?: boolean; dismissed?: boolean }) =>
    patch<Alert>(`/alerts/${encodeURIComponent(alertId)}`, data),

  predictCustom: (data: Record<string, unknown>) =>
    fetch(`${BASE}/predict-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()) as Promise<Prediction>,

  getConfig: () => get<Record<string, any>>('/config'),

  retrain: (config?: Record<string, any>) =>
    fetch(`${BASE}/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config || {}),
    }).then(r => {
      if (!r.ok) throw new Error(`API error: ${r.status} ${r.statusText}`);
      return r.json();
    }) as Promise<{ status: string; metrics: ModelsResponse; best_params: any }>,
};

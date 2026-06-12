export interface Customer {
  customerID: string;
  gender: string;
  SeniorCitizen: number;
  Partner: string;
  Dependents: string;
  tenure: number;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;
  MonthlyCharges: number;
  TotalCharges: number | null;
  Churn: string;
  churn_probability: number;
  risk_band: string;
  recommended_action: string;
}

export interface SummaryStats {
  total_customers: number;
  churned: number;
  churn_rate: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  avg_tenure: number;
  avg_monthly_charges: number;
  avg_total_charges: number;
}

export interface ModelMetricsValue {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelInfo {
  metrics: ModelMetricsValue;
  feature_importance: FeatureImportance[];
}

export interface ModelsResponse {
  [name: string]: ModelInfo;
  _best_model: string;
}

export interface Prediction {
  model_name?: string;
  customerID: string;
  churn_probability: number;
  predicted_churn: number;
  risk_band: string;
  recommended_action: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface CustomerResponse extends PaginatedResponse<Customer> {
  customers: Customer[];
}

export interface PredictionResponse extends PaginatedResponse<Prediction> {
  predictions: Prediction[];
}

export interface Alert {
  id: string;
  customer_id: string;
  churn_probability: number;
  risk_band: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  dismissed: boolean;
}

export interface ChurnBreakdown {
  [key: string]: string | number;
}

export interface AnalyticsData {
  by_contract: ChurnBreakdown[];
  by_internet_service: ChurnBreakdown[];
  by_payment_method: ChurnBreakdown[];
  by_senior_citizen: ChurnBreakdown[];
  by_tenure_bucket: ChurnBreakdown[];
  by_monthly_charge_band: ChurnBreakdown[];
}

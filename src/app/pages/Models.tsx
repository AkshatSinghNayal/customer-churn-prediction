import { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Sliders, BookOpen, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { ModelsResponse, ModelInfo } from '../types';

const MODEL_NAMES = ['Logistic Regression', 'Random Forest', 'XGBoost', 'LightGBM', 'Ensemble (Voting)'];
const PREFERRED_MODEL_KEY = 'churnsight-preferred-model';

const modelDescriptions: Record<string, string> = {
  'Logistic Regression': 'Interpretable linear baseline model for churn classification.',
  'Random Forest': 'Ensemble of decision trees providing robust non-linear predictions.',
  'XGBoost': 'Gradient-boosted trees optimized for tabular classification tasks.',
  'LightGBM': 'Highly efficient leaf-wise gradient boosting optimized for speed and accuracy.',
  'Ensemble (Voting)': 'Soft voting ensemble combining all trained models for robust generalization.',
};

function getStatusColor(name: string, best: string): string {
  return name === best ? 'var(--green-safe)' : 'var(--cs-ink-muted)';
}

function getStatusBg(name: string, best: string): string {
  return name === best ? 'rgba(102,187,106,0.15)' : 'rgba(100,100,100,0.1)';
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--accent-glass)' }}>
      <div style={{ fontSize: '11px', color: 'var(--cs-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>{(value * 100).toFixed(1)}%</div>
    </div>
  );
}

function ConfusionMatrixGrid({ cm }: { cm: number[][] }) {
  const cells = [
    { label: 'True Negative', value: cm[0][0], type: 'true' },
    { label: 'False Positive', value: cm[0][1], type: 'false' },
    { label: 'False Negative', value: cm[1][0], type: 'false' },
    { label: 'True Positive', value: cm[1][1], type: 'true' },
  ];
  const total = cm[0][0] + cm[0][1] + cm[1][0] + cm[1][1];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cells.map(({ label, value, type }) => (
        <div key={label}
          className="p-3 rounded-xl"
          style={{
            background: type === 'true' ? 'rgba(102,187,106,0.12)' : 'rgba(239,83,80,0.12)',
            border: `1px solid ${type === 'true' ? 'rgba(102,187,106,0.3)' : 'rgba(239,83,80,0.3)'}`,
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--cs-ink-muted)', fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: type === 'true' ? 'var(--green-safe)' : 'var(--coral-churn)' }}>{value}</div>
          <div style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>{total > 0 ? ((value / total) * 100).toFixed(1) : '0'}%</div>
        </div>
      ))}
    </div>
  );
}

export function Models() {
  const [modelsData, setModelsData] = useState<ModelsResponse | null>(null);
  const [selected, setSelected] = useState<string>('XGBoost');
  const [showBenchmarkReport, setShowBenchmarkReport] = useState(true);
  const [config, setConfig] = useState<Record<string, any> | null>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainStatus, setRetrainStatus] = useState('');
  const [retrainError, setRetrainError] = useState('');

  const loadData = async () => {
    try {
      const data = await api.getModels();
      setModelsData(data);
      const storedModel = localStorage.getItem(PREFERRED_MODEL_KEY);
      if (storedModel && data[storedModel]) {
        setSelected(storedModel);
      } else if (data._best_model) {
        setSelected(data._best_model);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    }

    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetrain = async () => {
    if (!config) return;
    setIsRetraining(true);
    setRetrainStatus('Tuning grid parameters, balancing classes and evaluating thresholds... (takes up to 30s)');
    setRetrainError('');
    try {
      const res = await api.retrain(config);
      if (res.status === 'success') {
        setRetrainStatus('Pipeline optimized & models trained successfully!');
        // Reload all data
        const data = await api.getModels();
        setModelsData(data);
        if (data._best_model) {
          setSelected(data._best_model);
        }
        const cfg = await api.getConfig();
        setConfig(cfg);
      } else {
        setRetrainError('Pipeline optimization failed.');
      }
    } catch (err: any) {
      setRetrainError(err.message || 'Error occurred during training.');
    } finally {
      setIsRetraining(false);
    }
  };

  if (!modelsData) {
    return <div className="space-y-6"><p style={{ color: 'var(--cs-ink-muted)' }}>Loading Models & Configuration...</p></div>;
  }

  const bestModel = modelsData._best_model;
  const selectedInfo: ModelInfo | undefined = modelsData[selected];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>ML Models & Pipeline</h1>
          <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Configure preprocessing options, train custom algorithms, and evaluate metrics.</p>
        </div>
        {!showBenchmarkReport && (
          <button
            onClick={() => setShowBenchmarkReport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--accent-glass)', color: 'var(--accent-primary)', border: '1px solid var(--cs-border)' }}
          >
            <BookOpen size={13} /> View Benchmark Report
          </button>
        )}
      </div>

      {/* Benchmark Report */}
      {showBenchmarkReport && (
        <div className="p-6 rounded-2xl relative transition-all" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
          <button onClick={() => setShowBenchmarkReport(false)} className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded hover:opacity-80" style={{ color: 'var(--cs-ink-muted)', background: 'var(--accent-glass)' }}>Dismiss</button>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <BookOpen size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--cs-ink)' }}>Dataset Background & Benchmark Overview</h2>
                <p style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Contextualizing performance expectations for the Telco Churn dataset.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <p style={{ color: 'var(--cs-ink)', lineHeight: 1.5 }}>
                    Customer churn prediction is a moderately imbalanced supervised task (<strong>73% Non-Churn / 27% Churn</strong>). 
                    Evaluating with F1-score and AUC-ROC is crucial as accuracy alone can be misleading.
                  </p>
                  
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--cs-border)', background: 'var(--accent-glass)' }}>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr style={{ background: 'rgba(100,100,100,0.08)', borderBottom: '1px solid var(--cs-border)' }}>
                          <th className="p-2 font-semibold" style={{ color: 'var(--cs-ink)' }}>Algorithm</th>
                          <th className="p-2 font-semibold" style={{ color: 'var(--cs-ink)' }}>Benchmark Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--cs-border)' }}><td className="p-2 text-xs" style={{ color: 'var(--cs-ink-muted)' }}>Logistic Regression</td><td className="p-2 font-bold" style={{ color: 'var(--cs-ink)' }}>78% – 79%</td></tr>
                        <tr style={{ borderBottom: '1px solid var(--cs-border)' }}><td className="p-2 text-xs" style={{ color: 'var(--cs-ink-muted)' }}>Random Forest</td><td className="p-2 font-bold" style={{ color: 'var(--cs-ink)' }}>77% – 80%</td></tr>
                        <tr style={{ borderBottom: '1px solid var(--cs-border)' }}><td className="p-2 text-xs" style={{ color: 'var(--cs-ink-muted)' }}>XGBoost / LightGBM</td><td className="p-2 font-bold" style={{ color: 'var(--cs-ink)' }}>79% – 84%</td></tr>
                        <tr><td className="p-2 text-xs" style={{ color: 'var(--cs-ink-muted)' }}>Voting Ensemble</td><td className="p-2 font-bold" style={{ color: 'var(--cs-ink)' }}>~84% (Max Ceiling)</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>
                    ⚠️ Note: Publications claiming &gt;95% accuracy on this dataset are highly likely to suffer from data leakage, overfitting, or non-standard evaluation procedures.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cs-ink)' }}>Theoretical Data Constraints</h3>
                  <ul className="space-y-2 text-xs" style={{ color: 'var(--cs-ink-muted)' }}>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Lack of Behavioral/Dynamic Data:</strong> The dataset contains only static/billing configuration info. The lack of dynamic features (e.g. usage drop, customer support tickets) limits accuracy.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Feature Overlap Noise:</strong> Different customers with identical billing configurations and contract types can make opposite decisions due to unobserved factors.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Imbalance Trade-off:</strong> Due to the 27% minority class, maximizing Recall (churn capture) naturally increases False Positives, capping overall accuracy.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODEL_NAMES.map(name => {
          const info = modelsData[name];
          if (!info) return null;
          return (
            <button
              key={name}
              onClick={() => {
                setSelected(name);
                localStorage.setItem(PREFERRED_MODEL_KEY, name);
              }}
              className="p-6 rounded-2xl text-left transition-all"
              style={{
                background: 'var(--cs-card)',
                border: `2px solid ${selected === name ? 'var(--accent-primary)' : 'var(--cs-border)'}`,
                boxShadow: selected === name ? '0 4px 24px var(--accent-glass)' : 'none',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glass)' }}>
                  <Cpu size={20} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: getStatusBg(name, bestModel), color: getStatusColor(name, bestModel) }}>
                  {name === bestModel ? 'Best Model' : name === 'Logistic Regression' ? 'Baseline' : name === 'Ensemble (Voting)' ? 'Ensemble' : 'Tree Model'}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--cs-ink)', marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-ink-muted)', marginBottom: '12px' }}>F1: {(info.metrics.f1 * 100).toFixed(1)}%</div>
              <div className="grid grid-cols-2 gap-2">
                {[['Accuracy', info.metrics.accuracy], ['ROC-AUC', info.metrics.roc_auc]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>{k}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>{(v * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--cs-ink-muted)', marginTop: '10px' }}>
                Click to set this as the default model for custom predictions.
              </div>
            </button>
          );
        })}
      </div>

      {selectedInfo && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics */}
            <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '16px' }}>Performance Metrics — {selected}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {(['accuracy', 'precision', 'recall', 'f1'] as const).map(m => (
                  <MetricBox key={m} label={m === 'f1' ? 'F1 Score' : m.charAt(0).toUpperCase() + m.slice(1)} value={selectedInfo.metrics[m]} />
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '8px' }}>ROC-AUC & Best Probability Cutoff</h4>
                <div className="flex gap-8 items-baseline">
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-primary)' }}>{(selectedInfo.metrics.roc_auc * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--cs-ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tuned Decision Threshold</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--cs-ink)' }}>{selectedInfo.metrics.best_threshold ? selectedInfo.metrics.best_threshold.toFixed(2) : '0.50'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Optimizer Control Panel */}
            {config && (
              <div className="p-6 rounded-2xl space-y-5" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderBottomColor: 'var(--cs-border)' }}>
                  <div className="flex items-center gap-2">
                    <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--cs-ink)' }}>Pipeline Optimizer & Retraining</h3>
                  </div>
                  {isRetraining && (
                    <span className="text-xs font-semibold animate-pulse flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                      <Loader2 className="animate-spin" size={14} /> Retraining...
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)' }}>Preprocessing & Balancing Options</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-start justify-between cursor-pointer gap-2">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>Drop Redundant Features</span>
                          <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>Removes collinear dummy columns and charge variables.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.drop_collinear}
                          onChange={e => setConfig({ ...config, drop_collinear: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                        />
                      </label>

                      <label className="flex items-start justify-between cursor-pointer gap-2">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>Resolve Feature Overlap Noise</span>
                          <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>Removes training records with duplicate features but opposite labels.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.drop_noise}
                          onChange={e => setConfig({ ...config, drop_noise: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                        />
                      </label>

                      <label className="flex items-start justify-between cursor-pointer gap-2">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>Class Balancing (SMOTE)</span>
                          <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>Applies SMOTE oversampling to balance minority churn class.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.use_smote}
                          onChange={e => setConfig({ ...config, use_smote: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                        />
                      </label>

                      <label className="flex items-start justify-between cursor-pointer gap-2">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>Use Class Weight Balancing</span>
                          <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>Applies class weights to balance churn class (higher F1, lower accuracy).</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.use_class_weight}
                          onChange={e => setConfig({ ...config, use_class_weight: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                        />
                      </label>

                      <label className="flex items-start justify-between cursor-pointer gap-2">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>Collapse No Internet Service</span>
                          <p style={{ fontSize: '11px', color: 'var(--cs-ink-muted)' }}>Collapses 'No internet service' to 'No' (reduces features, but can lower accuracy).</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={config.collapse_internet}
                          onChange={e => setConfig({ ...config, collapse_internet: e.target.checked })}
                          className="w-4 h-4 rounded accent-primary cursor-pointer mt-1"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)' }}>Selected ML Models</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {['Logistic Regression', 'Random Forest', 'XGBoost', 'LightGBM', 'Ensemble (Voting)'].map(m => {
                        const isChecked = config.models?.includes(m);
                        return (
                          <label key={m} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg" style={{ background: 'var(--accent-glass)' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                const nextModels = e.target.checked
                                  ? [...(config.models || []), m]
                                  : (config.models || []).filter((x: string) => x !== m);
                                setConfig({ ...config, models: nextModels });
                              }}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cs-ink)' }}>{m}</span>
                          </label>
                        );
                      })}
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleRetrain}
                        disabled={isRetraining || !config.models?.length}
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                        style={{ background: 'var(--accent-primary)', color: '#fff', opacity: (isRetraining || !config.models?.length) ? 0.5 : 1 }}
                      >
                        {isRetraining ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Optimizing Pipeline...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} /> Optimize & Retrain Pipeline
                          </>
                        )}
                      </button>
                      
                      {retrainStatus && (
                        <p style={{ fontSize: '12px', color: 'var(--green-safe)', marginTop: '8px', fontWeight: 500 }}>
                          {retrainStatus}
                        </p>
                      )}
                      {retrainError && (
                        <p style={{ fontSize: '12px', color: 'var(--coral-churn)', marginTop: '8px', fontWeight: 500 }}>
                          {retrainError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side info */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '12px' }}>Model Info</h3>
              <div className="space-y-3">
                {[
                  ['Name', selected],
                  ['Status', selected === bestModel ? 'Production (Best)' : 'Comparison'],
                  ['Type', selected === 'Logistic Regression' ? 'Linear' : selected === 'Random Forest' ? 'Ensemble' : selected === 'Ensemble (Voting)' ? 'Soft Voting' : 'Gradient Boosted'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span style={{ fontSize: '13px', color: 'var(--cs-ink-muted)' }}>{k}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4" style={{ fontSize: '13px', color: 'var(--cs-ink-muted)', lineHeight: 1.5 }}>
                {modelDescriptions[selected]}
              </p>
            </div>

            <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '12px' }}>Confusion Matrix</h3>
              {selectedInfo.metrics.confusion_matrix && selectedInfo.metrics.confusion_matrix.length > 0 ? (
                <ConfusionMatrixGrid cm={selectedInfo.metrics.confusion_matrix} />
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--cs-ink-muted)' }}>No confusion matrix available for this model.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

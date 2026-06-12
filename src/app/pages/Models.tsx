import { useEffect, useState } from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { ModelsResponse, ModelInfo, ModelMetricsValue } from '../types';

const MODEL_NAMES = ['Logistic Regression', 'Random Forest', 'XGBoost'];
const PREFERRED_MODEL_KEY = 'churnsight-preferred-model';

const modelDescriptions: Record<string, string> = {
  'Logistic Regression': 'Interpretable linear baseline model for churn classification.',
  'Random Forest': 'Ensemble of decision trees providing robust non-linear predictions.',
  'XGBoost': 'Gradient-boosted trees optimized for tabular classification tasks.',
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
  const { resolvedAppearance } = useTheme();

  useEffect(() => {
    api.getModels().then(data => {
      setModelsData(data);
      const storedModel = localStorage.getItem(PREFERRED_MODEL_KEY);
      if (storedModel && data[storedModel]) {
        setSelected(storedModel);
      } else if (data._best_model) {
        setSelected(data._best_model);
      }
    });
  }, []);

  if (!modelsData) {
    return <div className="space-y-6"><p style={{ color: 'var(--cs-ink-muted)' }}>Loading...</p></div>;
  }

  const bestModel = modelsData._best_model;
  const selectedInfo: ModelInfo | undefined = modelsData[selected];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cs-ink)' }}>ML Models</h1>
        <p style={{ fontSize: '14px', color: 'var(--cs-ink-muted)', marginTop: '2px' }}>Model comparison and evaluation metrics</p>
      </div>

      {/* Model cards */}
      <div className="grid lg:grid-cols-3 gap-4">
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
                  {name === bestModel ? 'Best Model' : name === 'Logistic Regression' ? 'Baseline' : 'Ensemble'}
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
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(['accuracy', 'precision', 'recall', 'f1'] as const).map(m => (
                  <MetricBox key={m} label={m === 'f1' ? 'F1 Score' : m.charAt(0).toUpperCase() + m.slice(1)} value={selectedInfo.metrics[m]} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-ink-muted)', marginBottom: '8px' }}>ROC-AUC</h4>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-primary)' }}>{(selectedInfo.metrics.roc_auc * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)', boxShadow: '0 4px 24px var(--accent-glass)' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--cs-ink)', marginBottom: '12px' }}>Model Info</h3>
              <div className="space-y-3">
                {[
                  ['Name', selected],
                  ['Status', selected === bestModel ? 'Production (Best)' : 'Comparison'],
                  ['Type', selected === 'Logistic Regression' ? 'Linear' : selected === 'Random Forest' ? 'Ensemble' : 'Gradient Boosted'],
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
              <ConfusionMatrixGrid cm={selectedInfo.metrics.confusion_matrix} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

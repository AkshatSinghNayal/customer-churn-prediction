# ChurnSight

Customer churn prediction dashboard with ML-powered risk scoring and analytics.

## Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Pipeline Overview

### 1. Dataset
Telco Customer Churn dataset (7043 customers, 20 attributes). Target: binary churn flag.

### 2. Preprocessing & Data Cleaning (`backend/pipeline/preprocess.py`)
- **Data Integrity Preservation**: Parsed `TotalCharges` as numeric, and filled missing charges with `0` for new customers (`tenure = 0`) instead of dropping their rows.
- **Service Simplification**: Map "No internet service" → "No" for dependent service columns (`OnlineSecurity`, `OnlineBackup`, `DeviceProtection`, `TechSupport`, `StreamingTV`, `StreamingMovies`).
- **Advanced Feature Engineering**:
  - `is_automatic_payment` — flag indicating automated bank transfers or credit cards.
  - `expected_total_charges` — calculated as `MonthlyCharges * tenure`.
  - `charges_diff` — actual total charges minus expected total charges.
  - `charges_ratio` — ratio of actual to expected total charges.
  - `senior_x_month_to_month` — interaction flag for senior citizens on high-risk month-to-month contracts.
  - `service_count` & `has_multiple_services` — count and presence indicators of subscribed services.
  - `avg_charge_per_tenure` — `TotalCharges / (tenure + 1)`.
- **Binning**: `tenure_bin` — ordinal categories: 0–12, 12–24, 24–48, 48–72, 72+.
- **Encoding & Scaling**: One-hot encode categoricals, and apply `StandardScaler` on numeric columns (excluding binary flags).

### 3. Hyperparameter Tuning & Threshold Optimization (`backend/pipeline/train.py`)
We train three models using `GridSearchCV` (3-fold, scoring=`f1`) and create an ensemble:
- **Logistic Regression**: Tuning `C`, `penalty`, `solver` with balanced class weights.
- **Random Forest**: Tuning `n_estimators`, `max_depth`, `min_samples_split` with balanced class weights.
- **XGBoost**: Tuning `learning_rate`, `max_depth`, `subsample`, `colsample_bytree` with position weighting.
- **Ensemble (Voting)**: Soft-voting classifier combining the three best estimators.
- **Optimal Threshold Selection**: Instead of the default `0.5` threshold, we run a grid scan (0.1 to 0.9) to find the decision threshold that maximizes the F1-score on the training set for each model.

---

## Model Performance & Final Results

Following the integration of our new features and threshold tuning, the models were evaluated on the 20% hold-out test set:

| Model | F1-Score | Accuracy | Precision | Recall | ROC-AUC | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (Best)** | **0.6370** | **0.7800** | **0.5667** | 0.7273 | 0.8442 | **0.53** |
| Ensemble (Voting) | 0.6307 | 0.7715 | 0.5522 | 0.7353 | **0.8491** | 0.55 |
| XGBoost | 0.6275 | 0.7750 | 0.5597 | 0.7139 | 0.8474 | 0.60 |
| Logistic Regression | 0.6212 | 0.7715 | 0.5546 | 0.7059 | 0.8464 | 0.59 |

> [!TIP]
> - The **Random Forest** model with F1-optimized threshold (`0.53`) achieves the best balance between precision and recall, with an F1 score of **0.6370** (+3.1% relative improvement over the previous baseline).
> - The **Voting Ensemble** achieves the highest overall discriminative ability with a ROC-AUC of **0.8491**.

---

## Key Observations & Performance Limits

While our optimizations significantly improved prediction scores, there are key data limits restricting further accuracy:
1. **Lack of Dynamic/Behavioral Data**: The dataset lacks time-series indicators (e.g., call drops, internet usage changes, customer support ticket frequency). Static attributes only explain a baseline level of churn behavior.
2. **Feature Overlap (Noise)**: Customers with identical billing configurations and contract types can make different decisions due to unobserved external factors (competitor promotions, personal relocation, or finances).
3. **Imbalance Trade-off**: Because churn accounts for only ~27% of the dataset, tuning the models to increase Recall (catching actual churners) introduces False Positives, naturally limiting the overall Accuracy ceiling.


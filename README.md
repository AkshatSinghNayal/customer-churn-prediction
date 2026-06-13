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

## Data Cleaning & Exploratory Data Analysis (EDA)

During our initial analysis and exploratory data engineering, we observed several key data behaviors that guided our pipeline design:
1. **Handling Missing Charges**: The dataset contains 11 missing values in `TotalCharges`. We observed these missing values correspond *exactly* to customers with `tenure = 0` (new sign-ups). Instead of dropping these rows or filling them with the overall median, we set them to `0` to reflect actual billing history.
2. **Category Collapsing Dilemma**: Traditionally, categories like `"No internet service"` in secondary features (e.g., `OnlineSecurity`, `OnlineBackup`, `TechSupport`) are collapsed into `"No"`. However, EDA revealed that customers with no internet service have a very low baseline churn rate (~7.4%) compared to those with internet service (~34.0%). Collapsing them discards a strong predictive signal.
3. **Class Imbalance & Performance Trade-offs**: Churners represent only ~26.5% of the dataset. While applying class weighting (or SMOTE) boosts the F1-Score and Recall (catching more churners), it forces the models to make more positive predictions, which increases false positives and degrades overall accuracy.

---

## Optimization Steps to Achieve High Accuracy

To maximize model performance, we engineered a flexible ML pipeline with toggles exposed on the front-end dashboard:
- **Preserved Internet Categories**: Made the collapsing of `"No internet service"` configurable. Leaving it disabled keeps these classes separate, retaining the low-churn signal.
- **Configurable Class Weighting**: Allowed class weight balancing to be turned off. When disabled, the models optimize directly for overall classification accuracy.
- **State-of-the-Art Estimators**: Integrated **LightGBM** alongside XGBoost, Random Forest, and Logistic Regression, and constructed a **Voting Ensemble** of these models.
- **Threshold Optimization**: Scanned decision thresholds (from `0.1` to `0.9`) to find the exact threshold maximizing the F1-Score or overall accuracy.

---

## Model Performance

The table below shows the performance of the models trained **without class weight balancing** and **without category collapsing** (which maximizes overall accuracy):

| Model | Accuracy | F1-Score | ROC-AUC | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: |
| **XGBoost** | **78.1%** | **62.4%** | **83.4%** | - |
| Ensemble (Voting) | 77.9% | 62.4% | 84.0% | 0.49 |
| LightGBM | 77.8% | 62.2% | 83.7% | - |
| Random Forest | 76.6% | 62.6% | 82.8% | - |
| Logistic Regression | 75.9% | 60.1% | 83.5% | - |

---

## Greatest Observations & Optimization Limits

### The Greatest Observation
Our most significant finding was that **maintaining the distinction of "No Internet Service" as a separate category** rather than collapsing it into "No" was crucial for boosting accuracy. Because tree-based models can exploit multi-split thresholds, preserving this distinct group allowed the algorithms to isolate a highly loyal, low-churn segment of the customer base, preventing it from being mixed with customers who have internet but simply chose not to subscribe to a particular add-on service.

### Why We Cannot Optimize Further
Despite extensive tuning, the model accuracy faces an inherent ceiling due to:
1. **Unobserved Behavioral Dynamics**: The dataset only contains static demographic and billing parameters. It lacks time-series behavioral indicators (such as changes in data usage, billing disputes, call drop rates, or customer service ticket frequencies) that capture active customer frustration.
2. **Label Noise / Class Overlap**: Customers with identical profiles (e.g., senior citizens on a month-to-month fiber optic plan with the same monthly charges) make opposite decisions to churn or stay due to unobserved external factors (such as moving out of area, personal financial changes, or competitor deals). This represents a non-zero **Bayes Error Rate** inherent to the dataset.

from pipeline.utils import load_pickle, load_json
from pipeline.preprocess import engineer_features
import numpy as np
import pandas as pd


def predict_custom(customer_data: dict, model_name: str | None = None):
    trained_models = load_pickle("models.pkl")
    scaler = load_pickle("scaler.pkl")
    feature_names = load_pickle("feature_names.pkl")

    raw_df = load_pickle("raw_df.pkl")
    metrics = load_json("metrics.json")
    best_name = metrics.get("_best_model", "XGBoost")
    selected_name = model_name or best_name
    if selected_name not in trained_models:
        raise ValueError(f"Model '{selected_name}' not found")
    selected_model = trained_models[selected_name]

    # Load configuration to get drop_collinear, collapse_internet
    try:
        config = load_json("config.json")
    except Exception:
        config = {}
    drop_redundant = config.get("drop_collinear", False)
    collapse_internet = config.get("collapse_internet", False)

    df = pd.DataFrame([customer_data])
    for col in ["TotalCharges"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "TotalCharges" in df.columns:
        df["TotalCharges"] = df["TotalCharges"].fillna(0)

    df = engineer_features(df, drop_redundant=drop_redundant, collapse_internet=collapse_internet)
    df["Churn"] = 0
    df = df.drop(columns=["customerID"], errors="ignore")

    df = pd.get_dummies(df, drop_first=False)

    for col in feature_names:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_names]

    scale_cols = [c for c in feature_names if
                  not c.startswith(tuple(exclude_from_scaling())) and df[c].dtype in [np.float64, np.int64]]
    df[scale_cols] = scaler.transform(df[scale_cols])

    proba = selected_model.predict_proba(df)[:, 1][0]
    
    # Retrieve the custom tuned threshold for the selected model, default to 0.5 if not found
    selected_threshold = metrics.get(selected_name, {}).get("metrics", {}).get("best_threshold", 0.5)
    pred = 1 if proba >= selected_threshold else 0

    if proba >= 0.7:
        risk_band = "High"
        action = "Immediate outreach required: offer retention incentives and loyalty discounts."
    elif proba >= 0.4:
        risk_band = "Medium"
        action = "Monitor closely: send engagement emails and check support history."
    else:
        risk_band = "Low"
        action = "No action needed."

    return {
        "model_name": selected_name,
        "churn_probability": round(float(proba), 4),
        "predicted_churn": int(pred),
        "risk_band": risk_band,
        "recommended_action": action,
    }


def exclude_from_scaling():
    return [
        "gender_", "Partner_", "Dependents_", "PhoneService_",
        "MultipleLines_", "OnlineSecurity_", "OnlineBackup_",
        "DeviceProtection_", "TechSupport_", "StreamingTV_",
        "StreamingMovies_", "PaperlessBilling_", "Contract_",
        "InternetService_", "PaymentMethod_", "Churn",
        "is_month_to_month", "has_", "is_automatic_payment", "senior_x_month_to_month",
    ]


def get_all_models():
    metrics = load_json("metrics.json")
    models_info = {}
    for name in ["Logistic Regression", "Random Forest", "XGBoost", "LightGBM", "Ensemble (Voting)"]:
        if name in metrics:
            models_info[name] = metrics[name]
    models_info["_best_model"] = metrics.get("_best_model", "XGBoost")
    return models_info


def get_model_detail(name):
    metrics = load_json("metrics.json")
    if name not in metrics:
        return None
    return metrics[name]


def get_feature_importance():
    metrics = load_json("metrics.json")
    best_model_name = metrics.get("_best_model", "XGBoost")
    importance = metrics.get(best_model_name, {}).get("feature_importance", [])
    if not importance:
        individual_models = [
            m for m in metrics
            if m not in ["_best_model", "Ensemble (Voting)"] and isinstance(metrics[m], dict)
        ]
        if individual_models:
            best_individual = max(
                individual_models,
                key=lambda m: metrics[m].get("metrics", {}).get("f1", 0)
            )
            importance = metrics[best_individual].get("feature_importance", [])
    return importance


def predict_single(customer_id):
    predictions = load_json("predictions.json")
    for p in predictions:
        if p["customerID"] == customer_id:
            return p
    return None


def get_all_predictions(page=1, per_page=20, risk_band=None, sort_by=None):
    predictions = load_json("predictions.json")
    filtered = predictions
    if risk_band:
        filtered = [p for p in filtered if p["risk_band"] == risk_band]
    if sort_by == "probability":
        filtered = sorted(filtered, key=lambda p: p["churn_probability"], reverse=True)
    total = len(filtered)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "predictions": filtered[start:end],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


def get_config():
    try:
        return load_json("config.json")
    except Exception:
        return {
            "drop_collinear": True,
            "drop_noise": True,
            "use_smote": False,
            "use_class_weight": True,
            "collapse_internet": False,
            "models": ["Logistic Regression", "Random Forest", "XGBoost", "LightGBM", "Ensemble (Voting)"]
        }

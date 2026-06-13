import argparse
import os
import sys
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from . import preprocess
from .utils import save_pickle, save_json, artifact_exists, load_pickle, load_json, ARTIFACTS_DIR


LR_GRID = {
    "C": [0.01, 0.1, 1, 10],
    "penalty": ["l1", "l2"],
    "solver": ["liblinear"],
}

RF_GRID = {
    "n_estimators": [100, 200, 300],
    "max_depth": [5, 10, 20, None],
    "min_samples_split": [2, 5, 10],
}

XGB_GRID = {
    "learning_rate": [0.01, 0.05, 0.1],
    "max_depth": [3, 5, 7],
    "subsample": [0.7, 0.8, 1.0],
    "colsample_bytree": [0.7, 0.8, 1.0],
}

LGBM_GRID = {
    "learning_rate": [0.01, 0.05, 0.1],
    "max_depth": [3, 5, 7],
    "n_estimators": [100, 200],
    "subsample": [0.8, 1.0],
}

MODELS_DIR = os.path.join(ARTIFACTS_DIR, "models")


def find_best_threshold(model, X, y):
    y_proba = model.predict_proba(X)[:, 1]
    best_t = 0.5
    best_f1 = -1
    for t in np.linspace(0.1, 0.9, 81):
        f1 = f1_score(y, (y_proba >= t).astype(int), zero_division=0)
        if f1 > best_f1:
            best_f1 = f1
            best_t = t
    return best_t


def evaluate_model(model, X_test, y_test, threshold=0.5):
    y_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)
    cm = confusion_matrix(y_test, y_pred).tolist()
    return {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_proba), 4),
        "confusion_matrix": cm,
        "best_threshold": round(float(threshold), 2),
    }


def get_feature_importance(model, feature_names, model_name):
    if model_name == "Logistic Regression":
        coef = model.coef_[0]
        importance = np.abs(coef)
    else:
        importance = model.feature_importances_
    indices = np.argsort(importance)[::-1]
    return [
        {"feature": feature_names[i], "importance": round(float(importance[i]), 4)}
        for i in indices[:20]
        if importance[i] > 0
    ]


def tune_model(name, base_model, param_grid, X_train, y_train):
    print(f"  Tuning {name}...")
    grid = GridSearchCV(
        base_model,
        param_grid,
        cv=3,
        scoring="f1",
        n_jobs=-1,
        verbose=0,
    )
    grid.fit(X_train, y_train)
    print(f"  Best params for {name}: {grid.best_params_}")
    print(f"  Best CV F1: {grid.best_score_:.4f}")
    return grid.best_estimator_, grid.best_params_


def run_training(config=None):
    if config is None:
        config = {
            "drop_collinear": True,
            "drop_noise": True,
            "use_smote": False,
            "use_class_weight": True,
            "collapse_internet": False,
            "models": ["Logistic Regression", "Random Forest", "XGBoost", "LightGBM", "Ensemble (Voting)"]
        }
    
    print(f"Training with config: {config}")
    
    drop_collinear = config.get("drop_collinear", False)
    drop_noise = config.get("drop_noise", False)
    use_smote = config.get("use_smote", False)
    use_class_weight = config.get("use_class_weight", True)
    collapse_internet = config.get("collapse_internet", False)
    active_models = config.get("models", ["Logistic Regression", "Random Forest", "XGBoost", "LightGBM", "Ensemble (Voting)"])
    
    print("Loading and preprocessing data...")
    X_train, X_test, y_train, y_test, df_encoded, customer_ids, raw_df, scaler = preprocess.preprocess(
        drop_redundant=drop_collinear,
        drop_noise=drop_noise,
        collapse_internet=collapse_internet
    )

    if use_smote:
        print("Applying SMOTE...")
        from imblearn.over_sampling import SMOTE
        smote = SMOTE(random_state=42)
        X_train, y_train = smote.fit_resample(X_train, y_train)
        print(f"  After SMOTE: {X_train.shape[0]} samples")

    feature_names = X_train.columns.tolist()
    all_metrics = {}
    trained_models = {}
    best_params_map = {}

    # Logistic Regression
    if "Logistic Regression" in active_models:
        class_weight_param = "balanced" if use_class_weight else None
        lr_base = LogisticRegression(
            class_weight=class_weight_param, max_iter=1000, random_state=42
        )
        lr_best, lr_params = tune_model("Logistic Regression", lr_base, LR_GRID, X_train, y_train)
        lr_thresh = find_best_threshold(lr_best, X_train, y_train)
        trained_models["Logistic Regression"] = lr_best
        best_params_map["Logistic Regression"] = lr_params
        all_metrics["Logistic Regression"] = {
            "metrics": evaluate_model(lr_best, X_test, y_test, lr_thresh),
            "feature_importance": get_feature_importance(lr_best, feature_names, "Logistic Regression"),
        }
        print(f"  Test F1: {all_metrics['Logistic Regression']['metrics']['f1']:.4f} (Thresh: {lr_thresh:.2f})")

    # Random Forest
    if "Random Forest" in active_models:
        class_weight_param = "balanced" if use_class_weight else None
        rf_base = RandomForestClassifier(class_weight=class_weight_param, random_state=42)
        rf_best, rf_params = tune_model("Random Forest", rf_base, RF_GRID, X_train, y_train)
        rf_thresh = find_best_threshold(rf_best, X_train, y_train)
        trained_models["Random Forest"] = rf_best
        best_params_map["Random Forest"] = rf_params
        all_metrics["Random Forest"] = {
            "metrics": evaluate_model(rf_best, X_test, y_test, rf_thresh),
            "feature_importance": get_feature_importance(rf_best, feature_names, "Random Forest"),
        }
        print(f"  Test F1: {all_metrics['Random Forest']['metrics']['f1']:.4f} (Thresh: {rf_thresh:.2f})")

    # XGBoost
    if "XGBoost" in active_models:
        pos_weight = (len(y_train) - sum(y_train)) / sum(y_train) if (use_class_weight and sum(y_train) > 0) else 1.0
        xgb_base = XGBClassifier(
            scale_pos_weight=pos_weight,
            eval_metric="logloss",
            random_state=42,
        )
        xgb_best, xgb_params = tune_model("XGBoost", xgb_base, XGB_GRID, X_train, y_train)
        xgb_thresh = find_best_threshold(xgb_best, X_train, y_train)
        trained_models["XGBoost"] = xgb_best
        best_params_map["XGBoost"] = xgb_params
        all_metrics["XGBoost"] = {
            "metrics": evaluate_model(xgb_best, X_test, y_test, xgb_thresh),
            "feature_importance": get_feature_importance(xgb_best, feature_names, "XGBoost"),
        }
        print(f"  Test F1: {all_metrics['XGBoost']['metrics']['f1']:.4f} (Thresh: {xgb_thresh:.2f})")

    # LightGBM
    if "LightGBM" in active_models:
        class_weight_param = "balanced" if use_class_weight else None
        lgbm_base = LGBMClassifier(
            class_weight=class_weight_param,
            random_state=42,
            verbose=-1,
        )
        lgbm_best, lgbm_params = tune_model("LightGBM", lgbm_base, LGBM_GRID, X_train, y_train)
        lgbm_thresh = find_best_threshold(lgbm_best, X_train, y_train)
        trained_models["LightGBM"] = lgbm_best
        best_params_map["LightGBM"] = lgbm_params
        all_metrics["LightGBM"] = {
            "metrics": evaluate_model(lgbm_best, X_test, y_test, lgbm_thresh),
            "feature_importance": get_feature_importance(lgbm_best, feature_names, "LightGBM"),
        }
        print(f"  Test F1: {all_metrics['LightGBM']['metrics']['f1']:.4f} (Thresh: {lgbm_thresh:.2f})")

    # Voting Ensemble
    if "Ensemble (Voting)" in active_models:
        estimators = []
        if "Logistic Regression" in trained_models:
            estimators.append(("lr", trained_models["Logistic Regression"]))
        if "Random Forest" in trained_models:
            estimators.append(("rf", trained_models["Random Forest"]))
        if "XGBoost" in trained_models:
            estimators.append(("xgb", trained_models["XGBoost"]))
        if "LightGBM" in trained_models:
            estimators.append(("lgb", trained_models["LightGBM"]))
            
        if len(estimators) > 1:
            print("Training Voting Ensemble (soft)...")
            ensemble = VotingClassifier(estimators=estimators, voting="soft")
            ensemble.fit(X_train, y_train)
            ens_thresh = find_best_threshold(ensemble, X_train, y_train)
            trained_models["Ensemble (Voting)"] = ensemble
            all_metrics["Ensemble (Voting)"] = {
                "metrics": evaluate_model(ensemble, X_test, y_test, ens_thresh),
                "feature_importance": [],
            }
            print(f"  Test F1: {all_metrics['Ensemble (Voting)']['metrics']['f1']:.4f} (Thresh: {ens_thresh:.2f})")

    if not all_metrics:
        raise ValueError("No models were trained! Please select at least one active model.")

    best_model_name = max(all_metrics, key=lambda k: all_metrics[k]["metrics"]["f1"])
    all_metrics["_best_model"] = best_model_name

    print(f"\n=== Best model: {best_model_name} (F1: {all_metrics[best_model_name]['metrics']['f1']}) ===")
    print(f"    Accuracy: {all_metrics[best_model_name]['metrics']['accuracy']}")
    print(f"    Precision: {all_metrics[best_model_name]['metrics']['precision']}")
    print(f"    Recall: {all_metrics[best_model_name]['metrics']['recall']}")
    print(f"    ROC-AUC: {all_metrics[best_model_name]['metrics']['roc_auc']}")
    print(f"    Best Threshold: {all_metrics[best_model_name]['metrics']['best_threshold']}")

    # Save artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    for name, model in trained_models.items():
        safe_name = name.lower().replace(" ", "_").replace("(", "").replace(")", "")
        save_pickle(model, os.path.join("models", f"{safe_name}.pkl"))

    save_pickle(trained_models, "models.pkl")
    save_json(all_metrics, "metrics.json")
    save_json(best_params_map, "best_params.json")
    save_json(config, "config.json")
    save_pickle(scaler, "scaler.pkl")
    save_pickle(X_train, "X_train.pkl")
    save_pickle(X_test, "X_test.pkl")
    save_pickle(y_train, "y_train.pkl")
    save_pickle(y_test, "y_test.pkl")
    save_pickle(feature_names, "feature_names.pkl")
    save_pickle(customer_ids, "customer_ids.pkl")
    save_pickle(raw_df, "raw_df.pkl")

    print("Generating predictions for all customers...")
    all_X = df_encoded.drop(columns=["Churn"])
    all_X_scaled = all_X.copy()
    scaler_cols = [c for c in all_X.columns if c in X_train.columns and all_X[c].dtype in [np.float64, np.int64] and
                   not c.startswith(tuple([
                       "gender_", "Partner_", "Dependents_", "PhoneService_",
                       "MultipleLines_", "OnlineSecurity_", "OnlineBackup_",
                       "DeviceProtection_", "TechSupport_", "StreamingTV_",
                       "StreamingMovies_", "PaperlessBilling_", "Contract_",
                       "InternetService_", "PaymentMethod_", "is_month_to_month", "has_",
                       "is_automatic_payment", "senior_x_month_to_month"
                   ]))]
    if scaler_cols:
        all_X_scaled[scaler_cols] = scaler.transform(all_X[scaler_cols])

    best_model = trained_models[best_model_name]
    best_threshold = all_metrics[best_model_name]["metrics"].get("best_threshold", 0.5)
    all_proba = best_model.predict_proba(all_X_scaled)[:, 1]
    all_pred = (all_proba >= best_threshold).astype(int)

    results_df = raw_df[["customerID"]].copy()
    results_df["churn_probability"] = np.round(all_proba, 4)
    results_df["predicted_churn"] = all_pred.tolist()

    def risk_band(p):
        if p >= 0.7:
            return "High"
        elif p >= 0.4:
            return "Medium"
        return "Low"

    def recommended_action(row):
        p = row["churn_probability"]
        if p >= 0.7:
            return "Immediate outreach required: offer retention incentives and loyalty discounts."
        elif p >= 0.4:
            return "Monitor closely: send engagement emails and check support history."
        else:
            return "No action needed."

    results_df["risk_band"] = results_df["churn_probability"].apply(risk_band)
    results_df["recommended_action"] = results_df.apply(recommended_action, axis=1)

    prob_col = results_df["churn_probability"]
    results_df = results_df.drop(columns=["churn_probability"])
    results_df.insert(1, "churn_probability", prob_col)

    results_json = results_df.to_dict(orient="records")
    save_json(results_json, "predictions.json")

    print("Training complete. All artifacts saved.")
    return all_metrics, best_params_map


def get_or_train():
    if artifact_exists("metrics.json"):
        print("Loading cached artifacts...")
        metrics = load_json("metrics.json")
        return metrics
    return run_training()[0]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train churn prediction models")
    parser.add_argument("--smote", action="store_true", help="Apply SMOTE to balance classes")
    parser.add_argument("--drop-collinear", action="store_true", help="Drop collinear/redundant features")
    parser.add_argument("--drop-noise", action="store_true", help="Drop conflicting noise training rows")
    parser.add_argument("--no-class-weight", action="store_true", help="Disable class weight balancing")
    parser.add_argument("--collapse-internet", action="store_true", help="Collapse no internet service categories")
    args = parser.parse_args()

    config = {
        "drop_collinear": args.drop_collinear,
        "drop_noise": args.drop_noise,
        "use_smote": args.smote,
        "use_class_weight": not args.no_class_weight,
        "collapse_internet": args.collapse_internet,
        "models": ["Logistic Regression", "Random Forest", "XGBoost", "LightGBM", "Ensemble (Voting)"]
    }
    metrics, best_params = run_training(config=config)

    output = {
        "status": "success",
        "artifacts": {
            "models_dir": MODELS_DIR,
            "preprocessed_csv": os.path.join(ARTIFACTS_DIR, "preprocessed.csv"),
            "metrics_json": os.path.join(ARTIFACTS_DIR, "metrics.json"),
        },
        "best_params": best_params,
        "metrics": metrics,
        "commit": "pipeline: add configurable class weighting and category collapsing support",
    }
    print("\n---FINAL JSON---")
    sys.stdout.flush()
    import json as _json
    print(_json.dumps(output, indent=2))

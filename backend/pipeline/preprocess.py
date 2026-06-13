import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "WA_Fn-UseC_-Telco-Customer-Churn.csv")

NO_INTERNET_COLS = [
    "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies",
]


def load_raw_data():
    df = pd.read_csv(DATA_PATH)
    return df


def clean_data(df):
    df = df.copy()
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    # For new customers (tenure = 0), TotalCharges should be 0 instead of NaN.
    # This prevents dropping these rows.
    df["TotalCharges"] = df["TotalCharges"].fillna(0)
    df = df.dropna(subset=["Churn"])
    return df


def engineer_features(df, drop_redundant=False, collapse_internet=False):
    df = df.copy()

    if collapse_internet:
        for col in NO_INTERNET_COLS:
            df[col] = df[col].replace("No internet service", "No")

    services = ["PhoneService", "MultipleLines"] + NO_INTERNET_COLS
    df["service_count"] = df[services].apply(
        lambda r: sum(
            1 for v in r if v == "Yes" or v.startswith("Yes")
        ),
        axis=1,
    )

    if not drop_redundant:
        df["has_online_security"] = (df["OnlineSecurity"] == "Yes").astype(int)
        df["has_tech_support"] = (df["TechSupport"] == "Yes").astype(int)
        df["has_phone_service"] = (df["PhoneService"] == "Yes").astype(int)
        df["has_multiple_lines"] = (df["MultipleLines"] == "Yes").astype(int)
        df["has_multiple_services"] = (df["service_count"] > 1).astype(int)

        df["avg_charge_per_service"] = df["MonthlyCharges"] / (df["service_count"] + 1)
        df["avg_charge_per_tenure"] = df["TotalCharges"] / (df["tenure"] + 1)
        df["monthly_to_total_ratio"] = df["MonthlyCharges"] / (df["TotalCharges"] + 1)

        # 1. Automatic payment indicator
        df["is_automatic_payment"] = df["PaymentMethod"].str.contains("automatic").astype(int)
        
        # 2. Charges variance (actual vs expected total charges)
        df["expected_total_charges"] = df["MonthlyCharges"] * df["tenure"]
        df["charges_diff"] = df["TotalCharges"] - df["expected_total_charges"]
        df["charges_ratio"] = df["TotalCharges"] / (df["expected_total_charges"] + 1)

        # 3. Contract interactions
        df["is_month_to_month"] = (df["Contract"] == "Month-to-month").astype(int)
        df["senior_x_month_to_month"] = df["SeniorCitizen"] * df["is_month_to_month"]
        df["tenure_x_contract"] = df["tenure"] * df["is_month_to_month"]
        df["tenure_x_dependents"] = df["tenure"] * (df["Dependents"] == "Yes").astype(int)
        df["tenure_x_partner"] = df["tenure"] * (df["Partner"] == "Yes").astype(int)

        tenure_bins = [0, 12, 24, 48, 72, 999]
        df["tenure_bin"] = pd.cut(
            df["tenure"], bins=tenure_bins, labels=range(len(tenure_bins) - 1), right=False
        ).astype(int)
    else:
        # Avoid creating collinear duplicated features
        df["avg_charge_per_service"] = df["MonthlyCharges"] / (df["service_count"] + 1)
        df["monthly_to_total_ratio"] = df["MonthlyCharges"] / (df["TotalCharges"] + 1)
        df["is_automatic_payment"] = df["PaymentMethod"].str.contains("automatic").astype(int)
        
        # Keep charges diff but removeexpected_total_charges which is duplicated with TotalCharges
        df["charges_diff"] = df["TotalCharges"] - (df["MonthlyCharges"] * df["tenure"])
        
        df["is_month_to_month"] = (df["Contract"] == "Month-to-month").astype(int)
        df["senior_x_month_to_month"] = df["SeniorCitizen"] * df["is_month_to_month"]
        df["tenure_x_contract"] = df["tenure"] * df["is_month_to_month"]
        df["tenure_x_dependents"] = df["tenure"] * (df["Dependents"] == "Yes").astype(int)
        df["tenure_x_partner"] = df["tenure"] * (df["Partner"] == "Yes").astype(int)

    return df


def encode_features(df):
    df = df.copy()
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})
    customer_ids = df["customerID"]
    df = df.drop(columns=["customerID"])

    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if "Churn" in numerical_cols:
        numerical_cols.remove("Churn")

    categoricals = df.select_dtypes(include=["object"]).columns.tolist()
    if "Churn" in categoricals:
        categoricals.remove("Churn")

    df = pd.get_dummies(df, columns=categoricals, drop_first=True)
    return df, customer_ids


def scale_features(X_train, X_test):
    scaler = StandardScaler()
    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
    exclude = [c for c in numeric_cols if c.startswith(tuple([
        "gender_", "Partner_", "Dependents_", "PhoneService_",
        "MultipleLines_", "OnlineSecurity_", "OnlineBackup_",
        "DeviceProtection_", "TechSupport_", "StreamingTV_",
        "StreamingMovies_", "PaperlessBilling_", "Contract_",
        "InternetService_", "PaymentMethod_", "Churn",
        "is_month_to_month", "has_", "is_automatic_payment", "senior_x_month_to_month"
    ]))]
    scale_cols = [c for c in numeric_cols if c not in exclude]

    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    if scale_cols:
        X_train_scaled[scale_cols] = scaler.fit_transform(X_train[scale_cols])
        X_test_scaled[scale_cols] = scaler.transform(X_test[scale_cols])
    return X_train_scaled, X_test_scaled, scaler


def split_data(df):
    X = df.drop(columns=["Churn"])
    y = df["Churn"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    return X_train, X_test, y_train, y_test


def preprocess(drop_redundant=False, drop_noise=False, collapse_internet=False):
    df = load_raw_data()
    df = clean_data(df)
    df_raw = df.copy()
    df = engineer_features(df, drop_redundant=drop_redundant, collapse_internet=collapse_internet)
    df_encoded, customer_ids = encode_features(df)
    X_train, X_test, y_train, y_test = split_data(df_encoded)
    
    if drop_noise:
        # Find training samples with identical feature values but different labels
        train_df = X_train.copy()
        train_df["Churn"] = y_train
        feature_cols = X_train.columns.tolist()
        duplicates = train_df.duplicated(subset=feature_cols, keep=False)
        if duplicates.sum() > 0:
            dup_df = train_df[duplicates]
            grouped = dup_df.groupby(feature_cols)["Churn"].nunique()
            conflicting_indices = grouped[grouped > 1].index
            is_conflicting = train_df.set_index(feature_cols).index.isin(conflicting_indices)
            X_train = X_train[~is_conflicting]
            y_train = y_train[~is_conflicting]
            
    X_train, X_test, scaler = scale_features(X_train, X_test)

    preprocessed_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "artifacts", "preprocessed.csv"
    )
    preprocessed_df = df_encoded.copy()
    preprocessed_df["customerID"] = customer_ids.values
    preprocessed_df.to_csv(preprocessed_path, index=False)

    return X_train, X_test, y_train, y_test, df_encoded, customer_ids, df_raw, scaler

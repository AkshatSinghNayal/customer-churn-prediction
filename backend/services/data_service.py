from pipeline.utils import load_pickle, load_json
import pandas as pd


def get_summary():
    raw_df = load_pickle("raw_df.pkl")
    predictions = load_json("predictions.json")
    pred_df = pd.DataFrame(predictions)

    total = len(raw_df)
    churned = int(raw_df["Churn"].value_counts().get("Yes", 0))
    churn_rate = round(churned / total * 100, 2)

    high_risk = int((pred_df["churn_probability"] >= 0.7).sum())
    medium_risk = int(
        ((pred_df["churn_probability"] >= 0.4) & (pred_df["churn_probability"] < 0.7)).sum()
    )
    low_risk = int((pred_df["churn_probability"] < 0.4).sum())

    avg_tenure = round(raw_df["tenure"].mean(), 1)
    avg_monthly = round(raw_df["MonthlyCharges"].mean(), 2)
    avg_total = round(pd.to_numeric(raw_df["TotalCharges"], errors="coerce").mean(), 2)

    return {
        "total_customers": total,
        "churned": churned,
        "churn_rate": churn_rate,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "avg_tenure": avg_tenure,
        "avg_monthly_charges": avg_monthly,
        "avg_total_charges": avg_total,
    }


def get_customers(
    page=1,
    per_page=20,
    churn=None,
    tenure_min=None,
    tenure_max=None,
    contract=None,
    internet_service=None,
    payment_method=None,
    risk_band=None,
):
    raw_df = load_pickle("raw_df.pkl")
    predictions = load_json("predictions.json")
    pred_df = pd.DataFrame(predictions)

    merged = raw_df.merge(pred_df, on="customerID", how="left")

    if churn is not None:
        merged = merged[merged["Churn"] == churn]
    if tenure_min is not None:
        merged = merged[merged["tenure"] >= int(tenure_min)]
    if tenure_max is not None:
        merged = merged[merged["tenure"] <= int(tenure_max)]
    if contract is not None:
        merged = merged[merged["Contract"] == contract]
    if internet_service is not None:
        merged = merged[merged["InternetService"] == internet_service]
    if payment_method is not None:
        merged = merged[merged["PaymentMethod"] == payment_method]
    if risk_band is not None:
        merged = merged[merged["risk_band"] == risk_band]

    total = len(merged)
    total_pages = max(1, (total + per_page - 1) // per_page)
    start = (page - 1) * per_page
    end = start + per_page
    page_data = merged.iloc[start:end]

    columns = [
        "customerID", "gender", "SeniorCitizen", "Partner", "Dependents",
        "tenure", "PhoneService", "MultipleLines", "InternetService",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
        "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling",
        "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn",
        "churn_probability", "risk_band", "recommended_action",
    ]

    records = []
    for _, row in page_data.iterrows():
        record = {}
        for col in columns:
            val = row.get(col)
            if isinstance(val, (float, int)):
                if pd.isna(val):
                    val = None
            record[col] = val
        records.append(record)

    return {
        "customers": records,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


def get_analytics():
    raw_df = load_pickle("raw_df.pkl")

    def churn_breakdown(column):
        group = raw_df.groupby(column)["Churn"].apply(
            lambda x: (x == "Yes").sum()
        ).reset_index(name="churned")
        total = raw_df.groupby(column)["Churn"].count().reset_index(name="total")
        merged = group.merge(total, on=column)
        merged["rate"] = (merged["churned"] / merged["total"] * 100).round(2)
        return merged.to_dict(orient="records")

    tenure_bins = [0, 12, 24, 48, 72, 1000]
    tenure_labels = ["0-12", "12-24", "24-48", "48-72", "72+"]
    raw_df["tenure_bucket"] = pd.cut(raw_df["tenure"], bins=tenure_bins, labels=tenure_labels, right=False)

    charge_bins = [0, 30, 60, 90, 1000]
    charge_labels = ["< $30", "$30–$60", "$60–$90", "$90+"]
    raw_df["monthly_charge_band"] = pd.cut(raw_df["MonthlyCharges"], bins=charge_bins, labels=charge_labels, right=False)

    raw_df["SeniorCitizen"] = raw_df["SeniorCitizen"].map({0: "No", 1: "Yes"})

    return {
        "by_contract": churn_breakdown("Contract"),
        "by_internet_service": churn_breakdown("InternetService"),
        "by_payment_method": churn_breakdown("PaymentMethod"),
        "by_senior_citizen": churn_breakdown("SeniorCitizen"),
        "by_tenure_bucket": churn_breakdown("tenure_bucket"),
        "by_monthly_charge_band": churn_breakdown("monthly_charge_band"),
    }

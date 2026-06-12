import json
from datetime import datetime, timezone
from pipeline.utils import load_json, save_json, artifact_exists

ALERTS_FILE = "alerts.json"
ALERT_THRESHOLD = 0.7


def _generate_alerts():
    predictions = load_json("predictions.json")
    high_risk = [p for p in predictions if p["churn_probability"] >= ALERT_THRESHOLD]
    alerts = []
    for p in high_risk[:50]:
        alert = {
            "id": f"alert-{p['customerID']}",
            "customer_id": p["customerID"],
            "churn_probability": p["churn_probability"],
            "risk_band": "High",
            "severity": "critical",
            "title": f"High churn risk: {p['customerID']}",
            "message": f"Customer {p['customerID']} has a {round(p['churn_probability'] * 100, 1)}% churn probability. Recommended action: {p['recommended_action']}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "read": False,
            "dismissed": False,
        }
        alerts.append(alert)
    return alerts


def get_or_generate_alerts():
    if artifact_exists(ALERTS_FILE):
        alerts = load_json(ALERTS_FILE)
        return alerts
    alerts = _generate_alerts()
    save_json(alerts, ALERTS_FILE)
    return alerts


def get_alerts(read=None, severity=None):
    alerts = get_or_generate_alerts()
    filtered = [a for a in alerts if not a["dismissed"]]
    if read is not None:
        filtered = [a for a in filtered if a["read"] == read]
    if severity is not None:
        filtered = [a for a in filtered if a["severity"] == severity]
    return filtered


def update_alert(alert_id, read=None, dismissed=None):
    alerts = get_or_generate_alerts()
    for alert in alerts:
        if alert["id"] == alert_id:
            if read is not None:
                alert["read"] = read
            if dismissed is not None:
                alert["dismissed"] = dismissed
            save_json(alerts, ALERTS_FILE)
            return alert
    return None

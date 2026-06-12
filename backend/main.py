from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pipeline.train import get_or_train
from services import data_service, model_service, alert_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_or_train()
    yield


app = FastAPI(title="ChurnSight API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/summary")
def summary():
    return data_service.get_summary()


@app.get("/api/customers")
def customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    churn: str = None,
    tenure_min: int = None,
    tenure_max: int = None,
    contract: str = None,
    internet_service: str = None,
    payment_method: str = None,
    risk_band: str = None,
):
    return data_service.get_customers(
        page=page,
        per_page=per_page,
        churn=churn,
        tenure_min=tenure_min,
        tenure_max=tenure_max,
        contract=contract,
        internet_service=internet_service,
        payment_method=payment_method,
        risk_band=risk_band,
    )


@app.get("/api/models")
def models():
    return model_service.get_all_models()


@app.get("/api/models/{name}")
def model_detail(name: str):
    result = model_service.get_model_detail(name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Model '{name}' not found")
    return result


@app.get("/api/feature-importance")
def feature_importance():
    return model_service.get_feature_importance()


@app.get("/api/predictions")
def predictions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_band: str = None,
    sort_by: str = None,
):
    return model_service.get_all_predictions(
        page=page, per_page=per_page, risk_band=risk_band, sort_by=sort_by
    )


@app.get("/api/predict/{customer_id}")
def predict(customer_id: str):
    result = model_service.predict_single(customer_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found")
    return result


@app.post("/api/predict-custom")
def predict_custom(data: dict = Body(...)):
    return model_service.predict_custom(data)


@app.get("/api/analytics")
def analytics():
    return data_service.get_analytics()


@app.get("/api/alerts")
def alerts(read: bool = None, severity: str = None):
    return alert_service.get_alerts(read=read, severity=severity)


@app.patch("/api/alerts/{alert_id}")
def update_alert(alert_id: str, read: bool = None, dismissed: bool = None):
    result = alert_service.update_alert(alert_id, read=read, dismissed=dismissed)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return result


@app.post("/api/retrain")
def retrain():
    import os
    import shutil
    from pipeline.utils import ARTIFACTS_DIR
    for f in os.listdir(ARTIFACTS_DIR):
        fp = os.path.join(ARTIFACTS_DIR, f)
        if os.path.isfile(fp):
            os.remove(fp)
    from pipeline.train import run_training
    return run_training()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

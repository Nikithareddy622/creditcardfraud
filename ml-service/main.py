import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

# Auto-train model if file doesn't exist yet
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "fraud_model.joblib")

if not os.path.exists(MODEL_PATH):
    print("Model file not found. Running training script...")
    from train import train_and_save_model
    train_and_save_model()

# Load model artifact
artifact = joblib.load(MODEL_PATH)
model = artifact['model']
encoders = artifact['encoders']
scaler = artifact['scaler']
feature_names = artifact['feature_names']
categorical_cols = artifact['categorical_cols']
numerical_cols = artifact['numerical_cols']

app = FastAPI(
    title="FalconShield AI ML Microservice",
    description="Real-Time Credit Card Fraud Detection & Risk Scoring Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionInput(BaseModel):
    amount: float = Field(..., example=1250.00)
    merchantCategory: str = Field(..., example="electronics")
    cardholderSpendingPattern: str = Field(..., example="unusual")
    transactionFrequency: int = Field(..., example=12)
    location: str = Field(..., example="international_high_risk")
    timeOfDay: int = Field(..., example=2) # 0-23
    deviceType: str = Field(..., example="unknown_device")
    previousFraudHistory: int = Field(0, example=0) # 0 or 1

class BatchTransactionInput(BaseModel):
    transactions: List[TransactionInput]

def preprocess_single(data: TransactionInput):
    row_dict = data.dict()
    processed_dict = {}
    
    # Process categorical columns with label encoders
    for col in categorical_cols:
        val = str(row_dict.get(col, ''))
        le = encoders[col]
        if val in le.classes_:
            processed_dict[col] = float(le.transform([val])[0])
        else:
            processed_dict[col] = 0.0
            
    # Process numerical columns
    for col in numerical_cols:
        processed_dict[col] = float(row_dict.get(col, 0))
        
    # Build clean numeric DataFrame
    df = pd.DataFrame([processed_dict])
    df[numerical_cols] = scaler.transform(df[numerical_cols])
    return df[feature_names]

def evaluate_fraud_risk(prob: float, anomaly_score: float):
    if prob >= 0.85:
        risk_level = "Critical Risk"
        recommended_action = "Block Transaction"
    elif prob >= 0.60:
        risk_level = "High Risk"
        recommended_action = "Flag for Fraud Analyst"
    elif prob >= 0.30:
        risk_level = "Medium Risk"
        recommended_action = "Review Transaction"
    else:
        risk_level = "Low Risk"
        recommended_action = "Approve Transaction"
        
    # Confidence calculation based on probability distance from 0.5
    confidence = round(float(abs(prob - 0.5) * 2 * 100), 2)
    if confidence < 50:
        confidence = round(50 + confidence * 0.8, 2)
        
    return risk_level, recommended_action, confidence

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FalconShield AI ML Microservice",
        "modelLoaded": True
    }

@app.get("/model-info")
def get_model_info():
    return {
        "modelType": "Random Forest Classifier",
        "nEstimators": model.n_estimators,
        "featureCount": len(feature_names),
        "featureNames": feature_names,
        "supportedCategories": {col: list(encoders[col].classes_) for col in categorical_cols}
    }

@app.post("/predict")
def predict_fraud(tx: TransactionInput):
    try:
        features_df = preprocess_single(tx)
        
        # Predict probability
        prob = float(model.predict_proba(features_df)[0][1])
        prediction = "Fraudulent" if prob >= 0.50 else "Legitimate"
        
        # Heuristic anomaly score calculation based on extreme feature values
        anomaly_components = [
            min(tx.amount / 5000.0, 1.0) * 0.35,
            (1.0 if tx.location == 'international_high_risk' else 0.1) * 0.25,
            (1.0 if tx.cardholderSpendingPattern in ['unusual', 'high_velocity'] else 0.1) * 0.20,
            (min(tx.transactionFrequency / 20.0, 1.0)) * 0.20
        ]
        anomaly_score = round(float(sum(anomaly_components)), 4)
        
        risk_level, recommended_action, confidence = evaluate_fraud_risk(prob, anomaly_score)
        
        return {
            "fraudProbability": round(prob, 4),
            "prediction": prediction,
            "riskLevel": risk_level,
            "confidence": confidence,
            "anomalyScore": anomaly_score,
            "recommendedAction": recommended_action,
            "featuresEvaluated": tx.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/batch-predict")
def batch_predict(batch: BatchTransactionInput):
    results = []
    for tx in batch.transactions:
        res = predict_fraud(tx)
        results.append(res)
    return {"predictions": results, "count": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import axios from 'axios';
import { config } from '../config';

export interface MLPredictionPayload {
  amount: number;
  merchantCategory: string;
  cardholderSpendingPattern: string;
  transactionFrequency: number;
  location: string;
  timeOfDay: number;
  deviceType: string;
  previousFraudHistory: number;
}

export interface MLPredictionResult {
  fraudProbability: number;
  prediction: string;
  riskLevel: string;
  confidence: number;
  anomalyScore: number;
  recommendedAction: string;
}

export async function predictFraudML(payload: MLPredictionPayload): Promise<MLPredictionResult> {
  try {
    const response = await axios.post(`${config.mlServiceUrl}/predict`, payload, { timeout: 3000 });
    return response.data;
  } catch (error: any) {
    console.warn(`[ML Service Fallback] Could not reach ML Microservice at ${config.mlServiceUrl}. Using heuristic engine fallback.`);
    
    // Heuristic fallback calculation
    let prob = 0.05;
    if (payload.amount > 3000) prob += 0.35;
    if (payload.location === 'international_high_risk') prob += 0.40;
    if (payload.cardholderSpendingPattern === 'unusual' || payload.cardholderSpendingPattern === 'high_velocity') prob += 0.25;
    if (payload.deviceType === 'unknown_device') prob += 0.15;
    if (payload.previousFraudHistory === 1) prob += 0.30;
    
    prob = Math.min(Math.max(prob, 0.01), 0.98);
    
    let riskLevel = 'Low Risk';
    let action = 'Approve Transaction';
    if (prob >= 0.85) {
      riskLevel = 'Critical Risk';
      action = 'Block Transaction';
    } else if (prob >= 0.60) {
      riskLevel = 'High Risk';
      action = 'Flag for Fraud Analyst';
    } else if (prob >= 0.30) {
      riskLevel = 'Medium Risk';
      action = 'Review Transaction';
    }
    
    return {
      fraudProbability: Number(prob.toFixed(4)),
      prediction: prob >= 0.50 ? 'Fraudulent' : 'Legitimate',
      riskLevel: riskLevel,
      confidence: Number((80 + prob * 15).toFixed(2)),
      anomalyScore: Number((prob * 0.9).toFixed(4)),
      recommendedAction: action
    };
  }
}

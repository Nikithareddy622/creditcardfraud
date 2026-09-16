import { prisma } from '../db/prisma';

export interface RuleEvaluationResult {
  triggeredRules: string[];
  overrideAction?: string;
  forceAlert: boolean;
  alertSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface BehavioralFraudAssessment {
  fraudProbability: number;
  riskScore: number; // 0 - 100
  prediction: 'Legitimate' | 'Fraud';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  reason: string[];
  recommendedAction: string;
}

export async function evaluateFraudRules(transaction: {
  amount: number;
  country: string;
  transactionDate: Date;
}): Promise<RuleEvaluationResult> {
  const triggeredRules: string[] = [];
  let overrideAction: string | undefined = undefined;
  let forceAlert = false;
  let alertSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | undefined = undefined;

  try {
    const rules = await prisma.fraudRule.findMany({ where: { isEnabled: true } });

    for (const rule of rules) {
      if (rule.conditionType === 'MAX_AMOUNT') {
        const thresholdVal = parseFloat(rule.threshold);
        if (!isNaN(thresholdVal) && transaction.amount >= thresholdVal) {
          triggeredRules.push(`Amount ($${transaction.amount}) exceeds rule limit ($${thresholdVal})`);
          if (rule.action === 'BLOCK') overrideAction = 'BLOCKED';
          forceAlert = true;
          alertSeverity = 'HIGH';
        }
      } else if (rule.conditionType === 'HIGH_RISK_COUNTRY') {
        const highRiskList = rule.threshold.split(',').map((c: string) => c.trim().toLowerCase());
        if (highRiskList.includes(transaction.country.toLowerCase())) {
          triggeredRules.push(`Origin country (${transaction.country}) matches high-risk rule list`);
          overrideAction = 'BLOCKED';
          forceAlert = true;
          alertSeverity = 'CRITICAL';
        }
      } else if (rule.conditionType === 'NIGHT_TRANSACTION') {
        const hours = new Date(transaction.transactionDate).getHours();
        if (hours >= 0 && hours <= 5) {
          triggeredRules.push(`Late night transaction activity window (12:00 AM - 05:00 AM)`);
          forceAlert = true;
          if (!alertSeverity) alertSeverity = 'MEDIUM';
        }
      }
    }
  } catch (err) {
    console.error('Error evaluating fraud rules:', err);
  }

  return {
    triggeredRules,
    overrideAction,
    forceAlert,
    alertSeverity
  };
}

export async function evaluateBehavioralFraud(params: {
  customerId?: string;
  amount: number;
  merchantCategory: string;
  city: string;
  country: string;
  deviceType: string;
  transactionTime?: string;
  mlFraudProb?: number;
}): Promise<BehavioralFraudAssessment> {
  let scorePoints = 0;
  const reasons: string[] = [];

  let customer = null;
  if (params.customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: params.customerId },
      include: {
        transactions: {
          take: 10,
          orderBy: { transactionDate: 'desc' }
        }
      }
    });
  }

  // 1. ML Probability Baseline Contribution
  const mlProb = params.mlFraudProb ?? 0.15;
  scorePoints += Math.round(mlProb * 40); // Max 40 points from ML model

  // 2. Transaction Amount vs Average Spend & Hard Limit
  if (params.amount >= 5000) {
    scorePoints += 30;
    reasons.push(`Transaction amount ($${params.amount.toLocaleString()}) exceeds high-risk threshold ($5,000)`);
  } else if (customer && customer.averageSpend && customer.averageSpend > 0) {
    if (params.amount >= customer.averageSpend * 3) {
      scorePoints += 25;
      reasons.push(`Transaction amount ($${params.amount.toLocaleString()}) is 3x higher than average customer spend ($${customer.averageSpend.toLocaleString()})`);
    }
  }

  // 3. Location Anomaly Check (New Country / City)
  if (customer) {
    const knownLocs = (customer.knownLocations || customer.location || '').toLowerCase();
    const currentLoc = `${params.city}, ${params.country}`.toLowerCase();
    const currentCountry = params.country.toLowerCase();

    if (!knownLocs.includes(currentCountry)) {
      scorePoints += 25;
      reasons.push(`Unrecognized new country detected (${params.country}) outside historical profile`);
    } else if (!knownLocs.includes(currentLoc)) {
      scorePoints += 15;
      reasons.push(`Unrecognized new location detected (${params.city}, ${params.country})`);
    }
  } else {
    // If no customer record provided, check international high risk
    if (['russia', 'nigeria', 'north korea', 'turkey'].includes(params.country.toLowerCase())) {
      scorePoints += 25;
      reasons.push(`High-risk international location detected (${params.country})`);
    }
  }

  // 4. Device Anomaly Check (New Device)
  if (customer) {
    const knownDevs = (customer.knownDevices || customer.registeredDeviceType || '').toLowerCase();
    const currentDev = params.deviceType.toLowerCase();

    if (!knownDevs.includes(currentDev) && currentDev !== 'mobile_app' && currentDev !== 'web_browser') {
      scorePoints += 20;
      reasons.push(`Unregistered or new device detected (${params.deviceType})`);
    }
  } else if (params.deviceType === 'unknown_device') {
    scorePoints += 15;
    reasons.push(`Unverified / unknown device signature detected`);
  }

  // 5. Night Transaction Check (12:00 AM - 5:00 AM)
  let hour = new Date().getHours();
  if (params.transactionTime) {
    const match = params.transactionTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hour = h;
    }
  }
  if (hour >= 0 && hour <= 5) {
    scorePoints += 15;
    reasons.push(`Night transaction time detected (${params.transactionTime || hour + ':00 AM'}) between 12:00 AM - 05:00 AM`);
  }

  // 6. Historical Fraud Record Check
  if (customer && (customer.fraudHistoryCount > 0 || customer.fraudCount > 0)) {
    scorePoints += 20;
    reasons.push(`Customer profile has ${customer.fraudHistoryCount || customer.fraudCount} historical fraud incident(s) on record`);
  }

  // 7. Transaction Velocity Check
  if (customer && customer.transactions) {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = customer.transactions.filter(t => new Date(t.transactionDate) >= tenMinsAgo).length;
    if (recentCount >= 5) {
      scorePoints += 25;
      reasons.push(`High transaction velocity detected (${recentCount} transactions within 10 minutes)`);
    }
  }

  // Calculate Final Risk Score (0 - 100)
  const finalRiskScore = Math.min(Math.max(scorePoints, 5), 100);
  const fraudProbability = Number((finalRiskScore / 100).toFixed(2));

  // Risk Classification Tiers:
  // 0-25 -> Low Risk
  // 26-50 -> Medium Risk
  // 51-75 -> High Risk
  // 76-100 -> Critical Risk
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let recommendedAction = 'Approve Transaction';
  let prediction: 'Legitimate' | 'Fraud' = 'Legitimate';

  if (finalRiskScore >= 76) {
    riskLevel = 'Critical';
    prediction = 'Fraud';
    recommendedAction = 'Block Transaction';
  } else if (finalRiskScore >= 51) {
    riskLevel = 'High';
    prediction = 'Fraud';
    recommendedAction = 'Flag for Fraud Analyst';
  } else if (finalRiskScore >= 26) {
    riskLevel = 'Medium';
    prediction = 'Legitimate';
    recommendedAction = 'Review Transaction';
  } else {
    riskLevel = 'Low';
    prediction = 'Legitimate';
    recommendedAction = 'Approve Transaction';
  }

  if (reasons.length === 0) {
    reasons.push('Transaction matches normal customer spending pattern and verified device/location baseline');
  }

  // Confidence calculation (distance from 50 border)
  const confidence = Math.min(Math.max(Math.round(75 + Math.abs(finalRiskScore - 50) * 0.4), 82), 99);

  return {
    fraudProbability,
    riskScore: finalRiskScore,
    prediction,
    riskLevel,
    confidence,
    reason: reasons,
    recommendedAction
  };
}

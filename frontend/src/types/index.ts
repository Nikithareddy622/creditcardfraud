export type UserRole = 'ADMIN' | 'FRAUD_ANALYST' | 'CUSTOMER_SUPPORT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Customer {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  cardNumber: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  location: string;
  occupation?: string;
  monthlyIncome?: number;
  averageSpend?: number;
  registeredDeviceType?: string;
  knownDevices?: string;
  knownLocations?: string;
  riskScore: number;
  fraudHistoryCount?: number;
  totalSpent: number;
  fraudCount: number;
  createdAt: string;
  transactions?: Transaction[];
}

export interface FraudPredictionResult {
  fraudProbability: number;
  riskScore: number;
  prediction: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  confidence: number;
  reason: string[];
  recommendedAction: string;
}

export type TransactionStatus = 'APPROVED' | 'FLAGGED' | 'BLOCKED';
export type RiskCategory = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';

export interface Transaction {
  id: string;
  customerId: string;
  customer?: Customer;
  amount: number;
  merchant: string;
  merchantCategory: string;
  transactionDate: string;
  city: string;
  country: string;
  deviceType: string;
  status: TransactionStatus;
  fraudScore: number;
  prediction: string;
  riskCategory: RiskCategory;
  createdAt: string;
  alerts?: FraudAlert[];
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface FraudAlert {
  id: string;
  transactionId: string;
  transaction?: Transaction;
  severity: AlertSeverity;
  reason?: string;
  assignedTo?: string;
  status: AlertStatus;
  notes?: string;
  createdAt: string;
}

export interface FraudRule {
  id: string;
  ruleName: string;
  conditionType: string;
  threshold: string;
  action: 'BLOCK' | 'FLAG' | 'ALERT';
  isEnabled: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface MLPrediction {
  fraudProbability: number;
  prediction: string;
  riskLevel: RiskCategory;
  confidence: number;
  anomalyScore: number;
  recommendedAction: string;
}

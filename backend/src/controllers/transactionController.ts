import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { predictFraudML } from '../services/mlService';
import { evaluateFraudRules } from '../services/rulesEngine';
import { broadcastTransactionEvent } from '../services/socketService';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { status, riskCategory, search, limit = '50', page = '1' } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const where: any = {};
    if (status) where.status = status as string;
    if (riskCategory) where.riskCategory = riskCategory as string;
    if (search) {
      where.OR = [
        { merchant: { contains: search as string } },
        { city: { contains: search as string } },
        { country: { contains: search as string } },
        { customer: { customerName: { contains: search as string } } }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { customer: true, alerts: true },
        orderBy: { transactionDate: 'desc' },
        take,
        skip
      }),
      prisma.transaction.count({ where })
    ]);

    return res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { customer: true, alerts: true }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch transaction details' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      amount,
      merchant,
      merchantCategory,
      city,
      country,
      deviceType,
      cardholderSpendingPattern = 'normal',
      transactionFrequency = 1,
      timeOfDay = new Date().getHours()
    } = req.body;

    if (!customerId || !amount || !merchant || !merchantCategory || !city || !country || !deviceType) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    let customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      // Auto-create customer if demo ID passed
      customer = await prisma.customer.create({
        data: {
          id: customerId,
          customerName: req.body.customerName || 'Standard Cardholder',
          cardNumber: req.body.cardNumber || '4111-****-****-9988',
          location: `${city}, ${country}`
        }
      });
    }

    // 1. Evaluate with Python ML Microservice
    const mlPayload = {
      amount: parseFloat(amount),
      merchantCategory,
      cardholderSpendingPattern,
      transactionFrequency: parseInt(transactionFrequency, 10),
      location: country.toLowerCase().includes('usa') || country.toLowerCase().includes('uk') ? 'domestic_same_city' : 'international_high_risk',
      timeOfDay: parseInt(timeOfDay, 10),
      deviceType,
      previousFraudHistory: customer.fraudCount > 0 ? 1 : 0
    };

    const mlResult = await predictFraudML(mlPayload);

    // 2. Evaluate Automated Rules Engine
    const ruleResult = await evaluateFraudRules({
      amount: parseFloat(amount),
      country,
      transactionDate: new Date()
    });

    // 3. Determine final status
    let status = 'APPROVED';
    if (ruleResult.overrideAction) {
      status = ruleResult.overrideAction;
    } else if (mlResult.riskLevel === 'Critical Risk') {
      status = 'BLOCKED';
    } else if (mlResult.riskLevel === 'High Risk' || mlResult.riskLevel === 'Medium Risk') {
      status = 'FLAGGED';
    }

    // 4. Save Transaction to DB
    const transaction = await prisma.transaction.create({
      data: {
        customerId: customer.id,
        amount: parseFloat(amount),
        merchant,
        merchantCategory,
        transactionDate: new Date(),
        city,
        country,
        deviceType,
        status,
        fraudScore: mlResult.fraudProbability,
        prediction: mlResult.prediction,
        riskCategory: mlResult.riskLevel
      },
      include: { customer: true }
    });

    // 5. Create Fraud Alert if High/Critical Risk or rule forced
    let generatedAlert = null;
    if (status === 'BLOCKED' || status === 'FLAGGED' || ruleResult.forceAlert) {
      let severity = 'MEDIUM';
      if (mlResult.riskLevel === 'Critical Risk' || ruleResult.alertSeverity === 'CRITICAL') severity = 'CRITICAL';
      else if (mlResult.riskLevel === 'High Risk' || ruleResult.alertSeverity === 'HIGH') severity = 'HIGH';

      generatedAlert = await prisma.fraudAlert.create({
        data: {
          transactionId: transaction.id,
          severity,
          status: 'OPEN',
          notes: `ML Prob: ${mlResult.fraudProbability} (${mlResult.riskLevel}). ${ruleResult.triggeredRules.join('. ')}`
        }
      });

      // Update customer metrics
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fraudCount: { increment: 1 },
          riskScore: Math.max(customer.riskScore, mlResult.fraudProbability)
        }
      });
    }

    // 6. Broadcast event over WebSockets
    broadcastTransactionEvent({
      type: 'NEW_TRANSACTION',
      payload: { ...transaction, alert: generatedAlert, mlResult }
    });

    return res.status(201).json({
      transaction,
      mlAssessment: mlResult,
      ruleEvaluation: ruleResult,
      alert: generatedAlert
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Transaction creation failed' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'FLAGGED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: { customer: true }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action: 'TRANSACTION_STATUS_UPDATE',
          details: `Changed transaction ${id} status to ${status}`
        }
      });
    }

    broadcastTransactionEvent({
      type: 'TRANSACTION_UPDATED',
      payload: updated
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Update failed' });
  }
};

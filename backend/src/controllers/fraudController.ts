import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { predictFraudML } from '../services/mlService';
import { AuthRequest } from '../middleware/auth';

import { evaluateBehavioralFraud } from '../services/rulesEngine';

export const predictFraudProxy = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      amount,
      merchantCategory = 'electronics',
      city = 'New York',
      country = 'USA',
      deviceType = 'mobile_app',
      transactionTime
    } = req.body;

    if (amount === undefined || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: 'Valid Transaction Amount is required' });
    }

    let mlProb = 0.15;
    try {
      const mlRes = await predictFraudML({
        amount: parseFloat(amount),
        merchantCategory: merchantCategory || 'electronics',
        cardholderSpendingPattern: 'normal',
        transactionFrequency: 5,
        location: `${city}, ${country}`.toLowerCase().includes('russia') ? 'international_high_risk' : 'domestic_same_city',
        timeOfDay: 12,
        deviceType: deviceType || 'mobile_app',
        previousFraudHistory: 0
      });
      if (mlRes && mlRes.fraudProbability !== undefined) {
        mlProb = mlRes.fraudProbability;
      }
    } catch (e) {
      console.warn('ML Microservice fallback triggered');
    }

    const assessment = await evaluateBehavioralFraud({
      customerId,
      amount: parseFloat(amount),
      merchantCategory: merchantCategory || 'electronics',
      city: city || 'New York',
      country: country || 'USA',
      deviceType: deviceType || 'mobile_app',
      transactionTime,
      mlFraudProb: mlProb
    });

    return res.json(assessment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Prediction failed' });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { status, severity, page = '1', limit = '50' } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const where: any = {};
    if (status) where.status = status as string;
    if (severity) where.severity = severity as string;

    const [alerts, total] = await Promise.all([
      prisma.fraudAlert.findMany({
        where,
        include: {
          transaction: {
            include: { customer: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.fraudAlert.count({ where })
    ]);

    return res.json({
      alerts,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
};

export const updateAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    const existingAlert = await prisma.fraudAlert.findUnique({ where: { id } });
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updated = await prisma.fraudAlert.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(notes !== undefined && { notes })
      },
      include: {
        transaction: {
          include: { customer: true }
        }
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action: 'ALERT_UPDATED',
          details: `Updated alert ${id} to status=${status || existingAlert.status}`
        }
      });
    }

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update alert' });
  }
};

export const getFraudAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      totalTransactions,
      fraudulentTransactions,
      blockedTransactions,
      flaggedTransactions,
      totalCustomers,
      highRiskCustomersCount,
      openAlertsCount,
      recentlyAddedCustomers,
      topRiskCustomers,
      latestPredictions
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { prediction: { in: ['Fraud', 'Fraudulent'] } } }),
      prisma.transaction.count({ where: { status: 'BLOCKED' } }),
      prisma.transaction.count({ where: { status: 'FLAGGED' } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { riskScore: { gte: 50 } } }),
      prisma.fraudAlert.count({ where: { status: 'OPEN' } }),
      prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.customer.findMany({
        orderBy: { riskScore: 'desc' },
        take: 5
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
      })
    ]);

    const fraudRate = totalTransactions > 0 
      ? Number(((fraudulentTransactions / totalTransactions) * 100).toFixed(2)) 
      : 0;

    // Group transactions by Risk Category
    const riskDistributionRaw = await prisma.transaction.groupBy({
      by: ['riskCategory'],
      _count: { id: true }
    });

    const riskDistribution = riskDistributionRaw.map((r: any) => ({
      name: r.riskCategory,
      count: r._count.id
    }));

    // Group by Merchant Category
    const categoryBreakdownRaw = await prisma.transaction.groupBy({
      by: ['merchantCategory'],
      _count: { id: true },
      _sum: { amount: true }
    });

    const categoryBreakdown = categoryBreakdownRaw.map((c: any) => ({
      category: c.merchantCategory,
      count: c._count.id,
      totalAmount: c._sum.amount || 0
    }));

    // Group by Country (Geographic heatmap distribution)
    const countryBreakdownRaw = await prisma.transaction.groupBy({
      by: ['country'],
      _count: { id: true }
    });

    const countryBreakdown = countryBreakdownRaw.map((c: any) => ({
      country: c.country,
      count: c._count.id
    }));

    // Group by Device Type
    const deviceBreakdownRaw = await prisma.transaction.groupBy({
      by: ['deviceType'],
      _count: { id: true }
    });

    const deviceBreakdown = deviceBreakdownRaw.map((d: any) => ({
      device: d.deviceType,
      count: d._count.id
    }));

    // Sample timeline trends for charts
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 20
    });

    return res.json({
      kpis: {
        totalTransactions,
        fraudulentTransactions,
        blockedTransactions,
        flaggedTransactions,
        fraudRatePercent: fraudRate,
        totalCustomers,
        highRiskCustomersCount,
        openAlertsCount
      },
      recentlyAddedCustomers,
      topRiskCustomers,
      latestPredictions,
      charts: {
        riskDistribution,
        categoryBreakdown,
        countryBreakdown,
        deviceBreakdown,
        recentStream: recentTransactions
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate analytics' });
  }
};

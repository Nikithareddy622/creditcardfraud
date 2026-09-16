import { Request, Response } from 'express';
import { prisma } from '../db/prisma';

function formatCardNumber(rawCard: string): string {
  const digits = rawCard.replace(/\D/g, '');
  if (digits.length >= 12) {
    const first4 = digits.slice(0, 4);
    const last4 = digits.slice(-4);
    return `${first4}-****-****-${last4}`;
  }
  return rawCard || '4000-****-****-0000';
}

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, highRiskOnly, limit = '50', page = '1' } = req.query;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const where: any = {};
    if (highRiskOnly === 'true') {
      where.riskScore = { gte: 50 };
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } },
        { cardNumber: { contains: search as string } },
        { location: { contains: search as string } },
        { city: { contains: search as string } },
        { country: { contains: search as string } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { transactions: true } }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      prisma.customer.count({ where })
    ]);

    return res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          include: { alerts: true }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const totalTransactions = customer.transactions.length;
    const fraudTransactions = customer.transactions.filter(t => t.prediction === 'Fraud' || t.prediction === 'Fraudulent').length;
    const blockedTransactions = customer.transactions.filter(t => t.status === 'BLOCKED').length;
    const totalSpent = customer.transactions.reduce((acc, t) => acc + t.amount, 0);
    const avgTransactionAmount = totalTransactions > 0 ? totalSpent / totalTransactions : (customer.averageSpend || 0);

    // Extract all alerts for this customer across transactions
    const alerts = customer.transactions.flatMap(t => t.alerts);

    // Known locations & devices array conversion
    const knownLocationsList = (customer.knownLocations || customer.location || '')
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    const knownDevicesList = (customer.knownDevices || customer.registeredDeviceType || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    customer.transactions.forEach(t => {
      categoryTotals[t.merchantCategory] = (categoryTotals[t.merchantCategory] || 0) + t.amount;
    });

    return res.json({
      customer,
      alerts,
      knownLocations: knownLocationsList,
      knownDevices: knownDevicesList,
      behavioralAnalytics: {
        totalTransactions,
        fraudTransactions,
        blockedTransactions,
        totalSpent: Number(totalSpent.toFixed(2)),
        avgTransactionAmount: Number(avgTransactionAmount.toFixed(2)),
        categoryBreakdown: categoryTotals
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customer profile' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      cardNumber,
      age,
      gender,
      city,
      state,
      country,
      occupation,
      monthlyIncome,
      averageSpend,
      registeredDeviceType,
      knownDevices,
      knownLocations,
      riskScore,
      fraudHistoryCount
    } = req.body;

    if (!customerName || !cardNumber) {
      return res.status(400).json({ error: 'Customer Name and Card Number are required' });
    }

    const formattedCity = city || 'New York';
    const formattedCountry = country || 'USA';
    const locationStr = `${formattedCity}, ${formattedCountry}`;

    const newCustomer = await prisma.customer.create({
      data: {
        customerName,
        email: email || `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: phone || '+1 (555) 000-0000',
        cardNumber: formatCardNumber(cardNumber),
        age: age ? parseInt(age, 10) : 35,
        gender: gender || 'Unspecified',
        city: formattedCity,
        state: state || '',
        country: formattedCountry,
        location: locationStr,
        occupation: occupation || 'Professional',
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        averageSpend: averageSpend ? parseFloat(averageSpend) : 1000,
        registeredDeviceType: registeredDeviceType || 'mobile_app',
        knownDevices: knownDevices || registeredDeviceType || 'mobile_app',
        knownLocations: knownLocations || locationStr,
        riskScore: riskScore !== undefined ? parseFloat(riskScore) : 15,
        fraudHistoryCount: fraudHistoryCount ? parseInt(fraudHistoryCount, 10) : 0,
        totalSpent: 0,
        fraudCount: 0
      }
    });

    return res.status(201).json(newCustomer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.cardNumber) {
      updateData.cardNumber = formatCardNumber(updateData.cardNumber);
    }
    if (updateData.age) updateData.age = parseInt(updateData.age, 10);
    if (updateData.monthlyIncome) updateData.monthlyIncome = parseFloat(updateData.monthlyIncome);
    if (updateData.averageSpend) updateData.averageSpend = parseFloat(updateData.averageSpend);
    if (updateData.riskScore !== undefined) updateData.riskScore = parseFloat(updateData.riskScore);
    if (updateData.fraudHistoryCount !== undefined) updateData.fraudHistoryCount = parseInt(updateData.fraudHistoryCount, 10);

    if (updateData.city || updateData.country) {
      updateData.location = `${updateData.city || ''}, ${updateData.country || ''}`.trim();
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    return res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete customer' });
  }
};

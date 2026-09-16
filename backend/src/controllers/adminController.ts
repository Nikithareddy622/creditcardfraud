import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action: 'CREATE_USER',
          details: `Created new staff user ${user.email} with role ${user.role}`
        }
      });
    }

    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
};

export const getFraudRules = async (req: Request, res: Response) => {
  try {
    const rules = await prisma.fraudRule.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(rules);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch rules' });
  }
};

export const createFraudRule = async (req: AuthRequest, res: Response) => {
  try {
    const { ruleName, conditionType, threshold, action, isEnabled = true } = req.body;

    if (!ruleName || !conditionType || !threshold || !action) {
      return res.status(400).json({ error: 'Missing required rule parameters' });
    }

    const rule = await prisma.fraudRule.create({
      data: { ruleName, conditionType, threshold, action, isEnabled }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action: 'CREATE_RULE',
          details: `Created fraud rule "${rule.ruleName}" (${rule.conditionType}: ${rule.threshold})`
        }
      });
    }

    return res.status(201).json(rule);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create rule' });
  }
};

export const updateFraudRule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ruleName, conditionType, threshold, action, isEnabled } = req.body;

    const rule = await prisma.fraudRule.update({
      where: { id },
      data: {
        ...(ruleName && { ruleName }),
        ...(conditionType && { conditionType }),
        ...(threshold && { threshold }),
        ...(action && { action }),
        ...(isEnabled !== undefined && { isEnabled })
      }
    });

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          userName: req.user.name,
          action: 'UPDATE_RULE',
          details: `Updated fraud rule "${rule.ruleName}" (Enabled: ${rule.isEnabled})`
        }
      });
    }

    return res.json(rule);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update rule' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
};

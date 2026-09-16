import { Router } from 'express';
import {
  getUsers,
  createUser,
  getFraudRules,
  createFraudRule,
  updateFraudRule,
  getAuditLogs
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with ADMIN role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/rules', getFraudRules);
router.post('/rules', createFraudRule);
router.put('/rules/:id', updateFraudRule);
router.get('/audit-logs', getAuditLogs);

export default router;

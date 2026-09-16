import { Router } from 'express';
import {
  predictFraudProxy,
  getAlerts,
  updateAlert,
  getFraudAnalytics
} from '../controllers/fraudController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.post('/predict', authenticateToken, predictFraudProxy);
router.get('/alerts', authenticateToken, getAlerts);
router.put('/alerts/:id', authenticateToken, requireRole(['ADMIN', 'FRAUD_ANALYST']), updateAlert);
router.get('/analytics', authenticateToken, getFraudAnalytics);

export default router;

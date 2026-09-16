import { Router } from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus
} from '../controllers/transactionController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getTransactions);
router.get('/:id', authenticateToken, getTransactionById);
router.post('/', authenticateToken, createTransaction);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'FRAUD_ANALYST']), updateTransactionStatus);

export default router;

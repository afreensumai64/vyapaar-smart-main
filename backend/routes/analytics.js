import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboardStats, getInsights } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/insights', getInsights);

export default router;
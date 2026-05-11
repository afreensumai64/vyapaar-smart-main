import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getInvoices,
  createInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.delete('/:id', deleteInvoice);

export default router;
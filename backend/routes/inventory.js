import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/inventoryController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInventory);
router.post('/', addInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

export default router;
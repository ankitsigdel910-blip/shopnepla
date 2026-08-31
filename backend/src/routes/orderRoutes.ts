import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, cancelOrder } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

export default router;

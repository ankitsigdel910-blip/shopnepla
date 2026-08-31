import { Router } from 'express';

import {
  getDashboardStats,
  getUsers,
  getUserById,
  setUserActiveStatus,
  setUserRole,
  getAllOrders,
  updateOrderStatus,
  deleteCancelledOrder,
  getAdminProducts,
  getRevenue,
} from '../controllers/adminController';

import {
  protect,
  authorize,
} from '../middleware/auth';

const router = Router();

// ============================================================
// ALL ADMIN ROUTES REQUIRE LOGIN + ADMIN ROLE
// ============================================================

router.use(protect, authorize('admin'));

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  '/dashboard',
  getDashboardStats
);

// ============================================================
// USERS
// ============================================================

router.get(
  '/users',
  getUsers
);

router.get(
  '/users/:id',
  getUserById
);

router.put(
  '/users/:id/status',
  setUserActiveStatus
);

router.put(
  '/users/:id/role',
  setUserRole
);

// ============================================================
// ORDERS
// ============================================================

// Get all orders
router.get(
  '/orders',
  getAllOrders
);

// Update order status
router.put(
  '/orders/:id/status',
  updateOrderStatus
);

// Delete an order.
// The controller only allows deletion when status === "cancelled".
router.delete(
  '/orders/:id',
  deleteCancelledOrder
);

// ============================================================
// PRODUCTS
// ============================================================

router.get(
  '/products',
  getAdminProducts
);

// ============================================================
// REVENUE
// ============================================================

router.get(
  '/revenue',
  getRevenue
);

export default router;
import asyncHandler from 'express-async-handler';
import { Response } from 'express';

import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

import ApiError from '../utils/ApiError';
import { sendSuccess } from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// ============================================================
// DASHBOARD
// ============================================================

// @route  GET /api/admin/dashboard
// @access Private/Admin
export const getDashboardStats = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      revenueAgg,
      monthlyRevenue,
      monthlyOrders,
    ] = await Promise.all([
      // Total customers
      User.countDocuments({
        role: 'customer',
      }),

      // Total products
      Product.countDocuments(),

      // Total orders
      Order.countDocuments(),

      // Pending / active orders
      Order.countDocuments({
        orderStatus: {
          $in: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out_for_delivery',
          ],
        },
      }),

      // Delivered orders
      Order.countDocuments({
        orderStatus: 'delivered',
      }),

      // ------------------------------------------------------
      // TOTAL REVENUE
      // Only paid orders count as revenue
      // ------------------------------------------------------

      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$totalAmount',
            },
          },
        },
      ]),

      // ------------------------------------------------------
      // MONTHLY REVENUE
      // Only paid orders
      // ------------------------------------------------------

      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: '$createdAt',
              },
              month: {
                $month: '$createdAt',
              },
            },
            revenue: {
              $sum: '$totalAmount',
            },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
        {
          $limit: 12,
        },
      ]),

      // ------------------------------------------------------
      // MONTHLY ORDERS
      // Count everything except cancelled orders
      // ------------------------------------------------------

      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: 'cancelled',
            },
          },
        },
        {
          $group: {
            _id: {
              year: {
                $year: '$createdAt',
              },
              month: {
                $month: '$createdAt',
              },
            },
            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
        {
          $limit: 12,
        },
      ]),
    ]);

    sendSuccess(
      res,
      200,
      'Dashboard stats retrieved successfully',
      {
        totalUsers,
        totalProducts,
        totalOrders,

        totalRevenue:
          revenueAgg[0]?.total || 0,

        pendingOrders,
        completedOrders,

        monthlyRevenue: monthlyRevenue.map(
          (item) => ({
            label: `${item._id.year}-${String(
              item._id.month
            ).padStart(2, '0')}`,

            revenue: item.revenue,
          })
        ),

        monthlyOrders: monthlyOrders.map(
          (item) => ({
            label: `${item._id.year}-${String(
              item._id.month
            ).padStart(2, '0')}`,

            orders: item.orders,
          })
        ),
      }
    );
  }
);

// ============================================================
// USERS
// ============================================================

// @route  GET /api/admin/users
// @access Private/Admin
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      search,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const pageNum = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNum = Math.min(
      100,
      Math.max(
        1,
        parseInt(limit, 10) || 20
      )
    );

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(
            (pageNum - 1) *
              limitNum
          )
          .limit(limitNum),

        User.countDocuments(filter),
      ]);

    sendSuccess(
      res,
      200,
      'Users retrieved successfully',
      {
        users,

        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages:
            Math.ceil(
              total / limitNum
            ),
        },
      }
    );
  }
);

// ============================================================
// GET USER
// ============================================================

// @route  GET /api/admin/users/:id
// @access Private/Admin
export const getUserById =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      sendSuccess(
        res,
        200,
        'User retrieved successfully',
        {
          user,
        }
      );
    }
  );

// ============================================================
// ENABLE / DISABLE USER
// ============================================================

// @route  PUT /api/admin/users/:id/status
// @access Private/Admin
export const setUserActiveStatus =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      user.isActive =
        !!req.body.isActive;

      await user.save();

      sendSuccess(
        res,
        200,
        `User ${
          user.isActive
            ? 'activated'
            : 'deactivated'
        } successfully`,
        {
          user,
        }
      );
    }
  );

// ============================================================
// CHANGE USER ROLE
// ============================================================

// @route  PUT /api/admin/users/:id/role
// @access Private/Admin
export const setUserRole =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const { role } =
        req.body;

      if (
        ![
          'customer',
          'admin',
        ].includes(role)
      ) {
        throw new ApiError(
          400,
          'Invalid role'
        );
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        throw new ApiError(
          404,
          'User not found'
        );
      }

      user.role = role;

      await user.save();

      sendSuccess(
        res,
        200,
        'User role updated successfully',
        {
          user,
        }
      );
    }
  );

// ============================================================
// ORDERS
// ============================================================

// @route  GET /api/admin/orders
// @access Private/Admin
export const getAllOrders =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const {
        status,
        page = '1',
        limit = '20',
      } =
        req.query as Record<
          string,
          string
        >;

      const filter: Record<
        string,
        any
      > = {};

      if (status) {
        filter.orderStatus =
          status;
      }

      const pageNum =
        Math.max(
          1,
          parseInt(
            page,
            10
          ) || 1
        );

      const limitNum =
        Math.min(
          100,
          Math.max(
            1,
            parseInt(
              limit,
              10
            ) || 20
          )
        );

      const [orders, total] =
        await Promise.all([
          Order.find(filter)
            .populate(
              'user',
              'name email phone'
            )
            .sort({
              createdAt: -1,
            })
            .skip(
              (pageNum - 1) *
                limitNum
            )
            .limit(limitNum),

          Order.countDocuments(
            filter
          ),
        ]);

      sendSuccess(
        res,
        200,
        'Orders retrieved successfully',
        {
          orders,

          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages:
              Math.ceil(
                total /
                  limitNum
              ),
          },
        }
      );
    }
  );

// ============================================================
// ORDER STATUS
// ============================================================

const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
];

// @route  PUT /api/admin/orders/:id/status
// @access Private/Admin
export const updateOrderStatus =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const { status } =
        req.body;

      const allStatuses = [
        ...ORDER_STATUS_FLOW,
        'cancelled',
      ];

      if (
        !allStatuses.includes(
          status
        )
      ) {
        throw new ApiError(
          400,
          'Invalid order status'
        );
      }

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        throw new ApiError(
          404,
          'Order not found'
        );
      }

      if (
        order.orderStatus ===
          'cancelled' ||
        order.orderStatus ===
          'delivered'
      ) {
        throw new ApiError(
          400,
          `Order is already ${order.orderStatus} and cannot be changed`
        );
      }

      // COD automatically becomes paid when delivered
      if (
        status ===
          'delivered' &&
        order.paymentMethod ===
          'cod'
      ) {
        order.paymentStatus =
          'paid';
      }

      order.orderStatus =
        status;

      await order.save();

      sendSuccess(
        res,
        200,
        'Order status updated successfully',
        {
          order,
        }
      );
    }
  );

// ============================================================
// DELETE CANCELLED ORDER
// ============================================================

// @route  DELETE /api/admin/orders/:id
// @access Private/Admin
export const deleteCancelledOrder =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        throw new ApiError(
          404,
          'Order not found'
        );
      }

      // Safety:
      // only cancelled orders can be deleted
      if (
        order.orderStatus !==
        'cancelled'
      ) {
        throw new ApiError(
          400,
          'Only cancelled orders can be deleted'
        );
      }

      await order.deleteOne();

      sendSuccess(
        res,
        200,
        'Cancelled order deleted successfully',
        null
      );
    }
  );

// ============================================================
// PRODUCTS
// ============================================================

// @route  GET /api/admin/products
// @access Private/Admin
export const getAdminProducts =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const {
        search,
        page = '1',
        limit = '20',
      } =
        req.query as Record<
          string,
          string
        >;

      const filter: Record<
        string,
        any
      > = {};

      if (search) {
        filter.name = {
          $regex: search,
          $options: 'i',
        };
      }

      const pageNum =
        Math.max(
          1,
          parseInt(
            page,
            10
          ) || 1
        );

      const limitNum =
        Math.min(
          100,
          Math.max(
            1,
            parseInt(
              limit,
              10
            ) || 20
          )
        );

      const [products, total] =
        await Promise.all([
          Product.find(
            filter
          )
            .populate(
              'category',
              'name'
            )
            .sort({
              createdAt: -1,
            })
            .skip(
              (pageNum - 1) *
                limitNum
            )
            .limit(
              limitNum
            ),

          Product.countDocuments(
            filter
          ),
        ]);

      sendSuccess(
        res,
        200,
        'Products retrieved successfully',
        {
          products,

          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages:
              Math.ceil(
                total /
                  limitNum
              ),
          },
        }
      );
    }
  );

// ============================================================
// REVENUE
// ============================================================

// @route  GET /api/admin/revenue
// @access Private/Admin
export const getRevenue =
  asyncHandler(
    async (
      req: AuthRequest,
      res: Response
    ) => {
      const {
        from,
        to,
      } =
        req.query as Record<
          string,
          string
        >;

      const match: Record<
        string,
        any
      > = {
        paymentStatus:
          'paid',
      };

      if (from || to) {
        match.createdAt = {};

        if (from) {
          match.createdAt.$gte =
            new Date(from);
        }

        if (to) {
          match.createdAt.$lte =
            new Date(to);
        }
      }

      const [
        summary,
        byPaymentMethod,
      ] =
        await Promise.all([
          Order.aggregate([
            {
              $match:
                match,
            },
            {
              $group: {
                _id: null,

                totalRevenue: {
                  $sum: '$totalAmount',
                },

                orderCount: {
                  $sum: 1,
                },
              },
            },
          ]),

          Order.aggregate([
            {
              $match:
                match,
            },
            {
              $group: {
                _id:
                  '$paymentMethod',

                revenue: {
                  $sum:
                    '$totalAmount',
                },

                count: {
                  $sum: 1,
                },
              },
            },
          ]),
        ]);

      sendSuccess(
        res,
        200,
        'Revenue retrieved successfully',
        {
          totalRevenue:
            summary[0]
              ?.totalRevenue ||
            0,

          orderCount:
            summary[0]
              ?.orderCount ||
            0,

          byPaymentMethod,
        }
      );
    }
  );
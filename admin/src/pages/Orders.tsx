import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/admin/orders', {
        params: {
          status: status || undefined,
        },
      });

      setOrders(response.data.data.orders);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  // =========================================================
  // DELETE CANCELLED ORDER
  // =========================================================

  const handleDelete = async (order: Order) => {
    // Frontend protection
    if (order.orderStatus !== 'cancelled') {
      setError('Only cancelled orders can be deleted.');
      return;
    }

    const orderNumber = order._id.slice(-8).toUpperCase();

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete order #${orderNumber}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(order._id);
      setError('');
      setSuccess('');

      await api.delete(`/admin/orders/${order._id}`);

      // Remove deleted order from table immediately
      setOrders((currentOrders) =>
        currentOrders.filter(
          (currentOrder) => currentOrder._id !== order._id
        )
      );

      setSuccess(
        `Order #${orderNumber} deleted successfully.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Orders
        </h1>

        <select
          className="input-field w-52"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setSuccess('');
            setError('');
          }}
        >
          <option value="">
            All statuses
          </option>

          {Object.keys(statusColor).map((s) => (
            <option
              key={s}
              value={s}
            >
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <div className="text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="card overflow-x-auto">

          <table className="w-full text-sm">

            {/* TABLE HEADER */}

            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">
                  Order
                </th>

                <th className="p-3">
                  Customer
                </th>

                <th className="p-3">
                  Total
                </th>

                <th className="p-3">
                  Payment
                </th>

                <th className="p-3">
                  Status
                </th>

                <th className="p-3">
                  Date
                </th>

                <th className="p-3">
                  Action
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody>

              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {

                  const isCancelled =
                    order.orderStatus === 'cancelled';

                  const isDeleting =
                    deletingId === order._id;

                  return (
                    <tr
                      key={order._id}
                      className="border-t hover:bg-gray-50"
                    >

                      {/* ORDER NUMBER */}

                      <td className="p-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-brand-600 hover:underline"
                        >
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </Link>
                      </td>

                      {/* CUSTOMER */}

                      <td className="p-3">
                        {order.user?.name || 'Unknown'}
                      </td>

                      {/* TOTAL */}

                      <td className="p-3">
                        Rs.{' '}
                        {order.totalAmount.toLocaleString()}
                      </td>

                      {/* PAYMENT */}

                      <td className="p-3 capitalize">
                        {order.paymentMethod}
                        {' · '}
                        {order.paymentStatus}
                      </td>

                      {/* STATUS */}

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            statusColor[
                              order.orderStatus
                            ] ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.orderStatus.replace(
                            /_/g,
                            ' '
                          )}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="p-3">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </td>

                      {/* ACTION */}

                      <td className="p-3">

                        {isCancelled ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(order)
                            }
                            disabled={isDeleting}
                            className="
                              rounded-md
                              bg-red-600
                              px-3
                              py-1.5
                              text-xs
                              font-medium
                              text-white
                              transition
                              hover:bg-red-700
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {isDeleting
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}

                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>

        </div>
      )}
    </div>
  );
};

export default Orders;
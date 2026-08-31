import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/orderService';
import { Order } from '../../types';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.myOrders().then((res) => setOrders(res.data.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="font-medium text-sm">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">Rs. {o.totalAmount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[o.orderStatus]}`}>{o.orderStatus.replace(/_/g, ' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

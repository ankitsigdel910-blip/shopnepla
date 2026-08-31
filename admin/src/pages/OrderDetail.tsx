import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => { if (id) api.get(`/orders/${id}`).then((res) => setOrder(res.data.data.order)); };
  useEffect(load, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return <div className="text-gray-500">Loading...</div>;

  const currentIndex = FLOW.indexOf(order.orderStatus);
  const nextStatus = FLOW[currentIndex + 1];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current status</p>
          <p className="font-semibold capitalize">{order.orderStatus.replace(/_/g, ' ')}</p>
        </div>
        {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && nextStatus && (
          <button className="btn-primary" disabled={updating} onClick={() => updateStatus(nextStatus)}>
            {updating ? 'Updating...' : `Mark as ${nextStatus.replace(/_/g, ' ')}`}
          </button>
        )}
        {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
          <button className="text-red-600 text-sm ml-3" disabled={updating} onClick={() => updateStatus('cancelled')}>Cancel</button>
        )}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold text-sm mb-3">Items</h2>
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
            <span>{item.name} × {item.quantity}</span>
            <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total</span><span>Rs. {order.totalAmount.toLocaleString()}</span></div>
      </div>

      <div className="card p-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h2 className="font-semibold mb-1">Customer</h2>
          <p>{order.user?.name}</p>
          <p className="text-gray-500">{order.user?.email} · {order.user?.phone}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-1">Shipping Address</h2>
          <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

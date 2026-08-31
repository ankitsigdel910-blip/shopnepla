import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../../services/orderService';
import { getErrorMessage } from '../../services/api';
import { Order } from '../../types';

const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    if (!id) return;
    orderApi.get(id).then((res) => setOrder(res.data.data.order)).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const cancelOrder = async () => {
    if (!id || !confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (!order) return <div className="text-gray-500">Order not found.</div>;

  const currentStepIndex = ORDER_FLOW.indexOf(order.orderStatus);
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        {canCancel && (
          <button onClick={cancelOrder} disabled={cancelling} className="text-red-600 text-sm hover:underline">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {order.orderStatus === 'cancelled' ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">This order was cancelled.</div>
      ) : (
        <div className="flex items-center overflow-x-auto pb-2">
          {ORDER_FLOW.map((step, i) => (
            <div key={step} className="flex items-center flex-1 min-w-[90px]">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${i <= currentStepIndex ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className="text-[10px] mt-1 text-center capitalize">{step.replace(/_/g, ' ')}</span>
              </div>
              {i < ORDER_FLOW.length - 1 && <div className={`h-0.5 flex-1 ${i < currentStepIndex ? 'bg-brand-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <h2 className="font-semibold text-sm mb-3">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0">
            <span>{item.name} × {item.quantity}</span>
            <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="text-sm space-y-1 pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>Rs. {order.shippingFee.toLocaleString()}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {order.discount.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>Rs. {order.totalAmount.toLocaleString()}</span></div>
        </div>
      </div>

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <h2 className="font-semibold mb-1">Shipping Address</h2>
          <p>{order.shippingAddress.fullName} — {order.shippingAddress.phone}</p>
          <p className="text-gray-600">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-1">Payment</h2>
          <p className="capitalize">{order.paymentMethod} — <span className="capitalize">{order.paymentStatus}</span></p>
          {order.transactionId && <p className="text-gray-500 text-xs mt-1">Txn: {order.transactionId}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

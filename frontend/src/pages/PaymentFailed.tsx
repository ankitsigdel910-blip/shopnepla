import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailed = () => {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={28} />
      </div>
      <h1 className="text-xl font-bold mb-2">Payment failed</h1>
      <p className="text-gray-600 text-sm mb-6">
        Your payment could not be completed. Your order has been kept as pending — you can retry payment from your orders page.
      </p>
      <div className="flex gap-3 justify-center">
        {orderId && (
          <Link to={`/dashboard/orders/${orderId}`} className="btn-secondary">View Order</Link>
        )}
        <Link to="/cart" className="btn-primary">Back to Cart</Link>
      </div>
    </div>
  );
};

export default PaymentFailed;

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, Download } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  const { paymentPending, razorpayData } = location.state || {};

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white">Order details unavailable</h1>
          <p className="text-sm text-gray-400 mt-3">We could not verify an order for this page.</p>
          <Link to="/orders" className="inline-block mt-6 px-6 py-3 bg-[#2dd4bf] text-black font-semibold text-xs uppercase rounded-lg">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    try {
      const invoiceContent = [
        'TIMEORA Horlogerie & Co.',
        'Invoice',
        '',
        `Order #: ${order.orderId}`,
        `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
        `Total: ${BRAND_CONFIG.currency}${order.total?.toLocaleString()}`,
        '',
        'Thank you for your purchase!',
      ].join('\n');

      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TIMEORA-Invoice-${order.orderId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Invoice download failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4">
        <div className="bg-[#121218] border border-[#262634] rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1c1c28] border-2 border-[#2dd4bf] mx-auto flex items-center justify-center text-[#2dd4bf] shadow-xl mb-6">
            <CheckCircle2 size={40} />
          </div>
          <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-widest">Order Confirmed</span>
          <h1 className="text-3xl font-bold text-white mt-2 mb-3">Thank You!</h1>
          <p className="text-sm text-gray-300 max-w-md mx-auto mb-8">Your order has been received and is being processed.</p>

          <div className="bg-[#181822] border border-[#242432] rounded-xl p-6 mb-8 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div><span className="text-gray-400 block text-[10px]">Order #</span><span className="font-mono font-bold text-white">{order.orderId}</span></div>
              <div><span className="text-gray-400 block text-[10px]">Date</span><span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span></div>
              <div><span className="text-gray-400 block text-[10px]">Total</span><span className="text-[#2dd4bf] font-bold">{BRAND_CONFIG.currency}{order.total?.toLocaleString()}</span></div>
            </div>
          </div>

          {paymentPending && razorpayData && (
            <div className="bg-[#181824] border border-[#2a2a3a] rounded-xl p-4 mb-8 text-left text-xs text-gray-300">
              <p className="font-semibold text-white mb-2">Complete Payment</p>
              <p>Your Razorpay payment link has been created. Complete payment to confirm your order.</p>
              <a href={`https://razorpay.com/checkout/${razorpayData.razorpayOrderId}`}
                target="_blank" rel="noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-[#2dd4bf] text-black rounded text-xs font-semibold">Pay Now</a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/orders" className="px-8 py-3.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase rounded-lg flex items-center space-x-2">
              <Package size={16} /><span>Track Order</span></Link>
            <button onClick={handleDownloadInvoice}
              className="px-8 py-3.5 bg-[#1a1a24] hover:bg-[#252533] text-gray-200 text-xs uppercase rounded-lg border border-[#2e2e3e] flex items-center space-x-2">
              <Download size={16} /><span>Download Invoice</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

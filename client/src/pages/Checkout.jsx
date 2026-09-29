import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Landmark, Truck, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';
import { API_BASE } from '../config/api';
import axios from 'axios';

const API_URL = API_BASE;

const Checkout = () => {
  const { cartItems, subtotal, clearCart, lastCheckoutOrder, setLastCheckoutOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '', city: '', state: '', postalCode: '', country: '',
    orderNotes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingMethod, setShippingMethod] = useState('express');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-36 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">No Items in Bag</h2>
          <Link to="/watches" className="inline-block px-6 py-2.5 bg-[#2dd4bf] text-black text-xs uppercase font-bold rounded">Explore</Link>
        </div>
      </div>
    );
  }

  const shippingCost = shippingMethod === 'priority' ? 120 : 0;
  const discountAmount = couponApplied?.discount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  const total = taxableAmount + taxAmount + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('timeora_token');
      const res = await axios.post(`${API_URL}/orders`, {
        items: cartItems.map(item => ({
          productId: item.id, sku: item.sku, name: item.name,
          price: item.price, quantity: item.quantity,
          selectedColor: item.selectedColor, image: item.image,
        })),
        shippingInfo, billingInfo: { ...shippingInfo },
        paymentMethod, shippingMethod, couponCode: couponApplied?.code || couponCode || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const order = res.data.order;
      setLastCheckoutOrder(order);
      clearCart();

      if (paymentMethod === 'razorpay' && order._id) {
        try {
          const payRes = await axios.post(`${API_URL}/payments/create-order`, {
            orderId: order.orderId, amount: order.total,
          }, { headers: { Authorization: `Bearer ${token}` } });
          navigate('/order-success', { state: { order, paymentPending: true, razorpayData: payRes.data } });
          return;
        } catch {}
      }

      navigate('/order-success', { state: { order } });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-widest">Secure Checkout</span>
          <h1 className="text-3xl font-bold text-white mt-1">Checkout</h1>
        </div>

        {error && <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8">
                <h2 className="font-bold text-lg text-white pb-3 border-b border-[#20202c]">1. Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  {['firstName', 'lastName', 'email', 'phone'].map(f => (
                    <div key={f}>
                      <label className="block text-gray-400 uppercase mb-2">{f}</label>
                      <input required type={f === 'email' ? 'email' : 'text'} value={shippingInfo[f]}
                        onChange={e => setShippingInfo({...shippingInfo, [f]: e.target.value})}
                        className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2dd4bf]" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 uppercase mb-2">Address</label>
                    <input required value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2dd4bf]" />
                  </div>
                  {['city', 'state', 'postalCode', 'country'].map(f => (
                    <div key={f}>
                      <label className="block text-gray-400 uppercase mb-2">{f}</label>
                      <input required value={shippingInfo[f]} onChange={e => setShippingInfo({...shippingInfo, [f]: e.target.value})}
                        className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2dd4bf]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8">
                <h2 className="font-bold text-lg text-white pb-3 border-b border-[#20202c]">2. Payment</h2>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[{k:'razorpay',l:'UPI/Razorpay'},{k:'card',l:'Card'},{k:'cod',l:'COD'}].map(p => (
                    <button key={p.k} type="button" onClick={() => setPaymentMethod(p.k)}
                      className={`py-3 px-4 rounded-xl border flex flex-col items-center space-y-1 ${paymentMethod === p.k ? 'bg-[#1b1b26] border-[#2dd4bf]' : 'bg-[#14141c] border-[#262635] text-gray-400'}`}>
                      <span className="text-[11px] font-semibold">{p.l}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sticky top-28">
                <h2 className="font-bold text-xl text-white pb-3 border-b border-[#20202c]">Order Summary</h2>
                <div className="space-y-3 mt-4 max-h-56 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex justify-between text-xs">
                      <span className="text-gray-400">{item.name} × {item.quantity}</span>
                      <span className="text-white">{BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-[#20202c] space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span className="text-white">{BRAND_CONFIG.currency}{subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span><span>-{BRAND_CONFIG.currency}{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18%)</span><span>{BRAND_CONFIG.currency}{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400">{shippingCost === 0 ? 'Free' : BRAND_CONFIG.currency + shippingCost}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#20202c] flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-gray-200">Total</span>
                  <span className="text-2xl font-bold text-[#2dd4bf]">{BRAND_CONFIG.currency}{total.toLocaleString()}</span>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full mt-6 py-4 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50">
                  {loading ? <span>Processing...</span> : <><span>Complete Order</span><ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

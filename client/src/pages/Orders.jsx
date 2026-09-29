import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';
import { Package, ArrowRight } from 'lucide-react';
import { API_BASE } from '../config/api';

const API_URL = API_BASE;

const Orders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0b0b0d] pt-36 text-center text-gray-400">Loading orders...</div>;
  if (error) return <div className="min-h-screen bg-[#0b0b0d] pt-36 text-center"><p className="text-red-400">{error}</p><button onClick={fetchOrders} className="mt-4 text-[#2dd4bf]">Retry</button></div>;

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-10">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-4" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-[#121218] border border-[#22222e] rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono font-bold text-white">{order.orderId}</p>
                    <p className="text-[#2dd4bf] text-xs uppercase mt-1">{order.status || 'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-[#2dd4bf]">{BRAND_CONFIG.currency}{order.total?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-xs">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-[#0d0d12]" />
                      <div className="flex-1">
                        <p className="text-white">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-white">{BRAND_CONFIG.currency}{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

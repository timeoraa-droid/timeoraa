import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft, Tag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.toUpperCase() === 'ROYAL10' || couponCode.toUpperCase() === 'TIMEORA') {
      const discount = subtotal * 0.10;
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid invitation code. Try "ROYAL10" for 10% patron privilege.');
    }
  };

  const finalTotal = subtotal - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-36 pb-24 text-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#15151e] border border-[#262635] mx-auto flex items-center justify-center text-gray-400 shadow-xl">
            <ShoppingBag size={36} className="text-[#2dd4bf]" />
          </div>
          <h1 className="text-3xl font-['Cinzel'] font-bold text-white">Your Bag is Empty</h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            Your horological journey awaits. Explore our collection of handcrafted automatic and tourbillon timepieces.
          </p>
          <Link
            to="/watches"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#2dd4bf] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-[#5eead4] transition-colors shadow-lg"
          >
            <span>Explore Timepieces</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#20202c] mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-['Cinzel'] font-bold text-white mb-1">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-gray-400">
              {cartItems.reduce((a, b) => a + b.quantity, 0)} curated timepieces ready for dispatch
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-gray-400 hover:text-red-400 flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <Trash2 size={14} />
            <span>Clear Bag</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={`${item.id}-${item.selectedColor}`}
                className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-[#2dd4bf]/30 transition-all"
              >
                {/* Image & Title */}
                <div className="flex items-center space-x-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl bg-[#0c0c10] border border-[#22222e] flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                      REF: {item.sku || item.id}
                    </span>
                    <Link 
                      to={`/product/${item.id}`} 
                      className="font-['Cinzel'] font-bold text-base text-white hover:text-[#2dd4bf] transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#2dd4bf] mt-1 font-medium">Edition: {item.selectedColor}</p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {BRAND_CONFIG.currency}{item.price.toLocaleString()} each
                    </span>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#2c2c3b] rounded-lg bg-[#181822]">
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-base font-bold text-white block">
                      {BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedColor)}
                    className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                    title="Remove from bag"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Link 
                to="/watches"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2dd4bf] hover:underline font-semibold"
              >
                <ArrowLeft size={14} />
                <span>Continue Exploring Timepieces</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8 space-y-6 sticky top-28">
              <h2 className="font-['Cinzel'] font-bold text-xl text-white pb-4 border-b border-[#20202c]">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo Code (e.g. ROYAL10)"
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg pl-9 pr-3 py-2 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#22222e] hover:bg-[#2dd4bf] text-gray-300 hover:text-black text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <Check size={14} />
                    <span>Patron privilege applied: 10% Off!</span>
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 mt-2">{couponError}</p>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs pt-4 border-t border-[#20202c]">
                <div className="flex justify-between text-gray-400">
                  <span>Bag Subtotal</span>
                  <span className="text-white font-medium">
                    {BRAND_CONFIG.currency}{subtotal.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>VIP Privilege (10%)</span>
                    <span>-{BRAND_CONFIG.currency}{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-400 font-medium">Complimentary ($0)</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Estimated Tax</span>
                  <span className="text-gray-300 font-medium">Calculated at Checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-[#20202c] flex justify-between items-baseline">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-200">Total</span>
                <span className="text-2xl font-bold text-[#2dd4bf]">
                  {BRAND_CONFIG.currency}{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-[#2dd4bf]/20"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Badges */}
              <div className="pt-2 text-center text-[10px] text-gray-400 space-y-1">
                <div className="flex items-center justify-center space-x-1 text-[#2dd4bf]">
                  <ShieldCheck size={14} />
                  <span className="font-semibold">TIMEORA Concierge Assurance</span>
                </div>
                <p>All timepieces include 5-year international warranty & certificate.</p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121217] border-l border-[#242430] flex flex-col shadow-2xl text-gray-200">
          
          {/* Header */}
          <div className="p-6 border-b border-[#22222d] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={20} className="text-[#2dd4bf]" />
              <h2 className="font-['Cinzel'] tracking-widest text-lg font-bold text-white uppercase">
                Shopping Bag ({cartItems.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Banner */}
          <div className="bg-[#181822] px-6 py-3 border-b border-[#22222d] flex items-center space-x-2 text-xs text-[#2dd4bf]">
            <Truck size={16} />
            <span>Complimentary Insured Express Delivery Included</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#181822] border border-[#2a2a35] flex items-center justify-center text-gray-500">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-['Cinzel'] text-white text-base tracking-wider font-semibold">Your Bag is Empty</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Discover TIMEORA's handcrafted horological masterpieces and begin your bespoke collection.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/watches');
                  }}
                  className="mt-2 px-6 py-2.5 bg-[#2dd4bf] text-black text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#5eead4] transition-colors"
                >
                  Explore Timepieces
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={`${item.id}-${item.selectedColor}`}
                  className="flex space-x-4 p-3.5 rounded-xl bg-[#171720] border border-[#242432] relative group"
                >
                  {/* Watch thumbnail */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg bg-[#0d0d12] flex-shrink-0"
                  />

                  {/* Watch info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-white font-['Cinzel'] line-clamp-1 pr-4">
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedColor)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#2dd4bf] mt-0.5">{item.selectedColor}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-[#2e2e3e] rounded bg-[#0f0f14] text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
                          className="px-2 py-0.5 text-gray-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Line price */}
                      <span className="text-sm font-bold text-white">
                        {BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#22222d] bg-[#101015] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold text-sm">
                    {BRAND_CONFIG.currency}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Insured Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>5-Year International Guarantee</span>
                  <span className="text-[#2dd4bf] font-medium">Included</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1f1f2a] flex justify-between items-baseline">
                <span className="text-sm uppercase tracking-wider text-gray-300 font-semibold">Estimated Total</span>
                <span className="text-xl font-bold text-[#2dd4bf]">
                  {BRAND_CONFIG.currency}{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#2dd4bf]/20"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 bg-[#1a1a24] hover:bg-[#252533] text-gray-300 hover:text-white text-xs uppercase tracking-widest font-medium rounded-lg transition-colors border border-[#2b2b3b]"
                >
                  View Full Bag & Summary
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 pt-1">
                <ShieldCheck size={14} className="text-[#2dd4bf]" />
                <span>256-Bit Encrypted High-Security Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;

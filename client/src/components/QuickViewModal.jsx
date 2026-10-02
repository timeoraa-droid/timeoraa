import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Shield, Droplets, Gauge, ShoppingBag, Check } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useCart } from '../context/CartContext';

const QuickViewModal = ({ product, onClose }) => {
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity, selectedColor);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-[#131318] border border-[#2e2e3a] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/40 hover:bg-black/80 p-2 rounded-full transition-colors border border-white/10"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image preview */}
          <div className="bg-[#181822] p-6 flex items-center justify-center relative min-h-[320px]">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'}
              alt={product.name}
              className="max-h-[360px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-widest mb-2">
                <span className="text-[#2dd4bf] font-semibold">{product.category}</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl font-['Cinzel'] font-bold text-white mb-2 leading-snug">
                {product.name}
              </h2>

              {/* Price & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold text-white">
                    {BRAND_CONFIG.currency}{(product.discountPrice || product.price).toLocaleString()}
                  </span>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {BRAND_CONFIG.currency}{product.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                {product.stock <= 0 || product.status === 'out-of-stock' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800/80">
                    Out of Stock
                  </span>
                ) : (product.onOffer || (product.discountPrice && product.discountPrice < product.price) || product.offerPercent) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80">
                    On Offer {product.offerPercent ? `(-${product.offerPercent}%)` : ''}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    Available ({product.stock})
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specs Icons */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#22222d] mb-6 text-center text-[11px] text-gray-300">
                <div className="flex flex-col items-center justify-center p-2 rounded bg-[#171720]">
                  <Gauge size={16} className="text-[#2dd4bf] mb-1" />
                  <span className="font-semibold text-gray-200">Movement</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-full">{product.movement?.split(' ')[0]}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded bg-[#171720]">
                  <Droplets size={16} className="text-[#2dd4bf] mb-1" />
                  <span className="font-semibold text-gray-200">Water Res.</span>
                  <span className="text-[10px] text-gray-400">{product.waterResistance?.split(' ')[0]}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded bg-[#171720]">
                  <Shield size={16} className="text-[#2dd4bf] mb-1" />
                  <span className="font-semibold text-gray-200">Warranty</span>
                  <span className="text-[10px] text-gray-400">5-Year Global</span>
                </div>
              </div>

              {/* Color variant */}
              {product.colors && (
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-gray-300 mb-2">
                    Edition / Finish: <span className="text-[#2dd4bf]">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selectedColor === color
                            ? 'bg-[#2dd4bf] text-black border-[#2dd4bf] font-medium shadow-md'
                            : 'bg-[#181820] text-gray-300 border-[#2a2a35] hover:border-gray-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                {/* Quantity selector */}
                <div className={`flex items-center border border-[#2a2a35] rounded-lg bg-[#181820] ${(product.stock <= 0 || product.status === 'out-of-stock') ? 'opacity-40 pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock <= 0 || product.status === 'out-of-stock'}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-2 text-sm font-semibold text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock <= 0 || product.status === 'out-of-stock'}
                    className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0 || product.status === 'out-of-stock' || added}
                  className={`flex-1 py-3 px-6 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 transition-all ${
                    product.stock <= 0 || product.status === 'out-of-stock'
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#2dd4bf] hover:bg-[#5eead4] text-black shadow-lg shadow-[#2dd4bf]/20'
                  }`}
                >
                  {product.stock <= 0 || product.status === 'out-of-stock' ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <>
                      <Check size={16} />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="block text-center text-xs text-gray-400 hover:text-[#2dd4bf] uppercase tracking-wider py-1 transition-colors"
              >
                View Full Horological Specifications →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;

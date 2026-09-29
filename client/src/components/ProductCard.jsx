import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star, Check, Watch } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const stockCount = Number(product.stock);
  const availabilityKnown = product.stock !== undefined && product.stock !== null && Number.isFinite(stockCount) && stockCount >= 0;
  const isOutOfStock = !availabilityKnown || stockCount <= 0;
  const isOnOffer = Boolean(product.discountPrice && product.discountPrice < product.price);
  const effectivePrice = isOnOffer ? product.discountPrice : product.price;

  const discountPercent = isOnOffer 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const mainImage = product.images?.[0] || product.image;
  const hoverImage = product.images?.[1] || mainImage;

  return (
    <div 
      className="group relative bg-[#121217] border border-[#22222a] rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-[#2dd4bf]/50 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {isOutOfStock && (
          <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md">
            {availabilityKnown ? 'Out of Stock' : 'Availability Unconfirmed'}
          </span>
        )}
        {isOnOffer && !isOutOfStock && (
          <span className="bg-amber-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md">
            On Offer • -{discountPercent}%
          </span>
        )}
        {product.newArrival && !isOutOfStock && (
          <span className="bg-[#2dd4bf] text-black text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-md">
            New
          </span>
        )}
        {product.bestSeller && !isOutOfStock && (
          <span className="bg-[#1f1f27] border border-[#2dd4bf]/40 text-[#2dd4bf] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm backdrop-blur-md">
            Iconic
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleFavorite}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isFavorited 
            ? 'bg-[#2dd4bf] text-black shadow-lg shadow-[#2dd4bf]/30' 
            : 'bg-black/50 backdrop-blur-md text-white hover:text-[#2dd4bf] hover:bg-black/70 border border-white/10'
        }`}
        title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-label="Wishlist"
      >
        <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
      </button>

      {/* Watch Image Showcase */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] bg-gradient-to-b from-[#181822] to-[#0d0d12] overflow-hidden">
        {mainImage ? (
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-all duration-700 transform group-hover:scale-105 filter brightness-95 group-hover:brightness-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#171b17] text-center text-gray-400">
            <Watch size={34} aria-hidden="true" className="text-[#b8a16a]" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Product image coming soon</span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <button
            onClick={handleQuickViewClick}
            className="flex items-center space-x-2 bg-[#1b1b22] hover:bg-[#2dd4bf] text-white hover:text-black border border-[#2dd4bf]/40 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-xl"
          >
            <Eye size={15} />
            <span>Quick View</span>
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-[#121217]">
        <div>
          {/* Category & Movement tag */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-widest mb-1.5">
            <span>{product.category}</span>
            <span className="text-gray-500 font-mono text-[10px]">{product.gender}</span>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`} className="block group-hover:text-[#2dd4bf] transition-colors">
            <h3 className="text-white font-medium text-base tracking-wide line-clamp-1 mb-1 font-['Cinzel']">
              {product.name}
            </h3>
          </Link>

          {/* Tagline / Subtitle */}
          <p className="text-gray-400 text-xs line-clamp-1 mb-3">
            {product.tagline || product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-3 text-xs text-gray-400">
            <div className="flex items-center text-[#2dd4bf]">
              <Star size={13} fill="currentColor" />
            </div>
            <span className="font-semibold text-gray-200">{product.rating}</span>
            <span className="text-gray-500 text-[11px]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#1f1f28] flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-bold text-white tracking-tight">
                {BRAND_CONFIG.currency}{Number(effectivePrice).toLocaleString()}
              </span>
              {isOnOffer && (
                <span className="text-xs text-gray-500 line-through">
                  {BRAND_CONFIG.currency}{product.price.toLocaleString()}
                </span>
              )}
            </div>
            {!availabilityKnown ? (
              <span className="text-[10px] text-amber-300 font-medium">Availability unconfirmed</span>
            ) : isOutOfStock ? (
              <span className="text-[10px] text-red-400 font-medium">Out of Stock</span>
            ) : isOnOffer ? (
              <span className="text-[10px] text-amber-300 font-medium">Available • On Offer</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">Available • In Stock</span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addedAnimation}
            className={`flex items-center justify-center p-2.5 rounded-lg transition-all ${
              isOutOfStock
                ? 'bg-[#181820] text-gray-500 border border-[#2a2a35] cursor-not-allowed opacity-50'
                : addedAnimation
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-[#1e1e28] hover:bg-[#2dd4bf] text-gray-200 hover:text-black border border-[#2a2a38] hover:border-[#2dd4bf]'
            }`}
            title={!availabilityKnown ? 'Availability unconfirmed' : isOutOfStock ? 'Out of Stock' : 'Add to Shopping Bag'}
            aria-label={!availabilityKnown ? 'Availability unconfirmed' : isOutOfStock ? 'Out of Stock' : 'Add to cart'}
          >
            {addedAnimation ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

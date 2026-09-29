import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Gauge, 
  Droplets, 
  Award, 
  Check, 
  ChevronRight, 
  MessageSquare,
  Share2,
  Play,
  Film,
  Video,
  Watch
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import CatalogNotice from '../components/CatalogNotice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products, loading, error, refreshProducts } = useProducts();

  const product = products.find(p => String(p.id) === String(id));

  const stockCount = Number(product?.stock);
  const availabilityKnown = product?.stock !== undefined && product?.stock !== null && Number.isFinite(stockCount) && stockCount >= 0;
  const isOutOfStock = !availabilityKnown || stockCount <= 0 || product?.status === 'out-of-stock';
  const isOnOffer = Boolean(product?.onOffer || (product?.discountPrice && product.discountPrice < product.price) || product?.offerPercent);
  const effectivePrice = Number.isFinite(Number(product?.effectivePrice))
    ? Number(product.effectivePrice)
    : isOnOffer ? Number(product.discountPrice) : Number(product?.price);

  const [activeMedia, setActiveMedia] = useState({ type: 'image', index: 0 });
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'craftsmanship', 'shipping'

  const isFavorited = isInWishlist(product?.id);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveMedia({ type: 'image', index: 0 });
    if (product?.colors?.length) setSelectedColor(product.colors[0]);
  }, [id, product]);

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related watches from same category or gender
  const relatedWatches = products.filter(p => p.id !== product?.id && (p.category === product?.category || p.gender === product?.gender)).slice(0, 4);

  const images = (Array.isArray(product?.images) && product.images.length > 0)
    ? product.images
    : product?.image ? [product.image] : [];

  const hasVideo = Boolean(product?.video);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] px-4 pb-24 pt-32 text-gray-100 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <CatalogNotice
            loading={loading}
            error={error}
            onRetry={refreshProducts}
            title="Timepiece not found in the live catalog"
            description="This reference may have been removed or is not currently listed. TIMEORA only displays product details and availability confirmed by the store catalog."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-8 uppercase tracking-widest">
          <Link to="/home" className="hover:text-[#2dd4bf] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/watches" className="hover:text-[#2dd4bf] transition-colors">Watches</Link>
          <ChevronRight size={12} />
          <span className="text-[#2dd4bf] truncate">{product.name}</span>
        </nav>

        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left: Interactive Media Gallery (Images + Video) */}
          <div className="space-y-4">
            {/* Primary Frame (Image or Video) */}
            <div className="relative aspect-[4/5] bg-[#121218] border border-[#22222e] rounded-2xl overflow-hidden flex items-center justify-center p-4 group shadow-2xl">
              {product.discountPrice && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                  Special Atelier Pricing
                </div>
              )}

              {activeMedia.type === 'video' && hasVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
                  <video
                    src={product.video}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : images.length ? (
                <img
                  src={images[activeMedia.index] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] transition-all duration-500 transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#171b17] text-center text-gray-400">
                  <Watch size={40} className="text-[#2dd4bf]" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-[0.2em]">Product image coming soon</span>
                </div>
              )}
            </div>

            {/* Media Thumbnails Row (Images 1-6 + Video Thumbnail) */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia({ type: 'image', index: idx })}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-[#161620] border-2 flex-shrink-0 transition-all relative ${
                    activeMedia.type === 'image' && activeMedia.index === idx
                      ? 'border-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/20 scale-105'
                      : 'border-[#262634] opacity-60 hover:opacity-100'
                  }`}
                  title={idx === 0 ? "Primary Product Image" : `View Image ${idx + 1}`}
                >
                  <img src={img} alt={`thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 right-1 bg-black/80 text-[#2dd4bf] text-[8px] font-bold uppercase text-center rounded py-0.5 border border-[#2dd4bf]/30">
                      Main
                    </span>
                  )}
                </button>
              ))}

              {/* Video Thumbnail Button if Video Present */}
              {hasVideo && (
                <button
                  onClick={() => setActiveMedia({ type: 'video' })}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-[#181826] border-2 flex-shrink-0 transition-all relative flex flex-col items-center justify-center group ${
                    activeMedia.type === 'video'
                      ? 'border-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/30 scale-105 bg-[#202034]'
                      : 'border-[#2e2e42] opacity-75 hover:opacity-100'
                  }`}
                  title="Watch Product Video Showcase"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2dd4bf] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </div>
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider mt-1">
                    Video
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="flex flex-col justify-between space-y-8">
            <div>
              {/* Category, Gender, SKU */}
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-400 mb-3 pb-3 border-b border-[#1f1f2a]">
                <div className="flex items-center space-x-2">
                  <span className="text-[#2dd4bf] font-semibold">{product.category}</span>
                  <span>•</span>
                  <span>{product.gender}</span>
                </div>
                <span className="font-mono text-gray-500">REF: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-['Cinzel'] font-bold text-white mb-3 leading-snug">
                {product.name}
              </h1>

              {/* Tagline */}
              <p className="text-sm text-[#2dd4bf] tracking-wide mb-4 font-light">
                {product.tagline}
              </p>

              {/* Reviews & Rating */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center text-[#2dd4bf]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs text-gray-200 font-semibold">{product.rating}</span>
                <span className="text-xs text-gray-500">({product.reviewsCount} Certified Patron Reviews)</span>
              </div>

              {/* Price Display & Clear Status */}
              <div className="bg-[#14141c] border border-[#242432] rounded-xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Maison Price</span>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {BRAND_CONFIG.currency}{effectivePrice.toLocaleString()}
                    </span>
                    {product.discountPrice && product.discountPrice < product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {BRAND_CONFIG.currency}{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {!availabilityKnown ? (
                    <>
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Availability unconfirmed</span>
                      <span className="text-[11px] text-gray-400 block mt-1">Please contact TIMEORA before ordering.</span>
                    </>
                  ) : isOutOfStock ? (
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800/80">
                        Out of Stock
                      </span>
                      <span className="text-[11px] text-rose-300/80 block mt-1">Currently unavailable for order</span>
                    </div>
                  ) : isOnOffer ? (
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/80">
                        On Offer {product.offerPercent ? `(-${product.offerPercent}%)` : 'Special'}
                      </span>
                      <span className="text-[11px] text-emerald-400 block mt-1">Available • {stockCount} units in live stock</span>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        <Check size={12} className="mr-1" />
                        Available
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-1">{stockCount} units in live stock • Delivery timing confirmed at checkout</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 leading-relaxed mb-8 font-light">
                {product.description}
              </p>

              {/* Color Finish Variant Selector */}
              {product.colors && (
                <div className="mb-8">
                  <label className="block text-xs uppercase tracking-wider text-gray-300 font-semibold mb-3">
                    Dial & Finish: <span className="text-[#2dd4bf]">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs px-4 py-2 rounded-lg border transition-all ${
                          selectedColor === color
                            ? 'bg-[#2dd4bf] text-black border-[#2dd4bf] font-semibold shadow-md'
                            : 'bg-[#161620] text-gray-300 border-[#2b2b3b] hover:border-gray-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {/* Quantity Counter */}
                  <div className={`flex items-center border border-[#2c2c3b] rounded-xl bg-[#14141c] px-2 py-1 ${isOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-lg font-medium disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-white text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isOutOfStock}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white text-lg font-medium disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock || added}
                    className={`flex-1 py-4 px-6 rounded-xl text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center space-x-3 transition-all ${
                      isOutOfStock
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
                        : added
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-[#2dd4bf] hover:bg-[#5eead4] text-black shadow-xl shadow-[#2dd4bf]/20'
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>Out of Stock — Unavailable</span>
                    ) : added ? (
                      <>
                        <Check size={18} />
                        <span>Added to Shopping Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>Add To Bag • {BRAND_CONFIG.currency}{((product.discountPrice || product.price) * quantity).toLocaleString()}</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Toggle Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${
                      isFavorited
                        ? 'bg-[#2dd4bf] text-black border-[#2dd4bf]'
                        : 'bg-[#14141c] text-gray-400 border-[#2c2c3b] hover:text-[#2dd4bf] hover:border-[#2dd4bf]'
                    }`}
                    title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Direct Concierge & Share */}
                <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
                  <Link to="/contact" className="hover:text-[#2dd4bf] flex items-center space-x-1.5 transition-colors">
                    <MessageSquare size={14} />
                    <span>Inquire with Private Concierge</span>
                  </Link>

                  <button 
                    onClick={handleShare}
                    className="hover:text-[#2dd4bf] flex items-center space-x-1.5 transition-colors"
                  >
                    <Share2 size={14} />
                    <span>{copiedLink ? "Link Copied!" : "Share Timepiece"}</span>
                  </button>
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-3 pt-8 border-t border-[#1f1f2a] mt-8 text-center">
                <div className="p-3 bg-[#13131a] rounded-xl border border-[#20202a]">
                  <Truck size={18} className="text-[#2dd4bf] mx-auto mb-1.5" />
                  <span className="text-[11px] font-semibold text-gray-200 block">Insured Global Delivery</span>
                  <span className="text-[9px] text-gray-500">2-4 Business Days</span>
                </div>
                <div className="p-3 bg-[#13131a] rounded-xl border border-[#20202a]">
                  <ShieldCheck size={18} className="text-[#2dd4bf] mx-auto mb-1.5" />
                  <span className="text-[11px] font-semibold text-gray-200 block">5-Year Warranty</span>
                  <span className="text-[9px] text-gray-500">International Coverage</span>
                </div>
                <div className="p-3 bg-[#13131a] rounded-xl border border-[#20202a]">
                  <RefreshCw size={18} className="text-[#2dd4bf] mx-auto mb-1.5" />
                  <span className="text-[11px] font-semibold text-gray-200 block">30-Day Returns</span>
                  <span className="text-[9px] text-gray-500">Complimentary Courier</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Technical Horological Specifications Tabbed Section */}
        <div className="mt-20 border-t border-[#22222d] pt-12">
          <div className="flex border-b border-[#22222d] space-x-8 mb-8">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all relative ${
                activeTab === 'specs'
                  ? 'text-[#2dd4bf] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Horological Specifications
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2dd4bf]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('craftsmanship')}
              className={`pb-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all relative ${
                activeTab === 'craftsmanship'
                  ? 'text-[#2dd4bf] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Artisanal Craftsmanship
              {activeTab === 'craftsmanship' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2dd4bf]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all relative ${
                activeTab === 'shipping'
                  ? 'text-[#2dd4bf] font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Delivery & Warranty
              {activeTab === 'shipping' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2dd4bf]" />
              )}
            </button>
          </div>

          {/* Tab 1: Specs Table */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#121218] border border-[#22222e] rounded-xl p-5 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Movement</span>
                  <span className="text-white font-medium">{product.movement}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Case Material</span>
                  <span className="text-white font-medium">{product.caseMaterial}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Case Diameter</span>
                  <span className="text-white font-medium">{product.caseDiameter || '42mm'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Case Thickness</span>
                  <span className="text-white font-medium">{product.caseThickness || '11.5mm'}</span>
                </div>
              </div>

              <div className="bg-[#121218] border border-[#22222e] rounded-xl p-5 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Strap Material</span>
                  <span className="text-white font-medium">{product.strapMaterial}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Dial Color</span>
                  <span className="text-white font-medium">{product.dialColor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Water Resistance</span>
                  <span className="text-white font-medium">{product.waterResistance}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#1c1c26]">
                  <span className="text-gray-400">Manufacturer Warranty</span>
                  <span className="text-white font-medium">{product.warranty}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Craftsmanship */}
          {activeTab === 'craftsmanship' && (
            <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-8 max-w-4xl space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              <h4 className="text-white font-['Cinzel'] font-bold text-base">Hand-Finished in Our Ateliers</h4>
              <p>
                Each {product.name} undergoes over 120 hours of individual hand-assembly, regulation, and finishing. The bevelling (anglage) on the movement bridges is polished with diamond paste to achieve mirror perfection.
              </p>
              <p>
                Our domed sapphire crystal features seven layers of anti-reflective coating on both inner and outer surfaces, offering unparalleled visual clarity as if the glass were completely invisible.
              </p>
            </div>
          )}

          {/* Tab 3: Delivery */}
          {activeTab === 'shipping' && (
            <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-8 max-w-4xl space-y-4 text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              <h4 className="text-white font-['Cinzel'] font-bold text-base">White-Glove Express Delivery</h4>
              <p>
                Orders are dispatched via secure, armored, and fully-insured air express couriers (DHL Express & FedEx International Priority). A signature is strictly required upon receipt.
              </p>
              <p>
                Every watch arrives in a hand-crafted solid walnut presentation chest accompanied by a certified international warranty card, individual chronometer certificate, and microfiber cleaning cloth.
              </p>
            </div>
          )}
        </div>

        {/* Related Watches */}
        {relatedWatches.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#22222d]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.25em] block mb-1">
                  Complementary Models
                </span>
                <h3 className="font-['Cinzel'] text-2xl font-bold text-white">
                  You May Also Admire
                </h3>
              </div>
              <Link to="/watches" className="text-xs uppercase tracking-widest text-[#2dd4bf] hover:underline">
                View All Timepieces
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedWatches.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;

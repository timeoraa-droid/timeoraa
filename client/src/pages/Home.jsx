import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Watch, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  Clock,
  Gem,
  Phone,
  Headphones
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import CatalogNotice from '../components/CatalogNotice';

const Home = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const featuredWatches = products.filter(w => w.featured).slice(0, 4);
  const newArrivals = products.filter(w => w.newArrival).slice(0, 4);
  const bestSellers = products.filter(w => w.bestSeller).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Cinematic Background Image with dark luxury gradient overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=85&w=2200&auto=format&fit=crop"
            alt="Luxury wristwatch in a TIMEORA-inspired editorial setting"
            fetchPriority="high"
            className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-110 transform scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0d]/90 via-transparent to-[#0b0b0d]/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#181824]/80 border border-[#2dd4bf]/30 text-[#2dd4bf] text-xs uppercase tracking-[0.25em] mb-6 backdrop-blur-md">
            <Sparkles size={14} />
            <span>Masterpieces of Haute Horlogerie</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            {BRAND_CONFIG.tagline}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 mb-10 font-light leading-relaxed tracking-wide">
            {BRAND_CONFIG.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              to="/watches"
              className="w-full sm:w-auto px-8 py-4 bg-[#2dd4bf] hover:bg-[#5eead4] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded-md transition-all shadow-xl shadow-[#2dd4bf]/20 flex items-center justify-center space-x-3 group"
            >
              <span>Shop Watches</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-[0.2em] rounded-md border border-white/20 hover:border-[#2dd4bf] transition-all flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <span>Explore Collection</span>
            </Link>
          </div>

          {/* Quick Pillars Under Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-white/10 text-left">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Accuracy</span>
              <span className="text-sm font-semibold text-gray-200">Chronometer Certified</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Material</span>
              <span className="text-sm font-semibold text-gray-200">Sapphire & 904L Steel</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Warranty</span>
              <span className="text-sm font-semibold text-gray-200">5-Year International</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Delivery</span>
              <span className="text-sm font-semibold text-gray-200">Complimentary Express</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED WATCHES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-4xl font-['Cinzel'] font-bold text-white tracking-wide">
              Featured Timepieces
            </h2>
          </div>
          <Link 
            to="/watches" 
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2dd4bf] hover:text-[#e6d5be] transition-colors font-medium group"
          >
            <span>View All Models</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredWatches.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWatches.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
          </div>
        ) : <CatalogNotice loading={loading} error={error} onRetry={refreshProducts} />}
      </section>

      {/* 3. GENDER COLLECTIONS SHOWCASE (MEN & WOMEN) */}
      <section className="py-12 bg-[#08080a] border-y border-[#181822]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Men's Showcase Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group border border-white/5">
              <img
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop"
                alt="Men's TIMEORA Collection"
                className="w-full h-full object-cover filter brightness-[0.5] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 sm:p-10 flex flex-col justify-end">
                <span className="text-[#2dd4bf] text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                  Gentlemen's Horology
                </span>
                <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white mb-2">
                  Men's Collection
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-sm mb-6 font-light leading-relaxed">
                  Engineered with bold architectural lines, chronographs, and titanium tourbillon movements.
                </p>
                <Link
                  to="/men"
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-white group-hover:text-[#2dd4bf] transition-colors"
                >
                  <span>Explore Men's Watches</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Women's Showcase Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group border border-white/5">
              <img
                src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop"
                alt="Women's TIMEORA Collection"
                className="w-full h-full object-cover filter brightness-[0.5] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-8 sm:p-10 flex flex-col justify-end">
                <span className="text-[#2dd4bf] text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                  Grace & Precision
                </span>
                <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white mb-2">
                  Women's Collection
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-sm mb-6 font-light leading-relaxed">
                  Hand-set diamond bezels, shimmering mother-of-pearl dials, and refined Milanese mesh.
                </p>
                <Link
                  to="/women"
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-semibold text-white group-hover:text-[#2dd4bf] transition-colors"
                >
                  <span>Explore Women's Watches</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. NEW ARRIVALS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
              Fresh From The Atelier
            </span>
            <h2 className="text-2xl sm:text-4xl font-['Cinzel'] font-bold text-white tracking-wide">
              New Arrivals
            </h2>
          </div>
          <Link 
            to="/new-arrivals" 
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2dd4bf] hover:text-[#e6d5be] transition-colors font-medium group"
          >
            <span>View All New Releases</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {newArrivals.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
          </div>
        ) : <CatalogNotice loading={loading} error={error} onRetry={refreshProducts} />}
      </section>

      {/* 5. BRAND HERITAGE / WHY CHOOSE TIMEORA */}
      <section className="py-20 bg-gradient-to-b from-[#0e0e13] to-[#08080a] border-y border-[#1c1c24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-3">
              Uncompromising Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-['Cinzel'] font-bold text-white mb-4">
              Why Choose {BRAND_CONFIG.name}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Every TIMEORA timepiece is not simply manufactured; it is sculpted, regulated, and inspected by master horologists committed to lifelong excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#14141c] border border-[#22222d] rounded-2xl p-8 transition-all hover:border-[#2dd4bf]/40 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#1c1c28] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] mb-6">
                <Clock size={26} />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white mb-3">
                In-House Calibre Precision
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Operating at high-beat frequencies of 28,800 vibrations per hour for seamless sweep movements and chronometric precision regulated in 5 positions.
              </p>
            </div>

            <div className="bg-[#14141c] border border-[#22222d] rounded-2xl p-8 transition-all hover:border-[#2dd4bf]/40 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#1c1c28] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] mb-6">
                <Gem size={26} />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white mb-3">
                Precious Materials & Sapphire
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Dual anti-reflective domed sapphire crystals, surgical 316L and marine 904L stainless steels, and genuine laboratory-grown conflict-free diamonds.
              </p>
            </div>

            <div className="bg-[#14141c] border border-[#22222d] rounded-2xl p-8 transition-all hover:border-[#2dd4bf]/40 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-[#1c1c28] border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf] mb-6">
                <ShieldCheck size={26} />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white mb-3">
                Bespoke 5-Year Protection
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enjoy peace of mind with our comprehensive five-year international manufacturer guarantee, backed by our direct private concierge atelier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
              Enduring Icons
            </span>
            <h2 className="text-2xl sm:text-4xl font-['Cinzel'] font-bold text-white tracking-wide">
              Best Sellers
            </h2>
          </div>
          <Link 
            to="/best-sellers" 
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2dd4bf] hover:text-[#e6d5be] transition-colors font-medium group"
          >
            <span>View All Best Sellers</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {bestSellers.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map(product => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
          </div>
        ) : <CatalogNotice loading={loading} error={error} onRetry={refreshProducts} />}
      </section>

      <section className="border-y border-white/10 bg-[#101411] py-16 sm:py-20" aria-labelledby="customer-support-heading">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8">
          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.25em] text-[#c4ad74]">Customer Support</span>
            <h2 id="customer-support-heading" className="font-['Cinzel'] text-2xl font-semibold text-white sm:text-3xl">A real person is one call away.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">Speak with TIMEORA about a product, your order, or choosing a timepiece. The number below opens your phone dialer; AI answering has not been enabled on this line.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a href="tel:+918469965711" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#2dd4bf] px-5 text-sm font-semibold text-[#10110e] transition hover:bg-[#5eead4]"><Phone size={17} />+91 8469965711</a>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('timeora:open-voice-support'))} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-[#2dd4bf] hover:text-[#5eead4]"><Headphones size={17} />Call TIMEORA AI</button>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
};

export default Home;

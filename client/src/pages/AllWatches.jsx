import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, RotateCcw } from 'lucide-react';
import { CATEGORIES, GENDERS } from '../data/watches';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { BRAND_CONFIG } from '../config/brandConfig';
import CatalogNotice from '../components/CatalogNotice';

const AllWatches = ({ 
  initialGender = 'All', 
  initialCategory = 'All', 
  pageTitle = 'All Timepieces',
  pageDescription = 'Explore our complete portfolio of precision-crafted horological masterpieces.' 
}) => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'newest', 'price-low', 'price-high', 'popularity'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Gender filter
      if (selectedGender !== 'All' && product.gender !== selectedGender && product.gender !== 'Unisex') {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      // Price filter
      const effectivePrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
      if (effectivePrice > maxPrice) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchMov = product.movement.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchMov && !matchSku) return false;
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
      const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'popularity') return b.reviewsCount - a.reviewsCount;
      // Default: featured / rating
      return b.rating - a.rating;
    });
  }, [products, selectedCategory, selectedGender, maxPrice, sortBy, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedGender(initialGender);
    setMaxPrice(5000);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
            The TIMEORA Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel'] font-bold text-white mb-4">
            {pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-light">
            {pageDescription}
          </p>
        </div>

        {/* Toolbar (Search, Filter Toggle Mobile, Sort) */}
        <div className="bg-[#121217] border border-[#22222d] rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search box inside toolbar */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, calibre, SKU..."
              className="w-full bg-[#181820] border border-[#2c2c38] rounded-lg pl-10 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 bg-[#1a1a24] border border-[#2e2e3e] rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-200"
            >
              <Filter size={15} className="text-[#2dd4bf]" />
              <span>Filters ({filteredProducts.length})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <ArrowUpDown size={15} className="text-[#2dd4bf] hidden sm:block" />
              <span className="text-xs uppercase tracking-wider text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort timepieces"
                className="bg-[#181820] border border-[#2c2c38] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2dd4bf] cursor-pointer"
              >
                <option value="featured">Featured & Curated</option>
                <option value="newest">Newest Releases</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Popularity / Most Reviewed</option>
              </select>
            </div>
          </div>

        </div>

        {/* Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters (Desktop) & Overlay (Mobile) */}
          <div className={`
            ${showFiltersMobile 
              ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto' 
              : 'hidden lg:block'
            }
          `}>
            <div className="bg-[#121217] border border-[#22222d] rounded-xl p-6 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#22222d]">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={18} className="text-[#2dd4bf]" />
                  <h3 className="font-['Cinzel'] uppercase tracking-widest text-sm font-bold text-white">
                    Refine Selection
                  </h3>
                </div>
                {showFiltersMobile ? (
                  <button onClick={() => setShowFiltersMobile(false)} className="text-gray-400">
                    <X size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={resetFilters} 
                    className="text-[11px] text-gray-400 hover:text-[#2dd4bf] flex items-center space-x-1"
                    title="Reset Filters"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-300 font-semibold mb-3">
                  Gender
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(gender => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                        selectedGender === gender
                          ? 'bg-[#2dd4bf] text-black border-[#2dd4bf] font-semibold'
                          : 'bg-[#181822] text-gray-400 border-[#2a2a35] hover:border-gray-500'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-300 font-semibold mb-3">
                  Horological Category
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        selectedCategory === category
                          ? 'bg-[#2dd4bf]/15 text-[#2dd4bf] font-semibold border border-[#2dd4bf]/30'
                          : 'text-gray-400 hover:bg-[#181822] hover:text-white'
                      }`}
                    >
                      <span>{category}</span>
                      {selectedCategory === category && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase tracking-widest text-gray-300 font-semibold">
                    Maximum Price
                  </label>
                  <span className="text-xs font-bold text-[#2dd4bf]">
                    {BRAND_CONFIG.currency}{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="700"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Filter by maximum price"
                  className="w-full accent-[#2dd4bf] bg-[#22222d] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>{BRAND_CONFIG.currency}700</span>
                  <span>{BRAND_CONFIG.currency}5,000+</span>
                </div>
              </div>

              {/* Results count & reset */}
              <div className="pt-2 border-t border-[#22222d] text-xs text-gray-400 flex items-center justify-between">
                <span>Showing {filteredProducts.length} watches</span>
                <button 
                  onClick={resetFilters} 
                  className="text-[#2dd4bf] hover:underline"
                >
                  Clear All
                </button>
              </div>

            </div>

            {showFiltersMobile && (
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="mt-4 w-full py-3 bg-[#2dd4bf] text-black font-semibold uppercase text-xs tracking-widest rounded-lg"
              >
                Apply & View ({filteredProducts.length}) Timepieces
              </button>
            )}
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 || error ? (
              <CatalogNotice loading={loading} error={error} onRetry={refreshProducts} />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#121217] border border-[#22222d] rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#181822] border border-[#2a2a35] mx-auto flex items-center justify-center text-[#2dd4bf]">
                  <Search size={28} />
                </div>
                <h3 className="font-['Cinzel'] text-xl font-bold text-white">No Matching Timepieces</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  We could not find any watches that match your criteria. Try adjusting your price range or selected categories.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#2dd4bf] text-black text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#5eead4] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

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

export default AllWatches;

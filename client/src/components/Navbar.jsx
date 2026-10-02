import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Watch, 
  ChevronRight,
  Shield 
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const isAdminRoute = location.pathname === '/admin';

  const accent = isAdminRoute
    ? { primary: '#818cf8', hover: '#a5b4fc', dark: '#6366f1', bg: '#111827', border: '#1e3048', pill: '#1e293b' }
    : { primary: '#2dd4bf', hover: '#5eead4', dark: '#14b8a6', bg: '#0f1715', border: '#1a2e28', pill: '#142420' };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Watches', path: '/watches' },
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Best Sellers', path: '/best-sellers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0b0b0d]/90 backdrop-blur-md border-b border-[#2a2a2a]/80 py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-[#0b0b0d]/90 via-[#0b0b0d]/50 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 focus:outline-none transition-colors"
                style={{ color: accent.primary }}
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/home" className="flex items-center space-x-2 group">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ borderColor: `${accent.primary}40`, backgroundColor: '#18181f', borderWidth: 1 }}
                >
                  <Watch size={18} style={{ color: accent.primary }} />
                </div>
                <div className="flex flex-col">
                  <span 
                    className="font-['Cinzel'] tracking-[0.25em] text-xl sm:text-2xl font-bold text-white transition-colors"
                    style={{ '--tw-text-opacity': 1 }}
                  >
                    {BRAND_CONFIG.name}
                  </span>
                  <span 
                    className="text-[9px] uppercase tracking-[0.3em] -mt-1 font-medium"
                    style={{ color: accent.primary }}
                  >
                    Geneve
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-xs uppercase tracking-[0.2em] font-medium transition-all relative py-1"
                    style={{ 
                      color: isActive ? accent.primary : '#d1d5db',
                      fontWeight: isActive ? 600 : 500
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = accent.primary}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    {link.name}
                    {isActive && (
                      <span 
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full animate-pulse"
                        style={{ backgroundColor: accent.primary }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Icons (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              
              {/* Search Button */}
              <button 
                onClick={onOpenSearch}
                className="p-1 transition-colors"
                style={{ color: '#d1d5db' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accent.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                title="Search Watches"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist Button */}
              <Link 
                to="/wishlist" 
                className="transition-colors relative p-1"
                style={{ color: '#d1d5db' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accent.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accent.primary }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="transition-colors relative p-1"
                style={{ color: '#d1d5db' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accent.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                title="Shopping Bag"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItemsCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accent.primary, boxShadow: `0 4px 12px ${accent.primary}40` }}
                  >
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {/* Account Link */}
              <Link 
                to={isAuthenticated ? "/account" : "/choose"} 
                className="transition-colors p-1 flex items-center space-x-1"
                style={{ color: '#d1d5db' }}
                onMouseEnter={(e) => e.currentTarget.style.color = accent.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
                title={isAuthenticated ? `Account (${user?.name})` : "Sign In"}
                aria-label="User Account"
              >
                <User size={20} />
                {isAuthenticated && (
                  <span className="hidden md:inline text-xs tracking-wider font-medium max-w-[80px] truncate" style={{ color: accent.primary }}>
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </Link>

              {/* Admin Panel Access - only visible to admin users */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-sm transition-all"
                  style={{ 
                    backgroundColor: isAdminRoute ? accent.primary : accent.pill,
                    borderColor: `${accent.primary}50`,
                    borderWidth: 1,
                    color: isAdminRoute ? '#000' : accent.primary
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = accent.primary; 
                    e.currentTarget.style.color = '#000'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = isAdminRoute ? accent.primary : accent.pill; 
                    e.currentTarget.style.color = isAdminRoute ? '#000' : accent.primary; 
                  }}
                  title="Atelier Admin Panel"
                >
                  <Shield size={12} />
                  <span>Admin</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm h-full overflow-y-auto p-6 flex flex-col justify-between z-50" style={{ backgroundColor: '#111116', borderRight: `1px solid ${accent.border}` }}>
            <div>
              <div className="flex items-center justify-between pb-6" style={{ borderBottom: `1px solid ${accent.border}` }}>
                <div className="flex items-center space-x-2">
                  <Watch size={20} style={{ color: accent.primary }} />
                  <span className="font-['Cinzel'] tracking-[0.2em] font-bold text-white text-lg">
                    {BRAND_CONFIG.name}
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="py-6 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center justify-between py-2.5 px-3 text-sm uppercase tracking-[0.15em] text-gray-200 rounded-md transition-all"
                    onMouseEnter={(e) => { e.currentTarget.style.color = accent.primary; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span>{link.name}</span>
                    <ChevronRight size={16} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 space-y-3" style={{ borderTop: `1px solid ${accent.border}` }}>
              <Link
                to={isAuthenticated ? "/account" : "/choose"}
                className="w-full block text-center py-2.5 px-4 text-black font-semibold text-xs tracking-widest uppercase rounded transition-colors"
                style={{ backgroundColor: accent.primary }}
              >
                {isAuthenticated ? "My Account" : "Sign In / Register"}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 border font-semibold text-xs tracking-widest uppercase rounded transition-colors"
                  style={{ backgroundColor: accent.pill, borderColor: `${accent.primary}40`, color: accent.primary }}
                >
                  <Shield size={14} />
                  <span>Admin Panel</span>
                </Link>
              )}
              <p className="text-center text-xs text-gray-500">
                {BRAND_CONFIG.tagline}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

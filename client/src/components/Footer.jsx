import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Watch, Mail, Phone, MapPin, ArrowRight, Check, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="bg-[#08080a] border-t border-[#1e1e24] text-gray-400 text-sm">
      {/* Brand Guarantees Banner */}
      <div className="border-b border-[#18181f] py-10 bg-[#0d0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/30 bg-[#15151c] flex items-center justify-center flex-shrink-0 text-[#2dd4bf]">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wider">Complimentary Express</h4>
                <p className="text-xs text-gray-400 mt-0.5">Insured global white-glove shipping</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/30 bg-[#15151c] flex items-center justify-center flex-shrink-0 text-[#2dd4bf]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wider">5-Year Global Warranty</h4>
                <p className="text-xs text-gray-400 mt-0.5">Full horological protection guarantee</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/30 bg-[#15151c] flex items-center justify-center flex-shrink-0 text-[#2dd4bf]">
                <RefreshCw size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wider">30-Day Curated Returns</h4>
                <p className="text-xs text-gray-400 mt-0.5">Effortless exchanges & returns</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full border border-[#2dd4bf]/30 bg-[#15151c] flex items-center justify-center flex-shrink-0 text-[#2dd4bf]">
                <Award size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-200 text-sm uppercase tracking-wider">Certified Precision</h4>
                <p className="text-xs text-gray-400 mt-0.5">Individually chronometer tested</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/home" className="flex items-center space-x-2">
              <Watch size={24} className="text-[#2dd4bf]" />
              <span className="font-['Cinzel'] tracking-[0.25em] text-2xl font-bold text-white">
                {BRAND_CONFIG.name}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {BRAND_CONFIG.subtitle}
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin size={16} className="text-[#2dd4bf] flex-shrink-0" />
                <span>{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone size={16} className="text-[#2dd4bf] flex-shrink-0" />
                <a href={`tel:${BRAND_CONFIG.contact.phoneE164}`} className="hover:text-[#2dd4bf]">{BRAND_CONFIG.contact.phone}</a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail size={16} className="text-[#2dd4bf] flex-shrink-0" />
                <span>{BRAND_CONFIG.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white uppercase tracking-[0.15em] font-semibold text-xs mb-5">Collections</h4>
            <ul className="space-y-3 text-xs tracking-wider">
              <li><Link to="/watches" className="hover:text-[#2dd4bf] transition-colors">All Timepieces</Link></li>
              <li><Link to="/men" className="hover:text-[#2dd4bf] transition-colors">Men's Collection</Link></li>
              <li><Link to="/women" className="hover:text-[#2dd4bf] transition-colors">Women's Collection</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-[#2dd4bf] transition-colors">New Releases</Link></li>
              <li><Link to="/best-sellers" className="hover:text-[#2dd4bf] transition-colors">Iconic Best Sellers</Link></li>
            </ul>
          </div>

          {/* Maison & Services */}
          <div>
            <h4 className="text-white uppercase tracking-[0.15em] font-semibold text-xs mb-5">The Maison</h4>
            <ul className="space-y-3 text-xs tracking-wider">
              <li><Link to="/about" className="hover:text-[#2dd4bf] transition-colors">Our Heritage</Link></li>
              <li><Link to="/contact" className="hover:text-[#2dd4bf] transition-colors">Private Concierge</Link></li>
              <li><Link to="/account" className="hover:text-[#2dd4bf] transition-colors">Patron Account</Link></li>
              <li><Link to="/orders" className="hover:text-[#2dd4bf] transition-colors">Track Order</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#2dd4bf] transition-colors">Curated Wishlist</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="text-white uppercase tracking-[0.15em] font-semibold text-xs mb-5">VIP Gazette</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Receive private invitations to limited horological releases and private collector events.
            </p>
            {subscribed ? (
              <div className="bg-[#2dd4bf]/10 border border-[#2dd4bf]/40 rounded p-3 text-[#2dd4bf] text-xs flex items-center space-x-2">
                <Check size={16} />
                <span>Thank you. You are now subscribed to the TIMEORA Gazette.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#14141a] border border-[#2a2a35] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2dd4bf] pr-10"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#2dd4bf] hover:bg-[#5eead4] text-black rounded flex items-center justify-center transition-colors"
                    title="Subscribe"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-gray-500 block">We respect your privacy. Unsubscribe anytime.</span>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#18181f] py-6 bg-[#060608]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} {BRAND_CONFIG.fullName}. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[11px] uppercase tracking-wider">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Horology</span>
            <span>•</span>
            <span className="hover:text-gray-400 cursor-pointer">Certificate of Authenticity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

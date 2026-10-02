import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const About = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-[#2dd4bf] uppercase tracking-[0.3em] block mb-2">
            The Philosophy of {BRAND_CONFIG.name}
          </span>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel'] font-bold text-white mb-6 leading-tight">
            Sculpting Eternity From Every Second
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            Founded with an unyielding obsession for horological perfection, TIMEORA marries traditional Swiss artisanal assembly with avant-garde materials engineering.
          </p>
        </div>

        {/* Narrative Section with Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative rounded-2xl overflow-hidden border border-[#22222d] aspect-[4/3] shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200"
              alt="TIMEORA Atelier Watchmaking"
              className="w-full h-full object-cover filter brightness-90"
            />
          </div>

          <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-light">
            <span className="text-xs text-[#2dd4bf] uppercase tracking-[0.25em] font-semibold block">
              Our Genesis
            </span>
            <h2 className="text-2xl sm:text-3xl font-['Cinzel'] font-bold text-white leading-snug">
              Not Merely a Watch, But an Heirloom for Generations
            </h2>
            <p>
              In an era dominated by transient digital gadgets, TIMEORA was conceived to preserve the sacred art of mechanical chronometry. We believe that true luxury is not loud; it is revealed in the whisper of an escapement vibrating at 28,800 beats per hour and the perfection of hand-chamfered bridges.
            </p>
            <p>
              Each timepiece produced under the TIMEORA insignia is strictly regulated in five distinct positions over three weeks of rigorous environmental and chronometric testing.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-4 bg-[#14141c] border border-[#22222d] rounded-xl">
                <span className="text-xl font-bold text-[#2dd4bf] font-['Cinzel'] block mb-1">100%</span>
                <span className="text-gray-400">Proprietary In-House Regulation</span>
              </div>
              <div className="p-4 bg-[#14141c] border border-[#22222d] rounded-xl">
                <span className="text-xl font-bold text-[#2dd4bf] font-['Cinzel'] block mb-1">5-Year</span>
                <span className="text-gray-400">Comprehensive Global Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[#121217] border border-[#22222e] rounded-2xl p-8 space-y-4">
            <Clock size={28} className="text-[#2dd4bf]" />
            <h3 className="font-['Cinzel'] text-lg font-bold text-white">Chronometric Rigor</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              We reject off-the-shelf mass calibration. Each balance wheel is dynamically adjusted and micro-weighted to ensure deviations remain well within chronometer tolerances.
            </p>
          </div>

          <div className="bg-[#121217] border border-[#22222e] rounded-2xl p-8 space-y-4">
            <Compass size={28} className="text-[#2dd4bf]" />
            <h3 className="font-['Cinzel'] text-lg font-bold text-white">Materials Without Compromise</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              From solid sapphire crystal cases to aerospace-grade titanium and hand-selected Tuscan alligator straps, only the most noble elements grace our workshop.
            </p>
          </div>

          <div className="bg-[#121217] border border-[#22222e] rounded-2xl p-8 space-y-4">
            <ShieldCheck size={28} className="text-[#2dd4bf]" />
            <h3 className="font-['Cinzel'] text-lg font-bold text-white">Direct-to-Patron Relationship</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              By offering our timepieces exclusively through our own boutique maison, we ensure every collector receives private concierge support directly from our creators.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] border border-[#28283a] rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl">
          <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white mb-4">
            Discover Your Signature Timepiece
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-8 max-w-md mx-auto">
            Experience the tactile weight, luminous sapphire, and unmatched precision of TIMEORA.
          </p>
          <Link
            to="/watches"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#2dd4bf] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-[#5eead4] transition-colors shadow-lg"
          >
            <span>View All Collections</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;

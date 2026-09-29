import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, RefreshCw, Watch } from 'lucide-react';

const CatalogNotice = ({ loading, error, onRetry, title, description }) => {
  if (loading) {
    return (
      <div className="border border-white/10 bg-[#111513] px-6 py-10 text-center" role="status" aria-live="polite">
        <span className="mx-auto mb-4 block size-8 animate-spin rounded-full border-2 border-white/15 border-t-[#2dd4bf]" />
        <p className="text-sm text-gray-300">Loading the live TIMEORA collection</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-rose-200/20 bg-rose-950/20 px-6 py-8 text-center" role="alert">
        <p className="text-sm font-medium text-white">Catalog connection unavailable</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-gray-400">{error}</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 border border-white/20 px-4 text-xs font-semibold text-white hover:border-[#b8a16a] hover:text-[#d6c18c]"><RefreshCw size={14} />Try again</button>}
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[#111513] px-6 py-9 text-center">
      <Watch size={22} aria-hidden="true" className="mx-auto mb-3 text-[#2dd4bf]" />
      <h3 className="font-['Cinzel'] text-lg font-semibold text-white">{title || 'The collection is being prepared'}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-400">{description || 'No watches are currently listed in the live catalog. TIMEORA will show product details and availability here once the store team adds verified items.'}</p>
      <Link to="/contact" className="mt-5 inline-flex min-h-10 items-center justify-center border border-white/20 px-4 text-xs font-semibold uppercase tracking-wide text-white hover:border-[#2dd4bf] hover:text-[#5eead4]">Contact TIMEORA</Link>
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500"><Clock3 size={12} />Availability is confirmed from the live store catalog</div>
    </div>
  );
};

export default CatalogNotice;

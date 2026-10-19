import React, { useEffect } from 'react';
import { X, ExternalLink, Bookmark, SlidersHorizontal } from 'lucide-react';
import type { CarListing } from '../utils/recommender.ts';
import { extractFeatureVector } from '../utils/recommender.ts';
import { VehicleSilhouette } from './VehicleSilhouette.tsx';

interface VehicleDetailModalProps {
  listing: CarListing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onPivotSimilar: (listing: CarListing) => void;
  highContrast: boolean;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onPivotSimilar,
  highContrast,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (listing) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listing, onClose]);

  if (!listing) return null;

  const featureVec = extractFeatureVector(listing);
  const fullName =
    listing.title || `${listing.year} ${listing.make} ${listing.model}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-vehicle-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border p-6 space-y-6 ${
          highContrast
            ? 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white'
            : 'bg-white text-zinc-900 border-zinc-200 dark:bg-[#18181B] dark:text-white dark:border-zinc-800 shadow-2xl'
        }`}
      >
        {/* Top Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono-tabular opacity-75">
              {listing.sourcePlatform} · Scraped{' '}
              {new Date(listing.scrapedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · {listing.location}
            </p>
            <h2
              id="modal-vehicle-title"
              className="text-xl font-bold tracking-tight mt-1"
            >
              {fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close specification dialog"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border cursor-pointer ${
              highContrast
                ? 'border-2 border-black text-black dark:border-white dark:text-white'
                : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Vehicle Image / Studio Silhouette */}
        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <VehicleSilhouette
            bodyStyle={listing.bodyStyle}
            make={listing.make}
            model={listing.model}
            year={listing.year}
            sourcePlatform={listing.sourcePlatform}
            imageUrl={listing.imageUrl}
            highContrast={highContrast}
          />
        </div>

        {/* Price & Ethiopian Portal Summary */}
        <div
          className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            highContrast
              ? 'border-2 border-black dark:border-white'
              : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800'
          }`}
        >
          <div>
            <span className="text-xs opacity-75 block">
              Listed Price on {listing.sourcePlatform}
            </span>
            <span className="text-2xl font-bold font-mono-tabular">
              ETB {listing.priceEtb.toLocaleString()}
            </span>
          </div>
          <div className="sm:text-right font-mono-tabular">
            <span className="text-xs opacity-75 block">Vehicle Condition</span>
            <span className="text-sm font-semibold">{listing.condition}</span>
          </div>
        </div>

        {/* Structured Technical Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm border-t border-b border-zinc-200 dark:border-zinc-800 py-4">
          <div>
            <span className="text-xs opacity-70 block">Make & Model</span>
            <span className="font-semibold">
              {listing.make} {listing.model}
            </span>
          </div>
          <div>
            <span className="text-xs opacity-70 block">Model Year</span>
            <span className="font-mono-tabular font-semibold">
              {listing.year}
            </span>
          </div>
          <div>
            <span className="text-xs opacity-70 block">Mileage</span>
            <span className="font-mono-tabular font-semibold">
              {listing.mileageKm.toLocaleString()} km
            </span>
          </div>
          <div>
            <span className="text-xs opacity-70 block">Body Style</span>
            <span className="font-semibold">{listing.bodyStyle}</span>
          </div>
          <div>
            <span className="text-xs opacity-70 block">
              Transmission & Drive
            </span>
            <span className="font-semibold">
              {listing.transmission} · {listing.drivetrain}
            </span>
          </div>
          <div>
            <span className="text-xs opacity-70 block">Fuel / Powertrain</span>
            <span className="font-semibold">{listing.fuelType}</span>
          </div>
        </div>

        {/* Scraped Description */}
        <div>
          <h3 className="text-xs font-semibold opacity-75 mb-1.5">
            Scraped Listing Summary ({listing.sourcePlatform})
          </h3>
          <p className="text-sm leading-relaxed opacity-90">
            {listing.description}
          </p>
        </div>

        {/* Normalized ML Feature Vector Readout */}
        <div
          className={`p-3.5 rounded-lg border text-xs font-mono-tabular space-y-1 ${
            highContrast
              ? 'border-black dark:border-white'
              : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800'
          }`}
        >
          <div className="font-semibold">
            ML 7D Normalized Feature Vector (ETB Price, Year, Km, Body, Trans, Fuel, Drive):
          </div>
          <div className="opacity-80 break-all">
            [{featureVec.map((v) => v.toFixed(2)).join(', ')}]
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onPivotSimilar(listing);
              onClose();
            }}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 cursor-pointer ${
              highContrast
                ? 'border-2 border-black text-black dark:border-white dark:text-white'
                : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Find Similar Within Budget</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(listing.id)}
            aria-pressed={isSaved}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border flex items-center gap-2 cursor-pointer ${
              highContrast
                ? 'border-2 border-black text-black dark:border-white dark:text-white'
                : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
              aria-hidden="true"
            />
            <span>{isSaved ? 'Saved in Watchlist' : 'Save to Watchlist'}</span>
          </button>

          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 ${
              highContrast
                ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
            }`}
          >
            <span>Open Listing on {listing.sourcePlatform}</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
};

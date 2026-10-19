import React from 'react';
import { ExternalLink, Bookmark, SlidersHorizontal } from 'lucide-react';
import type { CarListing, RecommendationResult } from '../utils/recommender.ts';
import { VehicleSilhouette } from './VehicleSilhouette.tsx';

interface ListingCardProps {
  listing: CarListing;
  recommendation?: RecommendationResult;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onInspect: (listing: CarListing) => void;
  onPivotSimilar: (listing: CarListing) => void;
  highContrast: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  recommendation,
  isSaved,
  onToggleSave,
  onInspect,
  onPivotSimilar,
  highContrast,
}) => {
  const fullName = listing.title || `${listing.year} ${listing.make} ${listing.model}`;

  return (
    <article
      className={`group rounded-xl overflow-hidden flex flex-col justify-between border transition-transform duration-150 hover:-translate-y-0.5 ${
        highContrast
          ? 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white'
          : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 dark:bg-[#18181B] dark:text-white dark:border-zinc-800 dark:hover:border-zinc-600'
      }`}
    >
      <div>
        {/* Scraped Ethiopian vehicle photo with studio architectural SVG fallback */}
        <VehicleSilhouette
          bodyStyle={listing.bodyStyle}
          make={listing.make}
          model={listing.model}
          year={listing.year}
          sourcePlatform={listing.sourcePlatform}
          imageUrl={listing.imageUrl}
          highContrast={highContrast}
        />

        <div className="p-5 space-y-3">
          {/* Unboxed inline metadata line (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs opacity-75 font-mono-tabular">
            <span>{listing.sourcePlatform}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.condition}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.location}</span>
          </div>

          {/* Primary Vehicle Title */}
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold tracking-tight leading-snug">
              {fullName}
            </h3>
          </div>

          {/* Price in Ethiopian Birr (ETB) */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 pt-0.5">
            <span className="text-base sm:text-lg font-bold font-mono-tabular whitespace-nowrap tracking-tight">
              ETB {listing.priceEtb.toLocaleString()}
            </span>
            <span className="text-xs font-mono-tabular opacity-75 whitespace-nowrap">
              {listing.bodyStyle}
            </span>
          </div>

          {/* Technical specification unboxed text separator row */}
          <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 text-xs font-mono-tabular flex flex-wrap items-center gap-1.5 opacity-85">
            <span>{listing.year}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.mileageKm.toLocaleString()} km</span>
            <span aria-hidden="true">·</span>
            <span>{listing.transmission}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.fuelType}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.drivetrain}</span>
          </div>

          {/* ML Similarity Breakdown (when rendered inside Recommendations section) */}
          {recommendation && (
            <div
              className={`pt-3 mt-2 border-t text-xs space-y-1.5 ${
                highContrast
                  ? 'border-black dark:border-white'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between font-mono-tabular font-semibold">
                <span>
                  ML Budget Similarity: {recommendation.similarityScore}%
                </span>
                <span className="opacity-75">
                  cos={recommendation.cosineSimilarity.toFixed(2)}
                </span>
              </div>
              <p className="opacity-80 leading-relaxed">
                {recommendation.reasons.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer with touch targets fitted cleanly within card width */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onInspect(listing)}
          aria-label={`Inspect specifications for ${fullName}`}
          className={`flex-1 min-w-0 min-h-[42px] px-2.5 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap cursor-pointer ${
            highContrast
              ? 'border-2 border-black text-black hover:bg-zinc-100 dark:border-white dark:text-white dark:hover:bg-zinc-900'
              : 'border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800'
          }`}
        >
          Details
        </button>

        <button
          type="button"
          onClick={() => onPivotSimilar(listing)}
          title="Search similar Ethiopian cars within this vehicle's budget"
          aria-label={`Find similar cars to ${fullName}`}
          className={`min-h-[42px] min-w-[40px] px-2 py-2 text-xs font-medium rounded-lg border flex items-center justify-center shrink-0 cursor-pointer ${
            highContrast
              ? 'border-2 border-black text-black hover:bg-zinc-100 dark:border-white dark:text-white dark:hover:bg-zinc-900'
              : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onToggleSave(listing.id)}
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? `Remove ${fullName} from saved watchlist`
              : `Save ${fullName} to watchlist`
          }
          className={`min-h-[42px] min-w-[40px] px-2 py-2 text-xs font-medium rounded-lg border flex items-center justify-center shrink-0 cursor-pointer ${
            isSaved
              ? highContrast
                ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
              : highContrast
              ? 'border-2 border-black text-black dark:border-white dark:text-white'
              : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>

        <a
          href={listing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${fullName} on ${listing.sourcePlatform}`}
          className={`min-h-[42px] px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0 ${
            highContrast
              ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white'
              : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
          }`}
        >
          <span>Source</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

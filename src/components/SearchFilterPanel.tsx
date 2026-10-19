import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { SearchCriteria } from '../utils/recommender.ts';

interface SearchFilterPanelProps {
  criteria: SearchCriteria;
  onChangeCriteria: (updated: SearchCriteria) => void;
  onReset: () => void;
  onSubmitSearch: (overrideCriteria?: SearchCriteria) => void;
  isSearching: boolean;
  highContrast: boolean;
}

const CAR_TYPES = [
  'All',
  'Sedan',
  'SUV',
  'Compact / Hatchback',
  'Pickup / Truck',
  'Van / Minibus',
  'Coupe',
  'Wagon',
];

const ETHIOPIAN_SOURCES = [
  'All',
  'Mekina.net',
  'AfroMekina',
  'EthioCars',
  'EthioCarMarket',
  'Jiji Ethiopia',
];

export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({
  criteria,
  onChangeCriteria,
  onReset,
  onSubmitSearch,
  isSearching,
  highContrast,
}) => {
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasMake = Boolean(criteria.make && criteria.make.trim());
    const hasModel = Boolean(criteria.model && criteria.model.trim());
    const hasBudget = Boolean(criteria.maxPrice && criteria.maxPrice > 0);
    const hasMinYear = Boolean(criteria.minYear && criteria.minYear > 1900);
    const hasMaxYear = Boolean(criteria.maxYear && criteria.maxYear > 1900);
    const hasType = Boolean(criteria.bodyStyle && criteria.bodyStyle !== 'All');
    const hasSource = Boolean(
      criteria.sourcePlatform && criteria.sourcePlatform !== 'All'
    );

    if (
      !hasMake &&
      !hasModel &&
      !hasBudget &&
      !hasMinYear &&
      !hasMaxYear &&
      !hasType &&
      !hasSource
    ) {
      setValidationError(
        'Enter at least a make, model, car type, ETB budget, or year to scrape Ethiopian listings.'
      );
      return;
    }

    setValidationError('');
    onSubmitSearch();
  };

  const handleReset = () => {
    setValidationError('');
    onReset();
  };

  const applyQuickPreset = (preset: SearchCriteria) => {
    setValidationError('');
    onChangeCriteria(preset);
    onSubmitSearch(preset);
  };

  const inputBaseClass = highContrast
    ? 'w-full min-h-[46px] px-3.5 py-2.5 text-sm rounded-lg bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white focus:outline-none'
    : 'w-full min-h-[46px] px-3.5 py-2.5 text-sm rounded-lg bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-400 focus:border-zinc-900 dark:bg-[#121214] dark:text-white dark:border-zinc-700 dark:hover:border-zinc-600 dark:focus:border-white focus:outline-none';

  return (
    <section
      aria-label="Ethiopian Vehicle Search Criteria"
      className={`rounded-xl p-5 sm:p-6 border ${
        highContrast
          ? 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white'
          : 'bg-zinc-100/70 text-zinc-900 border-zinc-200 dark:bg-[#18181B] dark:text-white dark:border-zinc-800'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Make */}
          <div>
            <label
              htmlFor="input-make"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Make
            </label>
            <input
              id="input-make"
              type="text"
              placeholder="e.g. Toyota, Suzuki, Hyundai, BYD"
              value={criteria.make === 'All' ? '' : criteria.make || ''}
              onChange={(e) => {
                if (validationError) setValidationError('');
                onChangeCriteria({ ...criteria, make: e.target.value });
              }}
              className={inputBaseClass}
            />
          </div>

          {/* Model */}
          <div>
            <label
              htmlFor="input-model"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Model
            </label>
            <input
              id="input-model"
              type="text"
              placeholder="e.g. Vitz, Dzire, CHR, Swift, Yaris"
              value={criteria.model || ''}
              onChange={(e) => {
                if (validationError) setValidationError('');
                onChangeCriteria({ ...criteria, model: e.target.value });
              }}
              className={inputBaseClass}
            />
          </div>

          {/* Car Type / Body Style */}
          <div>
            <label
              htmlFor="input-body-style"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Car Type
            </label>
            <select
              id="input-body-style"
              value={criteria.bodyStyle || 'All'}
              onChange={(e) => {
                if (validationError) setValidationError('');
                onChangeCriteria({ ...criteria, bodyStyle: e.target.value });
              }}
              className={inputBaseClass}
            >
              {CAR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'Any Car Type' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Max Budget in ETB */}
          <div>
            <label
              htmlFor="input-max-price"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Max Budget (ETB)
            </label>
            <input
              id="input-max-price"
              type="number"
              min="200000"
              step="100000"
              placeholder="e.g. 5000000"
              value={criteria.maxPrice ?? ''}
              onChange={(e) => {
                if (validationError) setValidationError('');
                const val = e.target.value ? Number(e.target.value) : undefined;
                onChangeCriteria({ ...criteria, maxPrice: val });
              }}
              className={`${inputBaseClass} font-mono-tabular`}
            />
          </div>

          {/* Min Year */}
          <div>
            <label
              htmlFor="input-min-year"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Minimum Year
            </label>
            <input
              id="input-min-year"
              type="number"
              min="1985"
              max="2026"
              placeholder="e.g. 2015"
              value={criteria.minYear ?? ''}
              onChange={(e) => {
                if (validationError) setValidationError('');
                const val = e.target.value ? Number(e.target.value) : undefined;
                onChangeCriteria({ ...criteria, minYear: val });
              }}
              className={`${inputBaseClass} font-mono-tabular`}
            />
          </div>

          {/* Ethiopian Marketplace Source Filter */}
          <div>
            <label
              htmlFor="input-source-platform"
              className="block text-xs font-semibold mb-1.5 tracking-tight"
            >
              Ethiopian Source Website
            </label>
            <select
              id="input-source-platform"
              value={criteria.sourcePlatform || 'All'}
              onChange={(e) => {
                if (validationError) setValidationError('');
                onChangeCriteria({
                  ...criteria,
                  sourcePlatform: e.target.value,
                });
              }}
              className={inputBaseClass}
            >
              {ETHIOPIAN_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src === 'All' ? 'All Ethiopian Portals' : src}
                </option>
              ))}
            </select>
          </div>
        </div>

        {validationError && (
          <p
            role="alert"
            className="text-xs font-medium pt-1 text-zinc-900 dark:text-white underline underline-offset-4"
          >
            {validationError}
          </p>
        )}

        {/* Quick Ethiopian Search Shortcuts + Action Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="opacity-70 font-medium mr-1">Quick Search:</span>
            <button
              type="button"
              onClick={() =>
                applyQuickPreset({
                  make: 'Toyota',
                  model: '',
                  maxPrice: 7_500_000,
                  bodyStyle: 'All',
                  sortBy: 'relevance',
                })
              }
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 font-medium cursor-pointer"
            >
              Toyota ≤ 7.5M ETB
            </button>
            <button
              type="button"
              onClick={() =>
                applyQuickPreset({
                  make: 'Suzuki',
                  model: '',
                  maxPrice: 5_500_000,
                  bodyStyle: 'All',
                  sortBy: 'relevance',
                })
              }
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 font-medium cursor-pointer"
            >
              Suzuki ≤ 5.5M ETB
            </button>
            <button
              type="button"
              onClick={() =>
                applyQuickPreset({
                  make: '',
                  model: '',
                  bodyStyle: 'SUV',
                  maxPrice: 12_000_000,
                  sortBy: 'relevance',
                })
              }
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 font-medium cursor-pointer"
            >
              Addis SUVs ≤ 12M ETB
            </button>
            <button
              type="button"
              onClick={() =>
                applyQuickPreset({
                  make: 'BYD',
                  model: '',
                  bodyStyle: 'All',
                  sortBy: 'relevance',
                })
              }
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 font-medium cursor-pointer"
            >
              BYD Electric
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0">
            <button
              id="clear-search-btn"
              type="button"
              onClick={handleReset}
              className={`min-h-[46px] px-5 py-2.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                highContrast
                  ? 'border-2 border-black text-black hover:bg-zinc-100 dark:border-white dark:text-white dark:hover:bg-zinc-900'
                  : 'border-zinc-300 text-zinc-700 hover:bg-zinc-200/60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Clear</span>
            </button>

            <button
              id="submit-search-btn"
              type="submit"
              disabled={isSearching}
              className={`min-h-[46px] px-6 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                highContrast
                  ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
              } disabled:opacity-60`}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>
                {isSearching
                  ? 'Scraping Ethiopian Sites...'
                  : 'Search Ethiopian Cars'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

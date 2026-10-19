import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink } from 'lucide-react';
import type {
  CarListing,
  SearchCriteria,
  RecommendationResult,
  ScrapeSourceReport,
} from './utils/recommender.ts';
import { Navbar } from './components/Navbar.tsx';
import { SearchFilterPanel } from './components/SearchFilterPanel.tsx';
import { ListingCard } from './components/ListingCard.tsx';
import { VehicleDetailModal } from './components/VehicleDetailModal.tsx';
import { StickyAccessibilityFooter } from './components/StickyAccessibilityFooter.tsx';

const INITIAL_CRITERIA: SearchCriteria = {
  make: '',
  model: '',
  minYear: undefined,
  maxYear: undefined,
  maxPrice: undefined,
  bodyStyle: 'All',
  sourcePlatform: 'All',
  sortBy: 'relevance',
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('autoindex_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autoindex_contrast') === 'high';
    } catch {
      return false;
    }
  });

  const [largeText, setLargeText] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<
    'search' | 'results' | 'recommendations'
  >('search');

  const [criteria, setCriteria] = useState<SearchCriteria>(INITIAL_CRITERIA);
  const [submittedCriteria, setSubmittedCriteria] =
    useState<SearchCriteria | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Populated strictly from live Ethiopian scraper & ML recommender responses (zero hardcoded listings)
  const [listings, setListings] = useState<CarListing[]>([]);
  const [recommendations, setRecommendations] = useState<
    RecommendationResult[]
  >([]);
  const [sourceReports, setSourceReports] = useState<ScrapeSourceReport[]>([]);
  const [totalPoolScraped, setTotalPoolScraped] = useState<number>(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [inspectedCar, setInspectedCar] = useState<CarListing | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('autoindex_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    try {
      localStorage.setItem(
        'autoindex_contrast',
        highContrast ? 'high' : 'normal'
      );
    } catch {
      // ignore
    }
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-scale', largeText ? 'large' : 'normal');
  }, [largeText]);

  const executeScrapeSearch = async (targetCriteria: SearchCriteria) => {
    setIsSearching(true);
    setSubmittedCriteria({ ...targetCriteria });

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetCriteria),
      });
      if (res.ok) {
        const data = await res.json();
        setListings(Array.isArray(data.listings) ? data.listings : []);
        setRecommendations(
          Array.isArray(data.recommendations) ? data.recommendations : []
        );
        setSourceReports(
          Array.isArray(data.sourceReports) ? data.sourceReports : []
        );
        setTotalPoolScraped(Number(data.totalScrapedPoolSize) || 0);
      }
    } catch {
      setListings([]);
      setRecommendations([]);
      setSourceReports([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (overrideCriteria?: SearchCriteria) => {
    const active = overrideCriteria || criteria;
    void executeScrapeSearch(active);
  };

  const handleReset = () => {
    setCriteria(INITIAL_CRITERIA);
    setSubmittedCriteria(null);
    setListings([]);
    setRecommendations([]);
    setSourceReports([]);
    setTotalPoolScraped(0);
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePivotSimilar = (selected: CarListing) => {
    const nextCriteria: SearchCriteria = {
      make: selected.make,
      model: selected.model,
      bodyStyle: selected.bodyStyle,
      maxPrice: selected.priceEtb,
      minYear: Math.max(1990, selected.year - 2),
      sourcePlatform: 'All',
      sortBy: 'relevance',
    };
    setCriteria(nextCriteria);
    void executeScrapeSearch(nextCriteria);
  };

  const formatSearchSummary = (c: SearchCriteria): string => {
    const parts: string[] = [];
    if (c.make && c.make.trim()) parts.push(c.make.trim());
    if (c.model && c.model.trim()) parts.push(c.model.trim());
    if (c.bodyStyle && c.bodyStyle !== 'All') parts.push(c.bodyStyle);
    if (c.maxPrice) parts.push(`Up to ETB ${c.maxPrice.toLocaleString()}`);
    if (c.minYear && c.maxYear) {
      parts.push(`${c.minYear}–${c.maxYear}`);
    } else if (c.minYear) {
      parts.push(`${c.minYear}+`);
    } else if (c.maxYear) {
      parts.push(`Up to ${c.maxYear}`);
    }
    if (c.sourcePlatform && c.sourcePlatform !== 'All') {
      parts.push(`on ${c.sourcePlatform}`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'All Ethiopian Vehicles';
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${
        highContrast
          ? 'bg-white text-black dark:bg-black dark:text-white'
          : 'bg-white text-zinc-900 dark:bg-[#121214] dark:text-white'
      }`}
    >
      {/* Top Responsive Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === 'light' ? 'dark' : 'light'))
        }
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((hc) => !hc)}
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />

      {/* Centered Content Layout */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10 space-y-11">
        {/* Section 1: Search Header & Filter Console */}
        <section id="section-search" className="space-y-5 scroll-mt-6">
          <div className="space-y-2 max-w-2xl">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Find cars across Ethiopian marketplaces in one place.
            </h1>
            <p className="text-sm sm:text-base opacity-75 leading-relaxed">
              Search by make, model, car type, ETB budget, and year. AutoIndex scrapes live listings across Mekina.net, AfroMekina, EthioCars, EthioCarMarket, Jiji Ethiopia, and Ethiopian Facebook Marketplace, then recommends similar vehicles within your budget.
            </p>
          </div>

          <SearchFilterPanel
            criteria={criteria}
            onChangeCriteria={setCriteria}
            onReset={handleReset}
            onSubmitSearch={handleSearch}
            isSearching={isSearching}
            highContrast={highContrast}
          />

          {/* Live Ethiopian Source Scraper Status & Direct Marketplace Portals */}
          {sourceReports.length > 0 && (
            <div
              aria-label="Ethiopian Marketplace Scraper Status"
              className={`rounded-xl border p-4 space-y-3 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold">
                  Ethiopian Marketplaces Scraped ({totalPoolScraped} live ETB listings indexed)
                </span>
                <span className="font-mono-tabular opacity-75">
                  Direct portals + pre-filtered external search links
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sourceReports.map((rep) => (
                  <a
                    key={rep.platform}
                    href={rep.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                      highContrast
                        ? 'border-black dark:border-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        : 'bg-white border-zinc-200 hover:border-zinc-400 dark:bg-[#121214] dark:border-zinc-800 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {rep.platform}
                      </div>
                      <div className="text-[11px] opacity-75 font-mono-tabular truncate">
                        {rep.status === 'scraped'
                          ? `${rep.listingsScraped} scraped · ${rep.matchedCount} matched (${rep.responseTimeMs}ms)`
                          : 'Open pre-filtered ETB search'}
                      </div>
                    </div>
                    <ExternalLink
                      className="w-3.5 h-3.5 shrink-0 opacity-70"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Marketplace Listings Results */}
        <section
          id="section-results"
          aria-labelledby="heading-search-results"
          className="space-y-5 scroll-mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2
              id="heading-search-results"
              className="text-lg sm:text-xl font-bold tracking-tight"
            >
              Ethiopian Marketplace Listings
              {submittedCriteria && !isSearching ? ` (${listings.length})` : ''}
            </h2>
            {submittedCriteria && (
              <p className="text-xs font-mono-tabular opacity-75">
                Query: {formatSearchSummary(submittedCriteria)}
              </p>
            )}
          </div>

          {isSearching ? (
            <div
              className={`rounded-xl border p-8 sm:p-10 text-center space-y-2 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <h3 className="text-sm font-semibold">
                Scraping live Ethiopian car websites...
              </h3>
              <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
                Fetching real-time ETB vehicle listings from Mekina.net, AfroMekina, EthioCars, EthioCarMarket, and Jiji Ethiopia.
              </p>
            </div>
          ) : !submittedCriteria ? (
            <div
              className={`rounded-xl border p-8 sm:p-10 text-center space-y-2 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <Search
                className="w-5 h-5 mx-auto opacity-60"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold">
                No search submitted yet
              </h3>
              <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
                Enter your target make, model, car type, ETB budget, or year above and select Search Ethiopian Cars to scrape live listings across Ethiopian marketplaces.
              </p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((car) => (
                <ListingCard
                  key={car.id}
                  listing={car}
                  isSaved={savedIds.includes(car.id)}
                  onToggleSave={handleToggleSave}
                  onInspect={setInspectedCar}
                  onPivotSimilar={handlePivotSimilar}
                  highContrast={highContrast}
                />
              ))}
            </div>
          ) : (
            <div
              className={`rounded-xl border p-8 sm:p-10 text-center space-y-2 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <h3 className="text-sm font-semibold">
                No exact match for: {formatSearchSummary(submittedCriteria)}
              </h3>
              <p className="text-xs opacity-75 max-w-lg mx-auto leading-relaxed">
                No exact listing matched all strict filters across the {totalPoolScraped} live scraped Ethiopian cars. Check the ML-recommended similar cars within your budget below or open the pre-filtered Jiji Ethiopia and Facebook Marketplace links above.
              </p>
            </div>
          )}
        </section>

        {/* Section 3: ML Similar Car Recommendations Within Budget */}
        <section
          id="section-recommendations"
          aria-labelledby="heading-similar-cars"
          className="space-y-5 pb-8 scroll-mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2
              id="heading-similar-cars"
              className="text-lg sm:text-xl font-bold tracking-tight"
            >
              Similar Cars Within Your Budget
              {submittedCriteria && !isSearching && recommendations.length > 0
                ? ` (${recommendations.length})`
                : ''}
            </h2>
            <p className="text-xs opacity-75">
              ML 7D feature-vector recommendations calibrated to your ETB budget and vehicle profile
            </p>
          </div>

          {!submittedCriteria ? (
            <div
              className={`rounded-xl border p-8 sm:p-10 text-center space-y-2 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <Sparkles
                className="w-5 h-5 mx-auto opacity-60"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold">
                Waiting for your car search
              </h3>
              <p className="text-xs opacity-75 max-w-md mx-auto leading-relaxed">
                Search for a car above to see ML-ranked similar Ethiopian vehicles within your ETB budget ceiling, body type, and model year.
              </p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <ListingCard
                  key={`rec-${rec.listing.id}`}
                  listing={rec.listing}
                  recommendation={rec}
                  isSaved={savedIds.includes(rec.listing.id)}
                  onToggleSave={handleToggleSave}
                  onInspect={setInspectedCar}
                  onPivotSimilar={handlePivotSimilar}
                  highContrast={highContrast}
                />
              ))}
            </div>
          ) : (
            <div
              className={`rounded-xl border p-8 sm:p-10 text-center space-y-2 ${
                highContrast
                  ? 'border-2 border-black dark:border-white'
                  : 'bg-zinc-50/70 border-zinc-200 dark:bg-[#18181B] dark:border-zinc-800'
              }`}
            >
              <h3 className="text-sm font-semibold">
                Target profile: {formatSearchSummary(submittedCriteria)}
              </h3>
              <p className="text-xs opacity-75 max-w-lg mx-auto leading-relaxed">
                {isSearching
                  ? 'Computing 7D cosine similarity and budget proximity across scraped Ethiopian listings...'
                  : 'Adjust your ETB budget ceiling or search criteria above to discover more similar vehicles.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Detailed Vehicle Specification Modal */}
      <VehicleDetailModal
        listing={inspectedCar}
        onClose={() => setInspectedCar(null)}
        isSaved={inspectedCar ? savedIds.includes(inspectedCar.id) : false}
        onToggleSave={handleToggleSave}
        onPivotSimilar={handlePivotSimilar}
        highContrast={highContrast}
      />

      {/* Sticky Footer for Accessibility Information & Theme/Contrast Controls */}
      <StickyAccessibilityFooter
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === 'light' ? 'dark' : 'light'))
        }
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((hc) => !hc)}
        largeText={largeText}
        onToggleLargeText={() => setLargeText((lt) => !lt)}
      />
    </div>
  );
}

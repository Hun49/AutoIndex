import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  activeSection: 'search' | 'results' | 'recommendations';
  onNavigate: (section: 'search' | 'results' | 'recommendations') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  highContrast,
  onToggleHighContrast,
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: 'search' | 'results' | 'recommendations') => {
    onNavigate(section);
    setMobileMenuOpen(false);
    const el = document.getElementById(`section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`w-full border-b ${
        highContrast
          ? 'bg-white text-black border-black border-b-2 dark:bg-black dark:text-white dark:border-white'
          : 'bg-white text-zinc-900 border-zinc-200 dark:bg-[#121214] dark:text-white dark:border-zinc-800'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#section-search"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('search');
          }}
          className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          AutoIndex
        </a>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className={`py-2 whitespace-nowrap shrink-0 underline-offset-8 transition-colors cursor-pointer ${
              activeSection === 'search'
                ? 'underline font-semibold'
                : 'opacity-70 hover:opacity-100 hover:underline'
            }`}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('results')}
            className={`py-2 whitespace-nowrap shrink-0 underline-offset-8 transition-colors cursor-pointer ${
              activeSection === 'results'
                ? 'underline font-semibold'
                : 'opacity-70 hover:opacity-100 hover:underline'
            }`}
          >
            Listings
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('recommendations')}
            className={`py-2 whitespace-nowrap shrink-0 underline-offset-8 transition-colors cursor-pointer ${
              activeSection === 'recommendations'
                ? 'underline font-semibold'
                : 'opacity-70 hover:opacity-100 hover:underline'
            }`}
          >
            Similar Cars
          </button>
        </nav>

        {/* Zone 3: Theme Toggle + Mobile Hamburger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              highContrast
                ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
            }`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          <button
            id="mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border cursor-pointer ${
              highContrast
                ? 'border-2 border-black text-black dark:border-white dark:text-white'
                : 'border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className={`md:hidden border-t px-4 py-3 space-y-1 ${
            highContrast
              ? 'bg-white text-black border-black border-t-2 dark:bg-black dark:text-white dark:border-white'
              : 'bg-zinc-50 text-zinc-900 border-zinc-200 dark:bg-[#18181B] dark:text-white dark:border-zinc-800'
          }`}
        >
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className={`w-full min-h-[48px] px-3 text-left text-sm font-medium rounded-lg flex items-center justify-between ${
              activeSection === 'search'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 font-semibold'
                : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>Search Cars</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('results')}
            className={`w-full min-h-[48px] px-3 text-left text-sm font-medium rounded-lg flex items-center justify-between ${
              activeSection === 'results'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 font-semibold'
                : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>Marketplace Listings</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('recommendations')}
            className={`w-full min-h-[48px] px-3 text-left text-sm font-medium rounded-lg flex items-center justify-between ${
              activeSection === 'recommendations'
                ? 'bg-zinc-200/80 dark:bg-zinc-800 font-semibold'
                : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
            }`}
          >
            <span>Similar Car Recommendations</span>
          </button>

          <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onToggleHighContrast}
              aria-pressed={highContrast}
              className={`w-full min-h-[48px] px-3 text-left text-sm font-medium rounded-lg border flex items-center justify-between ${
                highContrast
                  ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <span>High-Contrast Mode</span>
              <span className="font-mono-tabular text-xs">
                {highContrast ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

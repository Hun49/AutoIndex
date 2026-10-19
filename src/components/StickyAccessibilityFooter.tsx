import React, { useState } from 'react';
import { Eye, Sun, Moon, Type, Info, X } from 'lucide-react';

interface StickyAccessibilityFooterProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  largeText: boolean;
  onToggleLargeText: () => void;
}

export const StickyAccessibilityFooter: React.FC<StickyAccessibilityFooterProps> = ({
  theme,
  onToggleTheme,
  highContrast,
  onToggleHighContrast,
  largeText,
  onToggleLargeText,
}) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <footer
        aria-label="Accessibility Controls and Platform Disclosure"
        className={`sticky bottom-0 left-0 right-0 z-30 border-t ${
          highContrast
            ? 'bg-white text-black border-t-2 border-black dark:bg-black dark:text-white dark:border-white'
            : 'bg-white/95 text-zinc-900 border-zinc-200 backdrop-blur-xs dark:bg-[#121214]/95 dark:text-white dark:border-zinc-800'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-2 sm:gap-4 text-xs">
          {/* Left: Aggregator & Accessibility Statement Trigger */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              id="accessibility-info-btn"
              type="button"
              onClick={() => setInfoOpen((prev) => !prev)}
              aria-expanded={infoOpen}
              aria-label="Open Accessibility and Aggregator Disclosure Information"
              className="min-h-[40px] flex items-center gap-1.5 font-medium underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Accessibility</span>
              <span className="hidden sm:inline">Accessibility & Disclosure</span>
            </button>
            <span className="hidden lg:inline opacity-70 truncate">
              · Independent listing aggregator (we do not sell or publish user vehicles)
            </span>
          </div>

          {/* Right: Direct Accessibility Controls (Theme, High Contrast, Text Scale) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="contrast-toggle-btn"
              type="button"
              onClick={onToggleHighContrast}
              aria-pressed={highContrast}
              aria-label={
                highContrast
                  ? 'Disable High-Contrast Accessibility Mode'
                  : 'Enable High-Contrast Accessibility Mode'
              }
              className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                highContrast
                  ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white font-semibold'
                  : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">{highContrast ? 'AAA' : 'Contrast'}</span>
              <span className="hidden sm:inline">
                {highContrast ? 'Contrast: High (AAA)' : 'High Contrast'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleLargeText}
              aria-pressed={largeText}
              aria-label={
                largeText
                  ? 'Reset text scale to 100 percent'
                  : 'Increase text scale to 110 percent'
              }
              className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer font-mono-tabular ${
                largeText
                  ? highContrast
                    ? 'bg-black text-white border-2 border-black dark:bg-white dark:text-black dark:border-white font-semibold'
                    : 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                  : highContrast
                  ? 'border-2 border-black text-black dark:border-white dark:text-white'
                  : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Type className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Text</span>
              <span>{largeText ? '110%' : '100%'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Activate Dark Mode theme'
                  : 'Activate Light Mode theme'
              }
              className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                highContrast
                  ? 'border-2 border-black text-black dark:border-white dark:text-white font-semibold'
                  : 'border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Accessibility & Aggregator Compliance Dialog */}
      {infoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-dialog-title"
          onClick={() => setInfoOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-xl border p-6 space-y-4 ${
              highContrast
                ? 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white'
                : 'bg-white text-zinc-900 border-zinc-200 dark:bg-[#18181B] dark:text-white dark:border-zinc-800 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 id="accessibility-dialog-title" className="text-base font-bold">
                Accessibility Standards & Aggregator Notice
              </h2>
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                aria-label="Close accessibility information"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-current cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3 text-sm leading-relaxed opacity-90">
              <p>
                <strong>WCAG 2.1 AA / AAA Accessibility:</strong> AutoIndex supports both Light Mode (Pure White, Light Grey, Dark Charcoal) and Dark Mode (Dark Charcoal, Dark Grey, Pure White), paired with an independent High-Contrast Mode that enforces maximum luminance contrast (21:1) and 3px solid keyboard focus indicators.
              </p>
              <p>
                <strong>Touch & Keyboard Ergonomics:</strong> All interactive controls maintain a minimum 44×44px touch target, semantic native HTML landmarks, and respect operating-system reduced-motion preferences.
              </p>
              <p>
                <strong>Independent Ethiopian Multi-Site Aggregator:</strong> AutoIndex does not sell vehicles, hold inventory, or accept user-published listings. All listings are scraped and indexed live from Ethiopian automotive marketplaces (Mekina.net, AfroMekina, EthioCars, EthioCarMarket, Jiji Ethiopia, and Ethiopian Facebook Marketplace) and link directly to their source.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

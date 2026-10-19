import React, { useState, useEffect } from 'react';
import type { BodyStyle } from '../utils/recommender.ts';

interface VehicleSilhouetteProps {
  bodyStyle: BodyStyle;
  make: string;
  model: string;
  year: number;
  sourcePlatform: string;
  imageUrl?: string;
  highContrast: boolean;
}

export const VehicleSilhouette: React.FC<VehicleSilhouetteProps> = ({
  bodyStyle,
  make,
  model,
  year,
  sourcePlatform,
  imageUrl,
  highContrast,
}) => {
  // stage 0: same-origin /api/image proxy (bypasses ISP blocks, hotlink/Referer rules, and CORS/CORP)
  // stage 1: direct imageUrl with no-referrer fallback
  // stage 2: architectural SVG silhouette fallback
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setStage(0);
  }, [imageUrl]);

  const resolvedSrc =
    !imageUrl || stage === 2
      ? undefined
      : imageUrl.startsWith('/api/image')
      ? stage === 0
        ? imageUrl
        : undefined
      : stage === 0
      ? `/api/image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl;

  const renderProfilePath = () => {
    switch (bodyStyle) {
      case 'Coupe':
        return (
          <g>
            <path
              d="M34 112 L52 94 L98 90 L142 66 C168 64 205 65 232 76 L278 94 L308 100 L312 114 L282 116 M64 116 L112 116 M112 116 L228 116"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M108 89 L144 70 L218 72 L252 90 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        );
      case 'SUV':
        return (
          <g>
            <path
              d="M36 112 L40 84 L90 80 L118 54 L268 54 L288 84 L306 90 L308 112"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M102 80 L124 60 L188 60 L188 80 Z M196 60 L262 60 L276 80 L196 80 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="112"
              y1="114"
              x2="228"
              y2="114"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
            />
          </g>
        );
      case 'Wagon':
      case 'Van / Minibus':
        return (
          <g>
            <path
              d="M32 112 L40 82 L88 78 L112 52 L286 52 L298 84 L308 96 L310 112"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M96 78 L116 58 L278 58 L288 78 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="112"
              y1="114"
              x2="228"
              y2="114"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
            />
          </g>
        );
      case 'Compact / Hatchback':
        return (
          <g>
            <path
              d="M42 112 L52 88 L104 82 L142 60 L248 60 L278 90 L296 100 L298 112"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M114 82 L146 65 L242 65 L264 85 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="112"
              y1="114"
              x2="228"
              y2="114"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
            />
          </g>
        );
      case 'Pickup / Truck':
        return (
          <g>
            <path
              d="M30 110 L36 80 L94 76 L120 52 L206 52 L206 78 L306 78 L308 110"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M104 76 L125 57 L198 57 L198 76 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="112"
              y1="112"
              x2="228"
              y2="112"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
            />
          </g>
        );
      case 'Sedan':
      default:
        return (
          <g>
            <path
              d="M34 112 L46 88 L100 84 L138 62 L224 62 L262 84 L304 90 L308 112"
              fill="none"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M110 84 L142 67 L220 67 L252 84 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line
              x1="182"
              y1="67"
              x2="180"
              y2="84"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <line
              x1="112"
              y1="114"
              x2="228"
              y2="114"
              stroke="currentColor"
              strokeWidth={highContrast ? '3' : '2.2'}
            />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative w-full aspect-[16/10] flex flex-col justify-between p-4 select-none overflow-hidden border-b ${
        highContrast
          ? 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
          : 'bg-zinc-100/80 text-zinc-900 dark:bg-zinc-900/90 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
      }`}
      role="img"
      aria-label={`${year} ${make} ${model} (${bodyStyle}) listed on ${sourcePlatform}`}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={`${year} ${make} ${model}`}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            setStage((prev) => (prev === 0 ? 1 : 2));
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] font-mono-tabular opacity-75">
            <span>{bodyStyle.toUpperCase()}</span>
            <span className="truncate max-w-[180px]">{sourcePlatform}</span>
          </div>

          <div className="my-auto flex items-center justify-center py-1">
            <svg
              viewBox="0 0 340 140"
              className="w-full h-auto max-h-28 overflow-visible"
              aria-hidden="true"
            >
              <line
                x1="16"
                y1="126"
                x2="324"
                y2="126"
                stroke="currentColor"
                strokeOpacity={highContrast ? '0.8' : '0.25'}
                strokeWidth="1"
              />
              {renderProfilePath()}
              <circle
                cx="86"
                cy="112"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth={highContrast ? '3' : '2.2'}
              />
              <circle
                cx="86"
                cy="112"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle
                cx="254"
                cy="112"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth={highContrast ? '3' : '2.2'}
              />
              <circle
                cx="254"
                cy="112"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono-tabular opacity-70">
            <span>
              {year} · {make}
            </span>
            <span>ETB MARKET</span>
          </div>
        </>
      )}
    </div>
  );
};

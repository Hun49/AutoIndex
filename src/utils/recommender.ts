export type BodyStyle =
  | 'Sedan'
  | 'SUV'
  | 'Compact / Hatchback'
  | 'Pickup / Truck'
  | 'Coupe'
  | 'Van / Minibus'
  | 'Wagon';

export type Drivetrain = 'FWD' | 'RWD' | 'AWD' | '4WD';
export type FuelType = 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';

export type SourcePlatform =
  | 'Jiji Ethiopia'
  | 'Mekina.net'
  | 'AfroMekina'
  | 'EthioCars'
  | 'EthioCarMarket'
  | 'Golden Car Market'
  | 'Facebook Marketplace ET';

export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  priceEtb: number; // Price in Ethiopian Birr (ETB)
  mileageKm: number;
  bodyStyle: BodyStyle;
  drivetrain: Drivetrain;
  fuelType: FuelType;
  transmission: 'Automatic' | 'Manual';
  condition: string;
  location: string;
  sourcePlatform: SourcePlatform;
  sourceUrl: string;
  imageUrl?: string;
  sellerPhone?: string;
  description: string;
  scrapedAt: string;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'mileage-asc';

export interface SearchCriteria {
  query?: string;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number; // Max Budget in ETB
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
  sourcePlatform?: string;
  sortBy?: SortOption;
}

export interface RecommendationResult {
  listing: CarListing;
  similarityScore: number; // 0 to 99
  cosineSimilarity: number; // 0.0 to 1.0
  euclideanDistance: number;
  reasons: string[];
  priceDiffEtb: number;
}

export interface ScrapeSourceReport {
  platform: SourcePlatform;
  baseUrl: string;
  searchUrl: string;
  status: 'scraped' | 'cloudflare-direct-link' | 'error';
  listingsScraped: number;
  matchedCount: number;
  responseTimeMs: number;
  note: string;
}

const BODY_EMBEDDING: Record<BodyStyle, number> = {
  Coupe: 0.1,
  'Compact / Hatchback': 0.25,
  Sedan: 0.45,
  Wagon: 0.6,
  SUV: 0.8,
  'Van / Minibus': 0.9,
  'Pickup / Truck': 1.0,
};

const DRIVETRAIN_EMBEDDING: Record<Drivetrain, number> = {
  FWD: 0.0,
  RWD: 0.4,
  AWD: 0.8,
  '4WD': 1.0,
};

const FUEL_EMBEDDING: Record<FuelType, number> = {
  Gasoline: 0.0,
  Diesel: 0.35,
  Hybrid: 0.7,
  Electric: 1.0,
};

// Weights for 7D Ethiopian vehicle feature vector:
// [priceEtb, year, mileageKm, bodyStyle, transmission, fuelType, drivetrain]
const FEATURE_WEIGHTS = [0.34, 0.20, 0.10, 0.16, 0.08, 0.07, 0.05];

export function clamp01(val: number): number {
  if (Number.isNaN(val)) return 0;
  return Math.max(0, Math.min(1, val));
}

/**
 * Normalizes an Ethiopian CarListing into a 7-dimensional feature vector in [0, 1]^7.
 * Price range calibrated for Ethiopia: 500,000 ETB to 22,000,000 ETB.
 */
export function extractFeatureVector(car: CarListing): number[] {
  const normPrice = clamp01((car.priceEtb - 500_000) / (22_000_000 - 500_000));
  const normYear = clamp01((car.year - 1995) / (2026 - 1995));
  const normMileage = clamp01(1 - (car.mileageKm || 45_000) / 220_000);
  const bodyVal = BODY_EMBEDDING[car.bodyStyle] ?? 0.45;
  const transVal = car.transmission === 'Automatic' ? 1.0 : 0.0;
  const fuelVal = FUEL_EMBEDDING[car.fuelType] ?? 0.0;
  const driveVal = DRIVETRAIN_EMBEDDING[car.drivetrain] ?? 0.0;

  return [normPrice, normYear, normMileage, bodyVal, transVal, fuelVal, driveVal];
}

export function computeVectorMetrics(
  vecA: number[],
  vecB: number[]
): { cosineSimilarity: number; euclideanDistance: number; combinedScore: number } {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  let weightedSqDist = 0;

  for (let i = 0; i < FEATURE_WEIGHTS.length; i++) {
    const w = FEATURE_WEIGHTS[i];
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += w * a * b;
    normA += w * a * a;
    normB += w * b * b;
    const diff = a - b;
    weightedSqDist += w * diff * diff;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  const cosineSimilarity = denom > 1e-9 ? clamp01(dotProduct / denom) : 0;
  const euclideanDistance = Math.sqrt(weightedSqDist);

  const rbfProximity = Math.exp(-2.6 * euclideanDistance);
  const combinedRaw = 0.5 * cosineSimilarity + 0.5 * rbfProximity;
  const combinedScore = Math.max(55, Math.min(99, Math.round(combinedRaw * 100)));

  return {
    cosineSimilarity: Number(cosineSimilarity.toFixed(4)),
    euclideanDistance: Number(euclideanDistance.toFixed(4)),
    combinedScore,
  };
}

/**
 * Filters scraped Ethiopian car listings based on user SearchCriteria.
 */
export function filterListings(
  listings: CarListing[],
  criteria: SearchCriteria
): CarListing[] {
  const makeFilter = (criteria.make || '').trim().toLowerCase();
  const modelFilter = (criteria.model || '').trim().toLowerCase();
  const queryFilter = (criteria.query || '').trim().toLowerCase();
  const bodyFilter =
    criteria.bodyStyle && criteria.bodyStyle !== 'All'
      ? criteria.bodyStyle
      : null;
  const transFilter =
    criteria.transmission && criteria.transmission !== 'All'
      ? criteria.transmission
      : null;
  const fuelFilter =
    criteria.fuelType && criteria.fuelType !== 'All' ? criteria.fuelType : null;
  const sourceFilter =
    criteria.sourcePlatform && criteria.sourcePlatform !== 'All'
      ? criteria.sourcePlatform
      : null;

  const filtered = listings.filter((car) => {
    // Only include listings with a valid positive ETB price
    if (!car.priceEtb || car.priceEtb <= 0) return false;

    if (makeFilter && makeFilter !== 'all') {
      const hay = `${car.make} ${car.title}`.toLowerCase();
      if (!hay.includes(makeFilter)) return false;
    }

    if (modelFilter) {
      const hay = `${car.model} ${car.title} ${car.description}`.toLowerCase();
      if (!hay.includes(modelFilter)) return false;
    }

    if (queryFilter) {
      const hay =
        `${car.title} ${car.make} ${car.model} ${car.year} ${car.location} ${car.description} ${car.sourcePlatform}`.toLowerCase();
      const tokens = queryFilter.split(/\s+/).filter(Boolean);
      if (!tokens.every((t) => hay.includes(t))) return false;
    }

    if (criteria.minYear && car.year < criteria.minYear) return false;
    if (criteria.maxYear && car.year > criteria.maxYear) return false;
    if (criteria.minPrice && car.priceEtb < criteria.minPrice) return false;
    if (criteria.maxPrice && car.priceEtb > criteria.maxPrice) return false;
    if (bodyFilter && car.bodyStyle !== bodyFilter) return false;
    if (transFilter && car.transmission !== transFilter) return false;
    if (fuelFilter && car.fuelType !== fuelFilter) return false;
    if (sourceFilter && car.sourcePlatform !== sourceFilter) return false;

    return true;
  });

  const sortBy = criteria.sortBy || 'relevance';
  if (sortBy !== 'relevance') {
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceEtb - b.priceEtb;
        case 'price-desc':
          return b.priceEtb - a.priceEtb;
        case 'year-desc':
          return b.year - a.year || a.priceEtb - b.priceEtb;
        case 'mileage-asc':
          return (a.mileageKm || 999999) - (b.mileageKm || 999999);
        default:
          return b.year - a.year;
      }
    });
  }

  // For relevance sort, sort each Ethiopian portal by year descending, then interleave portals
  const buckets = new Map<string, CarListing[]>();
  for (const item of filtered) {
    const list = buckets.get(item.sourcePlatform) || [];
    list.push(item);
    buckets.set(item.sourcePlatform, list);
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => b.year - a.year || a.priceEtb - b.priceEtb);
  }

  const interleaved: CarListing[] = [];
  let added = true;
  let idx = 0;
  const bucketArrays = Array.from(buckets.values());
  while (added) {
    added = false;
    for (const b of bucketArrays) {
      if (idx < b.length) {
        interleaved.push(b[idx]);
        added = true;
      }
    }
    idx++;
  }
  return interleaved;
}

/**
 * Builds a target reference profile from matched listings or user search criteria.
 */
export function buildTargetFeatureVector(
  criteria: SearchCriteria,
  matchedListings: CarListing[]
): {
  vector: number[];
  targetBudgetEtb: number;
  targetYear: number;
  targetBody: BodyStyle;
} {
  if (matchedListings.length > 0) {
    const dim = 7;
    const avgVec = new Array(dim).fill(0);
    let sumPrice = 0;
    let sumYear = 0;
    const bodyCounts: Partial<Record<BodyStyle, number>> = {};

    for (const car of matchedListings) {
      const v = extractFeatureVector(car);
      for (let i = 0; i < dim; i++) {
        avgVec[i] += v[i] / matchedListings.length;
      }
      sumPrice += car.priceEtb;
      sumYear += car.year;
      bodyCounts[car.bodyStyle] = (bodyCounts[car.bodyStyle] || 0) + 1;
    }

    let dominantBody: BodyStyle = matchedListings[0].bodyStyle;
    let maxCount = 0;
    for (const [b, count] of Object.entries(bodyCounts)) {
      if ((count || 0) > maxCount) {
        maxCount = count || 0;
        dominantBody = b as BodyStyle;
      }
    }

    const avgPrice = Math.round(sumPrice / matchedListings.length);
    const targetBudgetEtb = criteria.maxPrice
      ? Math.min(criteria.maxPrice, Math.round(avgPrice * 1.15))
      : avgPrice;

    return {
      vector: avgVec,
      targetBudgetEtb,
      targetYear: Math.round(sumYear / matchedListings.length),
      targetBody: dominantBody,
    };
  }

  // Fallback when exact filter had 0 matches: construct target vector from user criteria
  const targetBudgetEtb = criteria.maxPrice || 4_500_000;
  const targetYear =
    criteria.minYear && criteria.maxYear
      ? Math.round((criteria.minYear + criteria.maxYear) / 2)
      : criteria.minYear || criteria.maxYear || 2020;
  const targetBody: BodyStyle =
    criteria.bodyStyle &&
    criteria.bodyStyle !== 'All' &&
    criteria.bodyStyle in BODY_EMBEDDING
      ? (criteria.bodyStyle as BodyStyle)
      : 'Sedan';

  const synthetic: CarListing = {
    id: 'synthetic-target',
    title: 'Target Search Profile',
    make: criteria.make || 'Any',
    model: criteria.model || 'Target',
    year: targetYear,
    priceEtb: targetBudgetEtb,
    mileageKm: 45_000,
    bodyStyle: targetBody,
    drivetrain: 'FWD',
    fuelType:
      criteria.fuelType && criteria.fuelType !== 'All'
        ? (criteria.fuelType as FuelType)
        : 'Gasoline',
    transmission:
      criteria.transmission === 'Manual' ? 'Manual' : 'Automatic',
    condition: 'Used in Ethiopia',
    location: 'Addis Ababa',
    sourcePlatform: 'Mekina.net',
    sourceUrl: 'https://www.mekina.net',
    description: '',
    scrapedAt: new Date().toISOString(),
  };

  return {
    vector: extractFeatureVector(synthetic),
    targetBudgetEtb,
    targetYear,
    targetBody,
  };
}

/**
 * Recommends similar Ethiopian car listings within the user's budget using
 * 7D Weighted Cosine Similarity + Radial Basis Euclidean Distance.
 */
export function computeMLRecommendations(
  allScrapedListings: CarListing[],
  matchedListings: CarListing[],
  criteria: SearchCriteria,
  limit = 6
): RecommendationResult[] {
  const validPool = allScrapedListings.filter((c) => c.priceEtb > 0);
  if (validPool.length === 0) return [];

  const matchedIds = new Set(matchedListings.map((c) => c.id));
  const { vector: targetVec, targetBudgetEtb, targetYear, targetBody } =
    buildTargetFeatureVector(criteria, matchedListings);

  // Enforce budget ceiling for recommendations:
  // If user specified maxPrice, keep recommendations strictly <= maxPrice (or within 5% if pool is tiny).
  // Otherwise, keep recommendations within 1.25x of the matched cars' average price.
  const strictCeiling = criteria.maxPrice
    ? criteria.maxPrice
    : Math.round(targetBudgetEtb * 1.25);

  const minFloor = Math.round(targetBudgetEtb * 0.35);

  // Candidate pool: vehicles NOT in the exact matched set (or different model) within the budget
  const searchedModel = (criteria.model || '').trim().toLowerCase();
  let candidates = validPool.filter((c) => {
    if (matchedIds.has(c.id)) return false;
    if (
      searchedModel &&
      `${c.model} ${c.title}`.toLowerCase().includes(searchedModel)
    ) {
      return false;
    }
    return c.priceEtb <= strictCeiling && c.priceEtb >= minFloor;
  });

  // If strict budget filter left fewer than `limit` candidates, relax floor/ceiling slightly
  if (candidates.length < limit) {
    candidates = validPool.filter(
      (c) =>
        !matchedIds.has(c.id) &&
        c.priceEtb <= Math.round(strictCeiling * 1.15)
    );
  }
  if (candidates.length === 0) {
    candidates = validPool.slice(0, limit * 2);
  }

  const scored: RecommendationResult[] = candidates.map((candidate) => {
    const vec = extractFeatureVector(candidate);
    const metrics = computeVectorMetrics(targetVec, vec);
    const priceDiffEtb = candidate.priceEtb - targetBudgetEtb;

    const reasons: string[] = [];

    if (criteria.maxPrice && candidate.priceEtb <= criteria.maxPrice) {
      const underBy = criteria.maxPrice - candidate.priceEtb;
      if (underBy > 0) {
        reasons.push(
          `ETB ${underBy.toLocaleString()} under your max budget`
        );
      } else {
        reasons.push(`Exact match for your ETB budget ceiling`);
      }
    } else if (Math.abs(priceDiffEtb) <= 600_000) {
      reasons.push(
        `Within ETB ${Math.abs(priceDiffEtb).toLocaleString()} of target price`
      );
    } else if (priceDiffEtb < 0) {
      reasons.push(
        `ETB ${Math.abs(priceDiffEtb).toLocaleString()} lower than target average`
      );
    }

    if (candidate.bodyStyle === targetBody) {
      reasons.push(`Same ${candidate.bodyStyle} body type`);
    } else {
      reasons.push(`Alternative ${candidate.bodyStyle} in budget`);
    }

    const yearDelta = Math.abs(candidate.year - targetYear);
    if (yearDelta <= 2) {
      reasons.push(`Comparable model year (${candidate.year})`);
    } else if (candidate.year > targetYear) {
      reasons.push(`Newer model year (${candidate.year})`);
    }

    reasons.push(`Listed on ${candidate.sourcePlatform}`);

    return {
      listing: candidate,
      similarityScore: metrics.combinedScore,
      cosineSimilarity: metrics.cosineSimilarity,
      euclideanDistance: metrics.euclideanDistance,
      reasons: reasons.slice(0, 3),
      priceDiffEtb,
    };
  });

  scored.sort(
    (a, b) =>
      b.similarityScore - a.similarityScore ||
      a.euclideanDistance - b.euclideanDistance
  );

  // Deduplicate by title+price so recommendations show diverse models
  const seenKeys = new Set<string>();
  const unique: RecommendationResult[] = [];
  for (const item of scored) {
    const key = `${item.listing.make}-${item.listing.model}-${item.listing.year}-${item.listing.priceEtb}`.toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      unique.push(item);
      if (unique.length >= limit) break;
    }
  }

  return unique;
}

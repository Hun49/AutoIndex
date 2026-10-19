import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractFeatureVector,
  computeVectorMetrics,
  filterListings,
  computeMLRecommendations,
  type CarListing,
} from './recommender.ts';
import { inferMakeAndModel, inferBodyStyle } from './ethiopianScraper.ts';

const SAMPLE_ET_LISTINGS: CarListing[] = [
  {
    id: 'mekina-toyota-vitz-2010',
    title: '2010 Toyota Vitz',
    make: 'Toyota',
    model: 'Vitz',
    year: 2010,
    priceEtb: 2_350_000,
    mileageKm: 78_000,
    bodyStyle: 'Compact / Hatchback',
    drivetrain: 'FWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'Used in Ethiopia',
    location: 'Addis Ababa, Ethiopia',
    sourcePlatform: 'Mekina.net',
    sourceUrl: 'https://www.mekina.net/cars/toyota-vitz-2010',
    description: 'Toyota Vitz 2010 Automatic in Addis Ababa.',
    scrapedAt: '2026-10-19T00:00:00.000Z',
  },
  {
    id: 'afromekina-suzuki-swift-2022',
    title: '2022 Suzuki Swift',
    make: 'Suzuki',
    model: 'Swift',
    year: 2022,
    priceEtb: 3_650_000,
    mileageKm: 24_000,
    bodyStyle: 'Compact / Hatchback',
    drivetrain: 'FWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'Used in Ethiopia',
    location: 'Addis Ababa, Ethiopia',
    sourcePlatform: 'AfroMekina',
    sourceUrl: 'https://www.afromekina.com/cars/suzuki-swift-2022',
    description: '2022 Suzuki Swift listed on AfroMekina.',
    scrapedAt: '2026-10-19T00:00:00.000Z',
  },
  {
    id: 'ethiocars-suzuki-dzire-2023',
    title: '2023 Suzuki Dzire',
    make: 'Suzuki',
    model: 'Dzire',
    year: 2023,
    priceEtb: 3_800_000,
    mileageKm: 18_000,
    bodyStyle: 'Sedan',
    drivetrain: 'FWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'Used in Ethiopia',
    location: 'Addis Ababa, Ethiopia',
    sourcePlatform: 'EthioCars',
    sourceUrl: 'https://ethiocars.com/car/2023-suzuki-dzire',
    description: '2023 Suzuki Dzire listed on EthioCars.',
    scrapedAt: '2026-10-19T00:00:00.000Z',
  },
  {
    id: 'ethiocarmarket-toyota-rav4-2023',
    title: '2023 Toyota Rav4',
    make: 'Toyota',
    model: 'Rav4',
    year: 2023,
    priceEtb: 12_500_000,
    mileageKm: 32_000,
    bodyStyle: 'SUV',
    drivetrain: 'AWD',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    condition: 'Brand New',
    location: 'Addis Ababa, Ethiopia',
    sourcePlatform: 'EthioCarMarket',
    sourceUrl: 'https://ethiocarmarket.com/listing/38317/',
    description: '2023 Toyota Rav4 listed on EthioCarMarket.',
    scrapedAt: '2026-10-19T00:00:00.000Z',
  },
];

test('extractFeatureVector produces normalized 7D vector within [0, 1]', () => {
  const vec = extractFeatureVector(SAMPLE_ET_LISTINGS[0]);
  assert.equal(vec.length, 7);
  for (const val of vec) {
    assert.ok(val >= 0 && val <= 1, `Expected ${val} to be in [0, 1]`);
  }
});

test('computeVectorMetrics yields 1.0 cosine similarity and 0 distance for identical vectors', () => {
  const vec = extractFeatureVector(SAMPLE_ET_LISTINGS[0]);
  const metrics = computeVectorMetrics(vec, vec);
  assert.equal(metrics.cosineSimilarity, 1);
  assert.equal(metrics.euclideanDistance, 0);
  assert.equal(metrics.combinedScore, 99);
});

test('filterListings filters accurately by make, maxPrice in ETB, and minYear', () => {
  const filtered = filterListings(SAMPLE_ET_LISTINGS, {
    make: 'Toyota',
    maxPrice: 5_000_000,
    minYear: 2008,
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'mekina-toyota-vitz-2010');
});

test('computeMLRecommendations recommends similar cars strictly within the user ETB budget', () => {
  const criteria = {
    make: 'Toyota',
    model: 'Vitz',
    maxPrice: 4_000_000,
  };
  const matched = filterListings(SAMPLE_ET_LISTINGS, criteria);
  assert.equal(matched.length, 1);

  const recommendations = computeMLRecommendations(
    SAMPLE_ET_LISTINGS,
    matched,
    criteria,
    3
  );

  assert.ok(recommendations.length >= 1);
  for (const rec of recommendations) {
    assert.ok(
      rec.listing.priceEtb <= 4_000_000,
      `Expected recommended car ${rec.listing.title} (${rec.listing.priceEtb} ETB) to be <= 4,000,000 ETB`
    );
    assert.notEqual(rec.listing.id, 'mekina-toyota-vitz-2010');
  }
  // Suzuki Swift (Compact / Hatchback, 3.65M ETB) should rank highest for a Toyota Vitz search
  assert.equal(recommendations[0].listing.id, 'afromekina-suzuki-swift-2022');
});

test('inferMakeAndModel and inferBodyStyle parse Ethiopian car titles accurately', () => {
  const parsed = inferMakeAndModel('2022 Suzuki Dzire Automatic');
  assert.equal(parsed.make, 'Suzuki');
  assert.equal(parsed.year, 2022);
  assert.equal(inferBodyStyle('2020 Toyota CHR'), 'SUV');
  assert.equal(inferBodyStyle('Toyota Vitz 2007'), 'Compact / Hatchback');
  assert.equal(inferBodyStyle('Toyota Hilux Double Cab'), 'Pickup / Truck');
});

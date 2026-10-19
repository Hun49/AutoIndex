import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  filterListings,
  computeMLRecommendations,
  type SearchCriteria,
} from './src/utils/recommender.ts';
import { scrapeAllEthiopianCarSites } from './src/utils/ethiopianScraper.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  cachedAt: number;
}

const imageCache = new Map<string, CachedImage>();
const inFlightImageFetches = new Map<string, Promise<CachedImage | null>>();
const MAX_IMAGE_CACHE_ITEMS = 350;

function getOriginReferer(targetUrl: string): string {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.hostname.includes('afromekina.com')) {
      return 'https://afromekina.com/';
    }
    if (
      parsed.hostname.includes('mekina.s3') ||
      parsed.hostname.includes('mekina.net')
    ) {
      return 'https://www.mekina.net/';
    }
    if (parsed.hostname.includes('ethiocars.com')) {
      return 'https://ethiocars.com/';
    }
    if (
      parsed.hostname.includes('ethiocarmarket.com') ||
      parsed.hostname.includes('wp.com')
    ) {
      return 'https://ethiocarmarket.com/';
    }
    return `${parsed.protocol}//${parsed.host}/`;
  } catch {
    return 'https://www.mekina.net/';
  }
}

async function fetchImageWithRetry(
  imageUrl: string
): Promise<CachedImage | null> {
  const existing = imageCache.get(imageUrl);
  if (existing && Date.now() - existing.cachedAt < 1000 * 60 * 30) {
    return existing;
  }

  const inFlight = inFlightImageFetches.get(imageUrl);
  if (inFlight) {
    return inFlight;
  }

  const fetchPromise = (async (): Promise<CachedImage | null> => {
    const referer = getOriginReferer(imageUrl);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'User-Agent': BROWSER_USER_AGENT,
            Accept:
              'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            Referer: referer,
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          continue;
        }

        const contentType =
          response.headers.get('content-type') || 'image/jpeg';
        const arrayBuf = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        if (buffer.length < 100) {
          continue;
        }

        const cached: CachedImage = {
          buffer,
          contentType,
          cachedAt: Date.now(),
        };

        if (imageCache.size >= MAX_IMAGE_CACHE_ITEMS) {
          const oldestKey = imageCache.keys().next().value;
          if (oldestKey) imageCache.delete(oldestKey);
        }
        imageCache.set(imageUrl, cached);
        return cached;
      } catch {
        // Retry once on transient timeout/socket error
      }
    }
    return null;
  })();

  inFlightImageFetches.set(imageUrl, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlightImageFetches.delete(imageUrl);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Same-origin image proxy to bypass client ISP blocks, hotlink restrictions, and rate limits
  app.get('/api/image', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl || (!rawUrl.startsWith('https://') && !rawUrl.startsWith('http://'))) {
      res.status(400).send('Invalid image URL');
      return;
    }

    const img = await fetchImageWithRetry(rawUrl);
    if (!img) {
      res.status(404).send('Image unavailable');
      return;
    }

    res.setHeader('Content-Type', img.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(img.buffer);
  });

  // Real-time Ethiopian multi-site car scraper and ML recommender endpoint
  app.post('/api/scrape', async (req, res) => {
    const startTime = Date.now();
    const body = req.body || {};

    const criteria: SearchCriteria = {
      query: typeof body.query === 'string' ? body.query.trim() : '',
      make: typeof body.make === 'string' ? body.make.trim() : '',
      model: typeof body.model === 'string' ? body.model.trim() : '',
      minYear: body.minYear ? Number(body.minYear) : undefined,
      maxYear: body.maxYear ? Number(body.maxYear) : undefined,
      minPrice: body.minPrice ? Number(body.minPrice) : undefined,
      maxPrice: body.maxPrice ? Number(body.maxPrice) : undefined,
      bodyStyle: typeof body.bodyStyle === 'string' ? body.bodyStyle : 'All',
      transmission:
        typeof body.transmission === 'string' ? body.transmission : 'All',
      fuelType: typeof body.fuelType === 'string' ? body.fuelType : 'All',
      sourcePlatform:
        typeof body.sourcePlatform === 'string' ? body.sourcePlatform : 'All',
      sortBy: body.sortBy || 'relevance',
    };

    try {
      const { allListings, sourceReports } =
        await scrapeAllEthiopianCarSites(criteria);

      const matchedListings = filterListings(allListings, criteria);

      // Update per-source matched counts
      const enrichedReports = sourceReports.map((report) => {
        const matchedFromPlatform = matchedListings.filter(
          (item) => item.sourcePlatform === report.platform
        ).length;
        return {
          ...report,
          matchedCount: matchedFromPlatform,
        };
      });

      // Compute ML similar-car recommendations within the user's ETB budget
      const recommendations = computeMLRecommendations(
        allListings,
        matchedListings,
        criteria,
        6
      );

      res.json({
        criteria,
        listings: matchedListings,
        recommendations,
        sourceReports: enrichedReports,
        totalScrapedPoolSize: allListings.length,
        durationMs: Date.now() - startTime,
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        criteria,
        listings: [],
        recommendations: [],
        sourceReports: [],
        totalScrapedPoolSize: 0,
        error: (err as Error).message,
        status: 'error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `AutoIndex Ethiopia Scraper & ML Server listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();

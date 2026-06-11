const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Referer': 'https://suchen.mobile.de/',
  'Origin': 'https://suchen.mobile.de',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

function buildMobileQuery(q) {
  const p = new URLSearchParams();
  p.set('s', 'Car');
  p.set('vc', 'Car');
  p.set('isSearchRequest', 'true');
  p.set('sb', q.sort || 'rel');
  p.set('pageNumber', q.page || '1');
  p.set('pageSize', q.pageSize || '20');

  if (q.damUnrep === 'false' || !q.damUnrep) p.set('damUnrep', 'false');
  if (q.condition)  p.set('fr', q.condition === 'NEW' ? '' : undefined);
  if (q.priceMin)   p.set('p', `${q.priceMin}:`);
  if (q.priceMax)   p.set('p', `${q.priceMin || ''}:${q.priceMax}`);
  if (q.kmMax)      p.set('ml', `:${q.kmMax}`);
  if (q.yearMin)    p.set('fr', `${q.yearMin}:`);
  if (q.fuel)       p.set('ft', q.fuel);
  if (q.gearbox)    p.set('tr', q.gearbox);
  if (q.plz)        { p.set('zip', q.plz); p.set('zipr', q.radius || '50'); }

  return p.toString();
}

app.get('/api/search', async (req, res) => {
  try {
    // Da Render oft blockiert wird, springen wir hier direkt zum HTML-Fallback,
    // da dieser mit den erweiterten Headern deutlich stabiler läuft.
    return await htmlFallback(req.query, res);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function htmlFallback(q, res) {
  const params = new URLSearchParams();
  params.set('s', 'Car');
  params.set('isSearchRequest', 'true');
  params.set('sb', 'rel');
  params.set('vc', 'Car');
  params.set('damUnrep', 'false');
  if (q.priceMin)  params.set('p', `${q.priceMin}:`);
  if (q.priceMax)  params.set('p', `${q.priceMin || ''}:${q.priceMax}`); // Fix: Korrekte Preisübergabe
  if (q.kmMax)     params.set('ml', `:${q.kmMax}`);
  if (q.yearMin)   params.set('fr', `${q.yearMin}:`);
  if (q.fuel)      params.set('ft', q.fuel);
  if (q.gearbox)   params.set('tr', q.gearbox);
  if (q.plz)       { params.set('zip', q.plz); params.set('zipr', q.radius || '50'); }

  const url = `https://suchen.mobile.de/fahrzeuge/search.html?${params.toString()}`;
  console.log('→ HTML Request:', url);

  const response = await fetch(url, { headers: MOBILE_HEADERS });
  const html = await response.text();

  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    // Falls mobile.de blockiert, geben wir einen verständlicheren Hinweis im JSON aus
    return res.status(502).json({ 
      error: 'Proxy blockiert. Bitte Filter leicht ändern oder kurz warten (mobile.de Antispam-Schutz).' 
    });
  }

  const nextData = JSON.parse(match[1]);
  const listings = nextData?.props?.pageProps?.srp?.data?.listings
    || nextData?.props?.pageProps?.listings
    || [];

  res.json(normalizeHtmlResponse(listings));
}

function normalizeHtmlResponse(listings) {
  return {
    total: listings.length,
    ads: listings.map(ad => {
      const v = ad.attributes || ad;
      return {
        id: ad.id,
        make: v.make?.displayValue || v.make || '',
        model: v.model?.displayValue || v.model || '',
        title: ad.description || v.modelDescription || '',
        price: v.price?.amount || v.grossPrice || null,
        currency: 'EUR',
        mileage: v.mileage?.value || v.mileage || null,
        power_kw: v.power?.kw || null,
        fuel: v.fuel?.displayValue || v.fuel || null,
        gearbox: v.gearbox?.displayValue || v.gearbox || null,
        firstRegistration: v.firstRegistration || null,
        tuev: v.generalInspection || null,
        city: v.sellerAddress?.city || v.location?.city || null,
        image: ad.previewImage?.src || ad.images?.[0]?.src || null,
        url: ad.relativeUrl ? `https://suchen.mobile.de${ad.relativeUrl}` : null,
        nonSmoker: v.nonSmoker || false,
        owners: v.numberOfPreviousOwners || null,
      };
    })
  };
}

app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ AutoMatch Proxy läuft auf Port ${PORT}`));

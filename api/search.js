// api/search.js
// Vercel Serverless Function - Ausgeführt in Frankfurt (fra1)

const MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Referer': 'https://suchen.mobile.de/',
  'Origin': 'https://suchen.mobile.de'
};

export default async function handler(req, res) {
  // CORS-Header einrichten
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const q = req.query;
    const params = new URLSearchParams();
    params.set('s', 'Car');
    params.set('isSearchRequest', 'true');
    params.set('sb', 'rel');
    params.set('vc', 'Car');
    params.set('damUnrep', 'false');

    if (q.priceMin) params.set('p', `${q.priceMin}:`);
    if (q.priceMax) params.set('p', `${q.priceMin || ''}:${q.priceMax}`);
    if (q.kmMax)    params.set('ml', `:${q.kmMax}`);
    if (q.yearMin)  params.set('fr', `${q.yearMin}:`);
    if (q.fuel)     params.set('ft', q.fuel);
    if (q.gearbox)  params.set('tr', q.gearbox);
    if (q.plz) { 
      params.set('zip', q.plz); 
      params.set('zipr', q.radius || '50'); 
    }

    // Nutzen der modernen WHATWG URL API um Warnungen zu verhindern
    const targetUrl = new URL('https://suchen.mobile.de/fahrzeuge/search.html');
    targetUrl.search = params.toString();
    
    const response = await fetch(targetUrl.href, { headers: MOBILE_HEADERS });
    const html = await response.text();

    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) {
      return res.status(502).json({ 
        error: 'Proxy temporär blockiert. Bitte Filter leicht ändern oder kurz warten.' 
      });
    }

    const nextData = JSON.parse(match[1]);
    const listings = nextData?.props?.pageProps?.srp?.data?.listings
      || nextData?.props?.pageProps?.listings
      || [];

    const ads = listings.map(ad => {
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
        url: ad.relativeUrl ? `https://suchen.mobile.de${ad.relativeUrl}` : null
      };
    });

    return res.status(200).json({ total: ads.length, ads });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
  'Referer': 'https://suchen.mobile.de/',
  'Origin': 'https://suchen.mobile.de',
};

// Map unserer Filter-Parameter → mobile.de Consumer API Parameter
function buildMobileQuery(q) {
  const p = new URLSearchParams();
  p.set('s', 'Car');
  p.set('vc', 'Car');
  p.set('isSearchRequest', 'true');
  p.set('sb', q.sort || 'rel');
  p.set('pageNumber', q.page || '1');
  p.set('pageSize', q.pageSize || '20');

  if (q.damUnrep === 'false' || !q.damUnrep) p.set('damUnrep', 'false'); 
  if (q.priceMin) p.set('pmin', q.priceMin);
  if (q.priceMax) p.set('pmax', q.priceMax);
  if (q.kmMax)    p.set('mlmax', q.kmMax);
  if (q.yearMin)  p.set('fregmin', q.yearMin);
  if (q.fuel)     p.set('ft', q.fuel);
  if (q.gearbox)  p.set('ger', q.gearbox);
  if (q.plz) {
    p.set('zip', q.plz);
    p.set('rd', q.radius || '50');
  }
  return p.toString();
}

// API-Endpunkt für die Autosuche
app.get('/api/search', async (req, res) => {
  const queryStr = buildMobileQuery(req.query);
  const apiUrl = `https://www.mobile.de/consumer/api/search/srp?${queryStr}`;
  const htmlUrl = `https://suchen.mobile.de/fahrzeuge/search.html?${queryStr}`;

  try {
    // Versuch 1: Die interne JSON-API abfragen
    const response = await fetch(apiUrl, { headers: MOBILE_HEADERS });
    if (response.ok) {
      const data = await response.json();
      return res.json(normalizeApiResponse(data));
    }
    
    // Versuch 2 (Fallback): HTML parsen, falls API blockiert
    const htmlResponse = await fetch(htmlUrl, { headers: MOBILE_HEADERS });
    const htmlText = await htmlResponse.text();
    const match = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    
    if (match && match[1]) {
      const nextData = JSON.parse(match[1]);
      const listings = nextData.props?.pageProps?.listings || [];
      return res.json(normalizeHtmlResponse(listings));
    }

    throw new Error('Beide Datenquellen fehlgeschlagen');
  } catch (error) {
    console.error('Fehler beim Abrufen:', error.message);
    res.status(500).json({ error: 'Fehler beim Abrufen der mobile.de Daten' });
  }
});

function normalizeApiResponse(data) {
  const ads = data.listings || [];
  return {
    total: data.totalResults || ads.length,
    ads: ads.map(ad => ({
      id: ad.id,
      make: ad.vehicleDetails?.make || '',
      model: ad.vehicleDetails?.model || '',
      title: ad.title || '',
      price: ad.price?.amount || null,
      currency: 'EUR',
      mileage: ad.vehicleDetails?.mileage || null,
      power_kw: ad.vehicleDetails?.powerKw || null,
      fuel: ad.vehicleDetails?.fuelType || null,
      gearbox: ad.vehicleDetails?.transmission || null,
      firstRegistration: ad.vehicleDetails?.firstRegistration || null,
      tuev: ad.vehicleDetails?.hu || null,
      city: ad.location?.city || null,
      image: ad.images?.[0]?.src || null,
      url: ad.url ? `https://suchen.mobile.de${ad.url}` : null,
      nonSmoker: ad.vehicleDetails?.nonSmoker || false,
      owners: ad.vehicleDetails?.numberOfPreviousOwners || null,
    }))
  };
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

// Startet dynamisch auf dem Cloud-Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ AutoMatch Backend läuft auf Port ${PORT}`);
});

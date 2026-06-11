// App.jsx - Robustes HTML-Scraping über ScraperAPI (Filtert JSON aus dem Quelltext)

const fmtPrice = (p) => Number(p).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtKm = (k) => Number(k).toLocaleString("de-DE") + " km";
const kwToPs = (kw) => kw ? Math.round(kw * 1.36) : null;
const fmtYear = (s) => {
  if (!s) return "–";
  if (typeof s === "number") return String(s);
  return String(s).slice(0, 4);
};
const fmtFuel = (f) => ({ DIESEL: "Diesel", PETROL: "Benzin", ELECTRIC: "Elektro", HYBRID: "Hybrid", NATURAL_GAS: "Gas", LPG: "LPG" }[f] || f || "–");
const fmtGear = (g) => ({ MANUAL_GEAR: "Schaltung", AUTOMATIC_GEAR: "Automatik", SEMIAUTOMATIC_GEAR: "Halbautomatik" }[g] || g || "–");

function FilterScreen({ onSearch, loading, error }) {
  const [f, setF] = React.useState({
    priceMin: "", priceMax: "", kmMax: "", yearMin: "",
    fuel: "", gearbox: "", plz: "", radius: "50",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const inp = {
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
    color: "#fff", padding: "10px 14px", fontSize: 14, width: "100%",
    boxSizing: "border-box", outline: "none",
  };
  const row = { display: "flex", gap: 10 };

  return (
    <div style={{ width: "100%", maxWidth: 420, padding: "28px 20px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
          <span style={{ color: "#fff" }}>Auto</span>
          <span style={{ background: "linear-gradient(90deg,#ff4b4b,#ff9b00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Match</span>
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>Mobile.de HTML Scraping Engine via ScraperAPI 🛡️⚡</div>
      </div>

      <Sec title="⛽ Antrieb">
        <div style={row}>
          <select style={{ ...inp, flex: 1 }} value={f.fuel} onChange={set("fuel")}>
            <option value="">Alle Kraftstoffe</option>
            <option value="PETROL">Benzin</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Elektro</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <select style={{ ...inp, flex: 1 }} value={f.gearbox} onChange={set("gearbox")}>
            <option value="">Alle Getriebe</option>
            <option value="MANUAL_GEAR">Schaltung</option>
            <option value="AUTOMATIC_GEAR">Automatik</option>
          </select>
        </div>
      </Sec>

      <Sec title="💶 Budget & Laufleistung">
        <div style={row}>
          <input style={{ ...inp, flex: 1 }} placeholder="€ min" value={f.priceMin} onChange={set("priceMin")} />
          <input style={{ ...inp, flex: 1 }} placeholder="€ max" value={f.priceMax} onChange={set("priceMax")} />
        </div>
        <div style={{ ...row, marginTop: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="KM max" value={f.kmMax} onChange={set("kmMax")} />
          <input style={{ ...inp, flex: 1 }} placeholder="Baujahr ab" value={f.yearMin} onChange={set("yearMin")} />
        </div>
      </Sec>

      <Sec title="📍 Umkreis">
        <div style={row}>
          <input style={{ ...inp, flex: 2 }} placeholder="PLZ (z.B. 28195)" value={f.plz} onChange={set("plz")} />
          <input style={{ ...inp, flex: 1 }} placeholder="km" value={f.radius} onChange={set("radius")} />
        </div>
      </Sec>

      {error && (
        <div style={{ background: "rgba(255,75,75,0.1)", border: "1px solid #ff4b4b44", borderRadius: 10, padding: "10px 14px", color: "#ff7070", fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={() => onSearch(f)}
        disabled={loading}
        style={{
          background: loading ? "#333" : "linear-gradient(90deg,#ff4b4b,#ff9b00)",
          border: "none", borderRadius: 40, padding: "15px",
          color: loading ? "#666" : "#fff", fontWeight: 800, fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
        }}
      >
        {loading ? "Fahrzeuge werden gesucht…" : "🔥 Los swipe'n"}
      </button>
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#555", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}

function CarCard({ car, swipeDir, dragX }) {
  const ps = kwToPs(car.power_kw);
  return (
    <>
      <div style={{ position: "relative", height: 265, overflow: "hidden", background: "#111" }}>
        {car.image ? (
          <img src={car.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: "#2a2a2a" }}>🚗</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, #1c1c1e 100%)" }} />

        {swipeDir === "right" && <Stamp color="#4ade80" side="left" opacity={Math.min(1, Math.abs(dragX) / 80)}>NICE 🔥</Stamp>}
        {swipeDir === "left" && <Stamp color="#f87171" side="right" opacity={Math.min(1, Math.abs(dragX) / 80)}>NOPE</Stamp>}

        <div style={{
          position: "absolute", bottom: 12, right: 14,
          background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
          color: "#fff", borderRadius: 10, padding: "5px 12px",
          fontSize: 17, fontWeight: 800,
        }}>
          {car.price ? fmtPrice(car.price) : "Preis auf Anfrage"}
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {car.make} {car.model}
            <span style={{ fontSize: 13, color: "#666", fontWeight: 400, marginLeft: 6 }}>{fmtYear(car.firstRegistration)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          {car.mileage && <Chip icon="🛣️" val={fmtKm(car.mileage)} />}
          {ps && <Chip icon="⚡" val={`${ps} PS`} />}
          {car.fuel && <Chip icon="⛽" val={fmtFuel(car.fuel)} />}
          {car.gearbox && <Chip icon="🔧" val={fmtGear(car.gearbox)} />}
          {car.city && <Chip icon="📍" val={car.city} />}
        </div>

        {car.url && (
          <a
            href={car.url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "block", marginTop: 12, textAlign: "center",
              background: "rgba(255,155,0,0.08)", border: "1px solid rgba(255,155,0,0.25)",
              borderRadius: 10, padding: "7px", fontSize: 12, color: "#ff9b00",
              textDecoration: "none", fontWeight: 600,
            }}
          >
            📋 Inserat auf mobile.de öffnen ↗
          </a>
        )}
      </div>
    </>
  );
}

function Stamp({ color, side, opacity, children }) {
  return (
    <div style={{
      position: "absolute", top: 22, [side]: 18,
      border: `3px solid ${color}`, color,
      borderRadius: 8, padding: "3px 12px", fontSize: 20, fontWeight: 900,
      transform: side === "left" ? "rotate(-15deg)" : "rotate(15deg)",
      opacity,
    }}>{children}</div>
  );
}

function Chip({ icon, val }) {
  return (
    <span style={{ fontSize: 12, color: "#bbb", display: "flex", alignItems: "center", gap: 3 }}>
      <span>{icon}</span>{val}
    </span>
  );
}

function LikedTab({ liked }) {
  if (liked.length === 0) {
    return (
      <div style={{ color: "#444", textAlign: "center", marginTop: 60, fontSize: 15 }}>Noch nichts geliked 🫤</div>
    );
  }
  return (
    <div style={{ width: "100%", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      {liked.map((car, i) => (
        <div key={i} style={{ background: "#1c1c1e", borderRadius: 14, display: "flex", gap: 10, overflow: "hidden", border: "1px solid #222" }}>
          {car.image
            ? <img src={car.image} alt="" style={{ width: 88, height: 70, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 88, height: 70, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🚗</div>
          }
          <div style={{ padding: "10px 10px 10px 0", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {car.make} {car.model} <span style={{ color: "#555", fontWeight: 400, fontSize: 11 }}>{fmtYear(car.firstRegistration)}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ff9b00", marginTop: 1 }}>
              {car.price ? fmtPrice(car.price) : "–"}
            </div>
            {car.url && <a href={car.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#ff9b00", textDecoration: "none" }}>→ Inserat öffnen</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SwipeScreen({ cars, onReset }) {
  const [deck, setDeck] = React.useState([...cars].reverse());
  const [liked, setLiked] = React.useState([]);
  const [disliked, setDisliked] = React.useState([]);
  const [dragX, setDragX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [swipeDir, setSwipeDir] = React.useState(null);
  const [animOut, setAnimOut] = React.useState(null);
  const [showMatch, setShowMatch] = React.useState(null);
  const [tab, setTab] = React.useState("swipe");
  const dragStart = React.useRef(null);

  const top = deck[deck.length - 1];

  const triggerSwipe = (dir) => {
    if (!top || animOut) return;
    setAnimOut(dir);
    setTimeout(() => {
      if (dir === "right") {
        setLiked((p) => [top, ...p]);
        setShowMatch(top);
        setTimeout(() => setShowMatch(null), 1200);
      } else {
        setDisliked((p) => [top, ...p]);
      }
      setDeck((p) => p.slice(0, -1));
      setAnimOut(null);
      setDragX(0);
      setSwipeDir(null);
    }, 300);
  };

  const onDown = (e) => { dragStart.current = e.clientX; setIsDragging(true); };
  const onMove = (e) => {
    if (!isDragging || dragStart.current == null) return;
    const dx = e.clientX - dragStart.current;
    setDragX(dx);
    setSwipeDir(dx > 30 ? "right" : dx < -30 ? "left" : null);
  };
  const onUp = () => {
    setIsDragging(false);
    if (dragX > 80) triggerSwipe("right");
    else if (dragX < -80) triggerSwipe("left");
    else { setDragX(0); setSwipeDir(null); }
    dragStart.current = null;
  };

  const cardStyle = () => {
    if (animOut === "right") return { transform: "translateX(120vw) rotate(25deg)", transition: "transform 0.3s ease", opacity: 0 };
    if (animOut === "left") return { transform: "translateX(-120vw) rotate(-25deg)", transition: "transform 0.3s ease", opacity: 0 };
    if (isDragging) return { transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`, transition: "none" };
    return { transform: "translateX(0) rotate(0deg)", transition: "transform 0.25s ease" };
  };

  return (
    <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          <span style={{ color: "#fff" }}>Auto</span>
          <span style={{ background: "linear-gradient(90deg,#ff4b4b,#ff9b00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Match</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <TBtn active={tab === "swipe"} onClick={() => setTab("swipe")}>🔥 Swipe</TBtn>
          <TBtn active={tab === "liked"} onClick={() => setTab("liked")}>
            ❤️{liked.length > 0 && <sup style={{ background: "#ff4b4b", color: "#fff", borderRadius: 99, padding: "1px 5px", fontSize: 10, marginLeft: 2 }}>{liked.length}</sup>}
          </TBtn>
          <button onClick={onReset} style={{ background: "none", border: "1px solid #2a2a2a", color: "#555", borderRadius: 20, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>⚙️</button>
        </div>
      </div>

      {tab === "liked" ? <LikedTab liked={liked} /> : (
        <>
          <div style={{ width: "100%", padding: "10px 20px 0", position: "relative", height: 510 }}>
            {deck.length > 1 && (
              <div style={{ position: "absolute", left: 30, right: 30, top: 20, height: 480, borderRadius: 22, background: "#1a1a1a", transform: "scale(0.95)", zIndex: 0 }} />
            )}
            {deck.length === 0 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>🏁</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 10 }}>Deck durch!</div>
                <button onClick={onReset} style={{ marginTop: 20, background: "linear-gradient(90deg,#ff4b4b,#ff9b00)", border: "none", borderRadius: 40, padding: "11px 24px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Neue Suche 🔄</button>
              </div>
            ) : (
              <div
                style={{
                  position: "absolute", left: 20, right: 20, top: 8, height: 490,
                  borderRadius: 22, background: "#1c1c1e",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                  overflow: "hidden", cursor: isDragging ? "grabbing" : "grab",
                  zIndex: 2, touchAction: "none",
                  ...cardStyle(),
                }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerLeave={onUp}
              >
                <CarCard car={top} swipeDir={swipeDir} dragX={dragX} />
              </div>
            )}
          </div>

          {deck.length > 0 && (
            <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
              <ABtn color="#f87171" bg="rgba(248,113,113,0.1)" onClick={() => triggerSwipe("left")}>✕</ABtn>
              <ABtn color="#4ade80" bg="rgba(74,222,128,0.1)" onClick={() => triggerSwipe("right")}>♥</ABtn>
            </div>
          )}
        </>
      )}

      {showMatch && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
          <div style={{ background: "#1a1a1a", borderRadius: 24, padding: "32px 28px", textAlign: "center", border: "1px solid #2a2a2a", animation: "pop 0.2s ease" }}>
            <div style={{ fontSize: 44 }}>🔥</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 8 }}>Geliked!</div>
            <div style={{ fontSize: 14, color: "#777", marginTop: 4 }}>{showMatch.make} {showMatch.model}</div>
          </div>
        </div>
      )}
      <style>{`@keyframes pop { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
    </div>
  );
}

function TBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "rgba(255,75,75,0.15)" : "transparent",
      border: `1px solid ${active ? "rgba(255,75,75,0.4)" : "#2a2a2a"}`,
      color: active ? "#ff4b4b" : "#555",
      borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
    }}>{children}</button>
  );
}

function ABtn({ color, bg, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      width: 60, height: 60, borderRadius: "50%",
      border: `2px solid ${color}`, background: bg, color,
      fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );
}

function AutoMatch() {
  const [screen, setScreen] = React.useState("filter");
  const [cars, setCars] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set('isSearchRequest', 'true');
      p.set('sb', 'rel');
      p.set('vc', 'Car');
      p.set('damUnrep', 'false');
      
      if (filters.priceMin) p.set('minPrice', filters.priceMin);
      if (filters.priceMax) p.set('maxPrice', filters.priceMax);
      if (filters.kmMax)    p.set('maxMileage', filters.kmMax);
      if (filters.yearMin)  p.set('minFirstRegistrationDate', `${filters.yearMin}-01`);
      if (filters.fuel)     p.set('fuel', filters.fuel);
      if (filters.gearbox)  p.set('gearbox', filters.gearbox);
      if (filters.plz) {
        p.set('zipcode', filters.plz);
        p.set('ambitDistance', filters.radius || '50');
      }

      // Wir rufen die echte Desktop-Website auf, da dort die Daten eingebettet sind
      const mobileWebUrl = `https://suchen.mobile.de/fahrzeuge/search.html?${p.toString()}`;
      
      // Nutzt deinen ScraperAPI Key mit Premium-Residential-Proxies
      const scraperUrl = `https://api.scraperapi.com?api_key=4a13f39e7abb638bb4ccadb182026345&url=${encodeURIComponent(mobileWebUrl)}&country_code=de&premium=true`;

      const res = await fetch(scraperUrl);
      if (!res.ok) throw new Error("Verbindung zum Server fehlgeschlagen.");
      
      const htmlText = await res.text();

      // Wir extrahieren das eingebettete JSON-Datenobjekt (State) aus dem HTML-Quelltext
      let jsonState = null;
      const matchNextData = htmlText.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      
      if (matchNextData && matchNextData[1]) {
        const fullParsed = JSON.parse(matchNextData[1]);
        jsonState = fullParsed?.props?.pageProps?.searchResult || fullParsed?.props?.pageProps;
      } else {
        // Fallback falls Mobile.de den veralteten INITIAL_STATE nutzt
        const matchInitialState = htmlText.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});<\/script>/);
        if (matchInitialState && matchInitialState[1]) {
          jsonState = JSON.parse(matchInitialState[1]);
        }
      }

      // Auslesen der Artikelliste (Listings) aus dem extrahierten JSON
      const listings = jsonState?.listings || jsonState?.results || [];

      if (!listings.length) {
        setError("Keine Treffer erhalten. Bitte passe deine Filtereinstellungen an.");
        setLoading(false);
        return;
      }

      // Daten normalisieren für die UI-Karten
      const normalized = listings.map((ad, idx) => {
        return {
          id: ad.id || String(idx),
          make: ad.make || ad.title?.split(' ')?.[0] || 'Auto',
          model: ad.model || ad.title?.split(' ')?.slice(1)?.join(' ') || '',
          price: ad.price?.amount || ad.price || null,
          mileage: ad.mileage || null,
          power_kw: ad.powerKw || ad.power || null,
          fuel: ad.fuelType || ad.fuel || null,
          gearbox: ad.transmission || ad.gearbox || null,
          firstRegistration: ad.firstRegistration || null,
          city: ad.location || null,
          image: ad.images?.[0]?.uri ? ad.images[0].uri.replace('{size}', '400x300') : (ad.imageUrl || null),
          url: ad.id ? `https://suchen.mobile.de/fahrzeuge/details.html?id=${ad.id}` : null
        };
      });

      setCars(normalized);
      setScreen("swipe");
    } catch (e) {
      setError("Fehler beim Verarbeiten der Fahrzeugdaten. Versuche es bitte noch einmal.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d",
      fontFamily: "'DM Sans',sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      overflowX: "hidden", userSelect: "none", paddingBottom: 20,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap');`}</style>
      {screen === "filter"
        ? <FilterScreen onSearch={handleSearch} loading={loading} error={error} />
        : <SwipeScreen cars={cars} onReset={() => { setScreen("filter"); setCars([]); }} />
      }
    </div>
  );
}

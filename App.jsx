// App.jsx - CORS-sichere Variante über mobile.de App-API via ScraperAPI (Syntax-bereinigt)

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
        <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>Mobile.de App-API Core Secure Tunnel 🛡️⚡</div>
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
        {loading ? "Daten werden geladen…" : "🔥 Los swipe'n"}
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
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {car.make} {car.model}
            <span style={{ fontSize: 13, color: "#666", fontWeight: 400, marginLeft: 6 }}>{fmtYear(car.firstRegistration)}</span>
          </div>
          {car.tuev && <span style={{ fontSize: 10, color: "#999", background: "#222", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>TÜV {car.tuev}</span>}
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
        setLiked((p) =>

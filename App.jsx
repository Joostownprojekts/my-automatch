// App.jsx - CORS-sichere Variante über mobile.de App-API via ScraperAPI

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
          <input style={{ ...inp, flex: 2 }} placeholder="PLZ (z.B. 28195)" value={f.plz} onChange={set("

import { useState, useEffect } from "react";

const DOMAINS = {
  "💻 Programare": {
    color: "#4ecdc4",
    skills: ["JavaScript", "Python", "TypeScript", "React", "Node.js", "SQL", "Java", "C++", "Rust", "Go"]
  },
  "🎨 Design & Creative": {
    color: "#ff6b6b",
    skills: ["Figma", "Photoshop", "Illustrator", "After Effects", "Blender", "UX Design", "Branding", "Motion Design"]
  },
  "📊 Data & Analytics": {
    color: "#ffe66d",
    skills: ["Excel Avansat", "Power BI", "Tableau", "Python Data", "Machine Learning", "Statistics", "SQL Avansat", "R"]
  },
  "📣 Marketing & Business": {
    color: "#a29bfe",
    skills: ["SEO", "Google Ads", "Social Media", "Email Marketing", "Copywriting", "Growth Hacking", "Branding", "Analytics"]
  },
  "🎵 Muzică & Audio": {
    color: "#fd79a8",
    skills: ["Producție Muzicală", "Mixing & Mastering", "Ableton Live", "FL Studio", "Sound Design", "Chitară", "Pian"]
  },
  "🌐 Limbi Străine": {
    color: "#55efc4",
    skills: ["Engleză", "Franceză", "Spaniolă", "Germană", "Italiană", "Japoneză", "Chineză", "Arabă"]
  },
  "🔧 IT & Infrastructură": {
    color: "#74b9ff",
    skills: ["Linux", "Docker", "Kubernetes", "AWS", "Cybersecurity", "DevOps", "Networking", "Git"]
  },
  "🏋️ Sport & Wellness": {
    color: "#fdcb6e",
    skills: ["Fitness & Strength", "Nutriție", "Yoga", "Running", "Meditație", "Mental Health", "Ciclism"]
  }
};

const LEVELS = [
  { id: "bronze", emoji: "🥉", color: "#cd7f32", label: "Bronze", xpPer: 10 },
  { id: "silver", emoji: "🥈", color: "#c0c0c0", label: "Silver", xpPer: 25 },
  { id: "gold", emoji: "🥇", color: "#ffd700", label: "Gold", xpPer: 50 },
  { id: "platinum", emoji: "💎", color: "#b0e0e6", label: "Platinum", xpPer: 100 },
  { id: "diamond", emoji: "👑", color: "#a29bfe", label: "Diamond", xpPer: 200 },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("ro");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080812",
      color: "#e8e8f0",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,8,18,0.9)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#a29bfe,#4ecdc4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#0d0d1a", fontSize: 18
          }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>
            Skill<span style={{ background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["home", "explore", "profile"].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              background: page === p ? "rgba(78,205,196,0.12)" : "transparent",
              border: "none", borderRadius: 8, padding: "8px 16px",
              color: page === p ? "#4ecdc4" : "rgba(255,255,255,0.4)",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif"
            }}>
              {p === "home" ? "🏠 Home" : p === "explore" ? "🔍 Explore" : "👤 Profil"}
            </button>
          ))}
          <button onClick={() => setLang(l => l === "ro" ? "en" : "ro")} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "7px 12px", color: "rgba(255,255,255,0.6)",
            fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}>{lang.toUpperCase()}</button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div style={{ textAlign: "center", padding: "80px 32px 60px" }}>
          <div style={{
            display: "inline-block", background: "rgba(162,155,254,0.1)",
            border: "1px solid rgba(162,155,254,0.25)", borderRadius: 20,
            padding: "6px 18px", fontSize: 12, fontWeight: 700,
            color: "#a29bfe", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24
          }}>
            Beta · Gratuit · Fără card
          </div>
          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: -2, margin: "0 0 20px", lineHeight: 1.05 }}>
            Dovedește ce{" "}
            <span style={{ background: "linear-gradient(135deg,#ff6b6b,#a29bfe,#4ecdc4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              știi cu adevărat.
            </span>
          </h1>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Nu cursuri. Nu certificate false. Evaluare reală de AI și profesioniști verificați.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button onClick={() => setPage("explore")} style={{
              background: "#4ecdc4", border: "none", borderRadius: 14,
              padding: "15px 36px", color: "#0d0d1a", fontWeight: 800,
              fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(78,205,196,0.4)"
            }}>
              Începe Gratuit →
            </button>
            <button style={{
              background: "transparent", border: "1px solid rgba(162,155,254,0.4)",
              borderRadius: 14, padding: "15px 36px", color: "#a29bfe",
              fontWeight: 700, fontSize: 16, cursor: "pointer"
            }}>
              Cum funcționează
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 60 }}>
            {[
              { n: "8+", label: "Domenii" },
              { n: "70+", label: "Skills" },
              { n: "25", label: "Niveluri per skill" }
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: "#4ecdc4" }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Domain cards */}
          <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, maxWidth: 1000, margin: "60px auto 0" }}>
            {Object.entries(DOMAINS).map(([name, cfg]) => (
              <div key={name} onClick={() => setPage("explore")} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 20, cursor: "pointer", textAlign: "left",
                transition: "all 0.2s"
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{name.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{cfg.skills.length} skills · 🥉🥈🥇💎👑</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPLORE */}
      {page === "explore" && (
        <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Explorează Skills</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Alege un domeniu pentru a începe evaluarea</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 }}>
            {Object.entries(DOMAINS).map(([name, cfg]) => (
              <div key={name} style={{
                background: `${cfg.color}10`, border: `1px solid ${cfg.color}30`,
                borderRadius: 16, padding: 24, cursor: "pointer"
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: cfg.color, marginBottom: 6 }}>
                  {name.split(" ").slice(1).join(" ")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
                  {cfg.skills.slice(0, 4).map(skill => (
                    <div key={skill} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: cfg.color }}>›</span> {skill}
                    </div>
                  ))}
                  {cfg.skills.length > 4 && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                      +{cfg.skills.length - 4} mai multe...
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 4 }}>
                  {LEVELS.map(l => (
                    <span key={l.id} style={{ fontSize: 16 }}>{l.emoji}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {page === "profile" && (
        <div style={{ padding: 32, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#a29bfe,#4ecdc4)",
            margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32
          }}>👤</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Profilul Tău</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Înregistrează-te pentru a-ți salva progresul</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={{
              background: "#4ecdc4", border: "none", borderRadius: 10,
              padding: "12px 28px", color: "#0d0d1a", fontWeight: 800,
              fontSize: 15, cursor: "pointer"
            }}>Creează Cont</button>
            <button style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 10, padding: "12px 28px", color: "rgba(255,255,255,0.6)",
              fontWeight: 700, fontSize: 15, cursor: "pointer"
            }}>Am deja cont</button>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

const DOMAINS = {
  "💻 Programare": { color: "#4ecdc4", skills: ["JavaScript", "Python", "TypeScript", "React", "Node.js", "SQL", "Java", "C++"] },
  "🎨 Design & Creative": { color: "#ff6b6b", skills: ["Figma", "Photoshop", "Illustrator", "After Effects", "Blender", "UX Design"] },
  "📊 Data & Analytics": { color: "#ffe66d", skills: ["Excel Avansat", "Power BI", "Tableau", "Machine Learning", "Statistics", "R"] },
  "📣 Marketing & Business": { color: "#a29bfe", skills: ["SEO", "Google Ads", "Social Media", "Email Marketing", "Copywriting"] },
  "🎵 Muzică & Audio": { color: "#fd79a8", skills: ["Producție Muzicală", "Mixing & Mastering", "Ableton Live", "FL Studio"] },
  "🌐 Limbi Străine": { color: "#55efc4", skills: ["Engleză", "Franceză", "Spaniolă", "Germană", "Italiană", "Japoneză"] },
  "🔧 IT & Infrastructură": { color: "#74b9ff", skills: ["Linux", "Docker", "Kubernetes", "AWS", "Cybersecurity", "Git"] },
  "🏋️ Sport & Wellness": { color: "#fdcb6e", skills: ["Fitness", "Nutriție", "Yoga", "Running", "Meditație"] }
};

const LEVELS = [
  { id: "bronze", emoji: "🥉", color: "#cd7f32", label: "Bronze" },
  { id: "silver", emoji: "🥈", color: "#c0c0c0", label: "Silver" },
  { id: "gold", emoji: "🥇", color: "#ffd700", label: "Gold" },
  { id: "platinum", emoji: "💎", color: "#b0e0e6", label: "Platinum" },
  { id: "diamond", emoji: "👑", color: "#a29bfe", label: "Diamond" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage("home");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080812", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(78,205,196,0.2)", borderTop: "3px solid #4ecdc4", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  return (
    <div style={{ minHeight: "100vh", background: "#080812", color: "#e8e8f0", fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,18,0.9)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0d0d1a", fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>Skill<span style={{ background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span></span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[{id:"home",label:"🏠 Home"},{id:"explore",label:"🔍 Explore"},{id:"profile",label:"👤 Profil"}].map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{ background: page===p.id ? "rgba(78,205,196,0.12)" : "transparent", border: "none", borderRadius: 8, padding: "8px 16px", color: page===p.id ? "#4ecdc4" : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {p.label}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(162,155,254,0.1)", border: "1px solid rgba(162,155,254,0.2)", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#0d0d1a" }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{user.user_metadata?.full_name || user.email}</span>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 8, padding: "7px 14px", color: "#ff6b6b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ieși</button>
        </div>
      </nav>

      {page === "home" && (
        <div style={{ textAlign: "center", padding: "80px 32px 60px", animation: "fadeUp 0.5s ease" }}>
          <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: -2, margin: "0 0 20px", lineHeight: 1.05 }}>
            Bine ai venit,{" "}
            <span style={{ background: "linear-gradient(135deg,#ff6b6b,#a29bfe,#4ecdc4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {user.user_metadata?.full_name?.split(" ")[0] || "Warrior"}!
            </span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Dovedește ce știi cu adevărat. Evaluare reală de AI și profesioniști verificați.
          </p>
          <button onClick={() => setPage("explore")} style={{ background: "#4ecdc4", border: "none", borderRadius: 14, padding: "15px 36px", color: "#0d0d1a", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(78,205,196,0.4)" }}>
            Începe Evaluarea →
          </button>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 60 }}>
            {[{n:"8+",label:"Domenii",color:"#4ecdc4"},{n:"70+",label:"Skills",color:"#a29bfe"},{n:"25",label:"Niveluri per skill",color:"#ffe66d"}].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 40, fontWeight: 900, color: s.color }}>{s.n}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14, maxWidth: 1000, margin: "60px auto 0" }}>
            {Object.entries(DOMAINS).map(([name, cfg]) => (
              <div key={name} onClick={() => setPage("explore")} style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25`, borderRadius: 16, padding: 20, cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>{name.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{cfg.skills.length} skills · 🥉🥈🥇💎👑</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "explore" && (
        <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Explorează Skills</h2>
          <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Alege un domeniu pentru a începe evaluarea</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 }}>
            {Object.entries(DOMAINS).map(([name, cfg]) => (
              <div key={name} style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}30`, borderRadius: 16, padding: 24, cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: cfg.color, marginBottom: 12 }}>{name.split(" ").slice(1).join(" ")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {cfg.skills.slice(0, 4).map(skill => (
                    <div key={skill} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: cfg.color }}>›</span> {skill}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 4 }}>
                  {LEVELS.map(l => <span key={l.id} style={{ fontSize: 16 }}>{l.emoji}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "profile" && (
        <div style={{ padding: 32, maxWidth: 600, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#0d0d1a" }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user.user_metadata?.full_name || "Utilizator"}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>{user.email}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[{label:"XP Total",value:"0",color:"#a29bfe"},{label:"Skills",value:"0",color:"#4ecdc4"},{label:"Quiz-uri",value:"0",color:"#ffe66d"}].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "11px 24px", color: "#ff6b6b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Deconectează-te
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

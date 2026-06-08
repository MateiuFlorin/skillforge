
function ProfilePage({ user, onLogout }) {
  const [stats, setStats] = useState({ xp: 0, skills: 0, quizzes: 0 });
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
    if (data) {
      const totalXP = data.reduce((a, r) => a + (r.xp || 0), 0);
      const uniqueSkills = [...new Set(data.map(r => r.skill))].length;
      const quizzes = data.length;
      setStats({ xp: totalXP, skills: uniqueSkills, quizzes });
      const skillMap = {};
      data.forEach(r => {
        if (!skillMap[r.skill]) skillMap[r.skill] = { xp: 0, count: 0, domain: r.domain };
        skillMap[r.skill].xp += r.xp || 0;
        skillMap[r.skill].count += 1;
      });
      const top = Object.entries(skillMap).sort((a,b) => b[1].xp - a[1].xp).slice(0,6);
      setTopSkills(top);
    }
    setLoading(false);
  };

  const levelInfo = (xp) => {
    if (xp >= 500) return { label: "Diamond 👑", color: "#8b5cf6" };
    if (xp >= 200) return { label: "Platinum 💎", color: "#06b6d4" };
    if (xp >= 100) return { label: "Gold 🥇", color: "#f59e0b" };
    if (xp >= 50) return { label: "Silver 🥈", color: "#9ca3af" };
    return { label: "Bronze 🥉", color: "#cd7f32" };
  };

  const lvl = levelInfo(stats.xp);

  return (
    <div style={{ width: "100%", padding: "48px 5vw", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Profile header */}
        <div style={{ background: "linear-gradient(135deg,#f5f3ff,#eff6ff)", border: "1px solid #e5e7eb", borderRadius: 24, padding: 40, marginBottom: 24, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{user.user_metadata?.full_name || "Utilizator"}</div>
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 10 }}>{user.email}</div>
            <div style={{ display: "inline-block", background: "#fff", border: `1px solid ${lvl.color}40`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: lvl.color }}>
              {lvl.label}
            </div>
          </div>
          <button onClick={onLogout} style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "10px 20px", color: "#f43f5e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Deconectează-te
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { label: "XP Total", value: stats.xp.toLocaleString(), color: "#8b5cf6", bg: "#f5f3ff", icon: "⚡" },
            { label: "Skills evaluate", value: stats.skills, color: "#0ea5e9", bg: "#f0f9ff", icon: "🎯" },
            { label: "Quiz-uri trecute", value: stats.quizzes, color: "#10b981", bg: "#ecfdf5", icon: "✅" }
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 16, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{loading ? "..." : s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top skills */}
        {topSkills.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 20, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#111827" }}>🏆 Top Skills</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
              {topSkills.map(([skill, data], i) => (
                <div key={skill} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣"][i]}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{skill}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{data.domain}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#8b5cf6" }}>+{data.xp} XP</div>
                  <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100,(data.xp/200)*100)}%`, background: "linear-gradient(90deg,#8b5cf6,#0ea5e9)", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topSkills.length === 0 && !loading && (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Niciun skill evaluat încă</div>
            <div style={{ fontSize: 14, color: "#9ca3af" }}>Completează primul quiz pentru a vedea progresul tău!</div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Quiz from "./Quiz";

const DOMAINS = {
  "💻 Programare": { color: "#0ea5e9", bg: "#f0f9ff", skills: ["JavaScript", "Python", "TypeScript", "React", "Node.js", "SQL", "Java", "C++"] },
  "🎨 Design & Creative": { color: "#f43f5e", bg: "#fff1f2", skills: ["Figma", "Photoshop", "Illustrator", "After Effects", "Blender", "UX Design"] },
  "📊 Data & Analytics": { color: "#f59e0b", bg: "#fffbeb", skills: ["Excel Avansat", "Power BI", "Tableau", "Machine Learning", "Statistics", "R"] },
  "📣 Marketing & Business": { color: "#8b5cf6", bg: "#f5f3ff", skills: ["SEO", "Google Ads", "Social Media", "Email Marketing", "Copywriting"] },
  "🎵 Muzică & Audio": { color: "#ec4899", bg: "#fdf2f8", skills: ["Producție Muzicală", "Mixing & Mastering", "Ableton Live", "FL Studio"] },
  "🌐 Limbi Străine": { color: "#10b981", bg: "#ecfdf5", skills: ["Engleză", "Franceză", "Spaniolă", "Germană", "Italiană", "Japoneză"] },
  "🔧 IT & Infrastructură": { color: "#3b82f6", bg: "#eff6ff", skills: ["Linux", "Docker", "Kubernetes", "AWS", "Cybersecurity", "Git"] },
  "🏋️ Sport & Wellness": { color: "#f97316", bg: "#fff7ed", skills: ["Fitness", "Nutriție", "Yoga", "Running", "Meditație"] }
};

const LEVELS = [
  { id: "bronze", emoji: "🥉", color: "#cd7f32", label: "Bronze" },
  { id: "silver", emoji: "🥈", color: "#9ca3af", label: "Silver" },
  { id: "gold", emoji: "🥇", color: "#f59e0b", label: "Gold" },
  { id: "platinum", emoji: "💎", color: "#06b6d4", label: "Platinum" },
  { id: "diamond", emoji: "👑", color: "#8b5cf6", label: "Diamond" },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [activeDomain, setActiveDomain] = useState(null);

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
    setActiveDomain(null);
  };

  const openDomain = (name) => {
    setActiveDomain({ name, ...DOMAINS[name] });
    setPage("quiz");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: "3px solid #8b5cf6", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  if (page === "quiz" && activeDomain) return (
    <Quiz domain={activeDomain} domainColor={activeDomain.color} onBack={() => { setPage("explore"); setActiveDomain(null); }} />
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#ffffff", color: "#111827", fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        body { background: #fff; }
      `}</style>

      {/* NAV */}
      <nav style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 5vw", borderBottom: "1px solid #f3f4f6", background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 18 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>Skill<span style={{ background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span></span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[{id:"home",label:"🏠 Home"},{id:"explore",label:"🔍 Explore"},{id:"profile",label:"👤 Profil"}].map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{ background: page===p.id ? "#f5f3ff" : "transparent", border: "none", borderRadius: 8, padding: "8px 16px", color: page===p.id ? "#8b5cf6" : "#6b7280", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}>
              {p.label}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "6px 14px", marginLeft: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{user.user_metadata?.full_name || user.email}</span>
          </div>
          <button onClick={handleLogout} style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "7px 14px", color: "#f43f5e", fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: 4 }}>Ieși</button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div style={{ width: "100%", animation: "fadeUp 0.5s ease" }}>
          {/* Hero */}
          <div style={{ width: "100%", textAlign: "center", padding: "80px 5vw 60px", background: "linear-gradient(180deg, #faf5ff 0%, #fff 100%)" }}>
            <div style={{ display: "inline-block", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#8b5cf6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
              Beta · Gratuit · Fără card
            </div>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, letterSpacing: -2, margin: "0 0 16px", lineHeight: 1.05, color: "#111827" }}>
              Bine ai venit,{" "}
              <span style={{ background: "linear-gradient(135deg,#f43f5e,#8b5cf6,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {user.user_metadata?.full_name?.split(" ")[0] || "Warrior"}!
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "#6b7280", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Dovedește ce știi cu adevărat. Evaluare reală de AI și profesioniști verificați.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setPage("explore")} style={{ background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", border: "none", borderRadius: 14, padding: "15px 36px", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(139,92,246,0.35)", fontFamily: "'Outfit', sans-serif" }}>
                Începe Evaluarea →
              </button>
              <button style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "15px 36px", color: "#374151", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                Cum funcționează
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 60 }}>
              {[{n:"8+",label:"Domenii",color:"#8b5cf6"},{n:"70+",label:"Skills",color:"#0ea5e9"},{n:"25",label:"Niveluri per skill",color:"#f59e0b"}].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: s.color }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Domain cards */}
          <div style={{ width: "100%", padding: "48px 5vw" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#111827" }}>Explorează domeniile</h2>
            <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 15 }}>Alege un domeniu și începe evaluarea cu AI</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 16 }}>
              {Object.entries(DOMAINS).map(([name, cfg]) => (
                <div key={name} onClick={() => openDomain(name)} style={{ background: cfg.bg, border: `1px solid ${cfg.color}25`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{name.split(" ")[0]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color, marginBottom: 6 }}>{name.split(" ").slice(1).join(" ")}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{cfg.skills.length} skills · 🥉🥈🥇💎👑</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPLORE */}
      {page === "explore" && (
        <div style={{ width: "100%", padding: "48px 5vw", animation: "fadeUp 0.5s ease" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#111827" }}>Explorează Skills</h2>
          <p style={{ color: "#6b7280", marginBottom: 32 }}>Alege un domeniu pentru a începe evaluarea cu AI</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 16 }}>
            {Object.entries(DOMAINS).map(([name, cfg]) => (
              <div key={name} onClick={() => openDomain(name)} style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: cfg.color, marginBottom: 12 }}>{name.split(" ").slice(1).join(" ")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                  {cfg.skills.slice(0, 4).map(skill => (
                    <div key={skill} style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: cfg.color, fontWeight: 700 }}>›</span> {skill}
                    </div>
                  ))}
                  {cfg.skills.length > 4 && <div style={{ fontSize: 12, color: "#9ca3af" }}>+{cfg.skills.length - 4} mai multe...</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {LEVELS.map(l => <span key={l.id} style={{ fontSize: 16 }}>{l.emoji}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {page === "profile" && (
        <div style={{ width: "100%", padding: "48px 5vw", animation: "fadeUp 0.5s ease" }}>
          <div style={{ maxWidth: 600, background: "#fff", border: "1px solid #f3f4f6", borderRadius: 20, padding: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff" }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{user.user_metadata?.full_name || "Utilizator"}</div>
                <div style={{ fontSize: 14, color: "#9ca3af" }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              {[{label:"XP Total",value:"0",color:"#8b5cf6",bg:"#f5f3ff"},{label:"Skills",value:"0",color:"#0ea5e9",bg:"#f0f9ff"},{label:"Quiz-uri",value:"0",color:"#f59e0b",bg:"#fffbeb"}].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={handleLogout} style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "11px 24px", color: "#f43f5e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Deconectează-te
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

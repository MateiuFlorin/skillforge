import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const LEAGUE_CRITERIA = {
  diamond: { min: 0.9, label: "👑 Diamond League", color: "#f59e0b", bg: "#fffbeb", desc: "Top 3% · 4.8+ stele · 50+ evaluări" },
  platinum: { min: 0.7, label: "💎 Platinum League", color: "#06b6d4", bg: "#ecfeff", desc: "Top 10% · 4.5+ stele" },
  gold: { min: 0.5, label: "🥇 Gold League", color: "#f59e0b", bg: "#fffbeb", desc: "Profesioniști verificați activi" },
};

export default function Liga({ user }) {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState("all");

  useEffect(() => { loadProfessionals(); }, []);

  const loadProfessionals = async () => {
    const { data } = await supabase.from("professionals")
      .select("*")
      .order("votes_yes", { ascending: false });
    const verified = (data || []).filter(p => {
      const total = (p.votes_yes || 0) + (p.votes_no || 0);
      if (total < 3) return false;
      return (p.votes_yes / total) >= 0.7;
    });
    setProfessionals(verified);
    setLoading(false);
  };

  const getLeague = (prof) => {
    const total = (prof.votes_yes || 0) + (prof.votes_no || 0);
    if (total === 0) return null;
    const ratio = prof.votes_yes / total;
    if (ratio >= 0.9) return "diamond";
    if (ratio >= 0.8) return "platinum";
    return "gold";
  };

  const filtered = selectedLeague === "all" ? professionals : professionals.filter(p => getLeague(p) === selectedLeague);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#fffbeb,#fff7ed)", border: "1px solid #fde68a", borderRadius: 20, padding: 32, marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👑</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>Liga Profesioniștilor</h2>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>
          Cei mai buni evaluatori verificați de comunitate. Ei fac diferența dintre AI și excelență umană.
        </p>
      </div>

      {/* League filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { id: "all", label: "🏆 Toți", color: "#374151" },
          { id: "diamond", label: "👑 Diamond", color: "#f59e0b" },
          { id: "platinum", label: "💎 Platinum", color: "#06b6d4" },
          { id: "gold", label: "🥇 Gold", color: "#f59e0b" },
        ].map(l => (
          <button key={l.id} onClick={() => setSelectedLeague(l.id)} style={{ background: selectedLeague === l.id ? l.color : "#f9fafb", border: `1px solid ${selectedLeague === l.id ? l.color : "#e5e7eb"}`, borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: selectedLeague === l.id ? "#fff" : "#374151", transition: "all 0.2s" }}>
            {l.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Se încarcă...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#f9fafb", borderRadius: 20, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Liga se construiește!</div>
          <div style={{ fontSize: 14, color: "#9ca3af", maxWidth: 400, margin: "0 auto" }}>
            Profesioniștii verificați de comunitate vor apărea aici. Aplică și obține voturile necesare!
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((prof, i) => {
            const league = getLeague(prof);
            const leagueInfo = LEAGUE_CRITERIA[league];
            const total = (prof.votes_yes || 0) + (prof.votes_no || 0);
            const ratio = total > 0 ? ((prof.votes_yes / total) * 100).toFixed(0) : 0;
            return (
              <div key={prof.id} style={{ background: "#fff", border: `1px solid ${leagueInfo?.color}30`, borderRadius: 20, padding: 24, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
                {/* Rank */}
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: i < 3 ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "#f9fafb", border: "2px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 20 : 16, fontWeight: 900, color: i < 3 ? "#fff" : "#6b7280", flexShrink: 0 }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </div>

                {/* Avatar */}
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                  {prof.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{prof.name}</span>
                    <span style={{ background: leagueInfo?.bg, border: `1px solid ${leagueInfo?.color}40`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: leagueInfo?.color }}>
                      {leagueInfo?.label}
                    </span>
                  </div>
                  {prof.bio && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, lineHeight: 1.5 }}>{prof.bio.slice(0, 100)}{prof.bio.length > 100 ? "..." : ""}</div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(prof.domains || []).slice(0, 3).map(d => (
                      <span key={d} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>
                        {d.split(" ")[0]} {d.split(" ").slice(1).join(" ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>{ratio}%</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Aprobare</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b" }}>{total}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Voturi</div>
                  </div>
                </div>

                {/* Links */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {prof.linkedin && <a href={prof.linkedin} target="_blank" rel="noreferrer" style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#0ea5e9", fontWeight: 700, textDecoration: "none" }}>LinkedIn</a>}
                  {prof.portfolio && <a href={prof.portfolio} target="_blank" rel="noreferrer" style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f59e0b", fontWeight: 700, textDecoration: "none" }}>Portfolio</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How to join */}
      <div style={{ marginTop: 40, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, padding: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#111827" }}>🎯 Cum intri în Ligă?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
          {[
            { step: "1", text: "Aplică ca Profesionist în tab-ul Profesioniști", icon: "📝" },
            { step: "2", text: "Obține minim 70% voturi pozitive de la comunitate", icon: "✅" },
            { step: "3", text: "Completează 5+ evaluări de proiecte", icon: "🎯" },
            { step: "4", text: "Menține un rating ridicat de la userii evaluați", icon: "⭐" },
          ].map(s => (
            <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{s.step}</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{s.icon} {s.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

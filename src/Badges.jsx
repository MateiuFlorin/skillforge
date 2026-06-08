import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const BADGES = [
  { id: "first_quiz", icon: "🎯", name: "Primul Quiz", desc: "Completează primul quiz", condition: (stats) => stats.quizzes >= 1, xpRequired: 0 },
  { id: "bronze_master", icon: "🥉", name: "Bronze Master", desc: "Completează 5 subniveluri Bronze", condition: (stats) => stats.bronze >= 5, xpRequired: 0 },
  { id: "silver_master", icon: "🥈", name: "Silver Master", desc: "Completează 5 subniveluri Silver", condition: (stats) => stats.silver >= 5, xpRequired: 0 },
  { id: "gold_master", icon: "🥇", name: "Gold Master", desc: "Completează 5 subniveluri Gold", condition: (stats) => stats.gold >= 5, xpRequired: 0 },
  { id: "xp_100", icon: "⚡", name: "Energy 100", desc: "Acumulează 100 XP", condition: (stats) => stats.xp >= 100, xpRequired: 100 },
  { id: "xp_500", icon: "🔥", name: "On Fire", desc: "Acumulează 500 XP", condition: (stats) => stats.xp >= 500, xpRequired: 500 },
  { id: "xp_1000", icon: "💥", name: "Power 1000", desc: "Acumulează 1000 XP", condition: (stats) => stats.xp >= 1000, xpRequired: 1000 },
  { id: "multi_domain", icon: "🌍", name: "Explorer", desc: "Evaluează în 3 domenii diferite", condition: (stats) => stats.domains >= 3, xpRequired: 0 },
  { id: "skill_master", icon: "🏆", name: "Skill Master", desc: "Completează toate nivelurile unui skill", condition: (stats) => stats.fullSkills >= 1, xpRequired: 0 },
  { id: "diamond_hunter", icon: "👑", name: "Diamond Hunter", desc: "Obține primul Diamond", condition: (stats) => stats.diamond >= 1, xpRequired: 0 },
  { id: "perfectionist", icon: "✨", name: "Perfectionist", desc: "Treci un quiz cu 100%", condition: (stats) => stats.perfect >= 1, xpRequired: 0 },
  { id: "dedicated", icon: "📚", name: "Dedicat", desc: "Completează 25 de quiz-uri", condition: (stats) => stats.quizzes >= 25, xpRequired: 0 },
];

export default function Badges({ user }) {
  const [stats, setStats] = useState({ xp: 0, quizzes: 0, bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0, domains: 0, fullSkills: 0, perfect: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
    if (data) {
      const xp = data.reduce((a, r) => a + (r.xp || 0), 0);
      const quizzes = data.length;
      const bronze = data.filter(r => r.level_id === "bronze").length;
      const silver = data.filter(r => r.level_id === "silver").length;
      const gold = data.filter(r => r.level_id === "gold").length;
      const platinum = data.filter(r => r.level_id === "platinum").length;
      const diamond = data.filter(r => r.level_id === "diamond").length;
      const domains = [...new Set(data.map(r => r.domain))].length;
      const skillMap = {};
      data.forEach(r => {
        if (!skillMap[r.skill]) skillMap[r.skill] = new Set();
        skillMap[r.skill].add(`${r.level_id}_${r.sublevel}`);
      });
      const fullSkills = Object.values(skillMap).filter(s => s.size >= 25).length;
      setStats({ xp, quizzes, bronze, silver, gold, platinum, diamond, domains, fullSkills, perfect: 0 });
    }
    setLoading(false);
  };

  const earnedBadges = BADGES.filter(b => b.condition(stats));
  const lockedBadges = BADGES.filter(b => !b.condition(stats));

  if (loading) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: "3px solid #8b5cf6", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pop{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

      {/* Earned */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>🏅 Badge-uri câștigate</div>
          <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700, color: "#8b5cf6" }}>
            {earnedBadges.length}/{BADGES.length}
          </div>
        </div>

        {earnedBadges.length === 0 ? (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Completează primul quiz pentru a câștiga primul badge!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
            {earnedBadges.map(badge => (
              <div key={badge.id} style={{ background: "linear-gradient(135deg,#f5f3ff,#eff6ff)", border: "1px solid #c4b5fd", borderRadius: 16, padding: 20, textAlign: "center", animation: "pop 0.3s ease", boxShadow: "0 4px 12px rgba(139,92,246,0.15)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 4 }}>{badge.name}</div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4 }}>{badge.desc}</div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#8b5cf6", fontWeight: 700 }}>✓ Câștigat</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>🔒 Badge-uri blocate</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
          {lockedBadges.map(badge => (
            <div key={badge.id} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, textAlign: "center", opacity: 0.6 }}>
              <div style={{ fontSize: 36, marginBottom: 8, filter: "grayscale(1)" }}>{badge.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#374151", marginBottom: 4 }}>{badge.name}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.4 }}>{badge.desc}</div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>🔒 Blocat</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

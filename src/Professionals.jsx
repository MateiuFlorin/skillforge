import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DOMAINS = [
  "💻 Programare", "🎨 Design & Creative", "📊 Data & Analytics",
  "📣 Marketing & Business", "🎵 Muzică & Audio", "🌐 Limbi Străine",
  "🔧 IT & Infrastructură", "🏋️ Sport & Wellness"
];

export default function Professionals({ user }) {
  const [tab, setTab] = useState("browse");
  const [professionals, setProfessionals] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [form, setForm] = useState({ name: "", bio: "", linkedin: "", portfolio: "", domains: [] });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from("professionals").select("*").order("votes_yes", { ascending: false });
    const { data: myVotes } = await supabase.from("professional_votes").select("*").eq("voter_id", user.id);
    const { data: mine } = await supabase.from("professionals").select("*").eq("user_id", user.id).single();
    setProfessionals(profs || []);
    const voteMap = {};
    (myVotes || []).forEach(v => { voteMap[v.professional_id] = v.vote; });
    setVotes(voteMap);
    if (mine) { setMyProfile(mine); setForm({ name: mine.name, bio: mine.bio || "", linkedin: mine.linkedin || "", portfolio: mine.portfolio || "", domains: mine.domains || [] }); }
    setLoading(false);
  };

  const handleVote = async (profId, vote) => {
    if (votes[profId]) return showToast("Ai votat deja!", "error");
    await supabase.from("professional_votes").insert({ professional_id: profId, voter_id: user.id, vote });
    const field = vote === "yes" ? "votes_yes" : "votes_no";
    const prof = professionals.find(p => p.id === profId);
    await supabase.from("professionals").update({ [field]: (prof[field] || 0) + 1 }).eq("id", profId);
    setVotes(prev => ({ ...prev, [profId]: vote }));
    setProfessionals(prev => prev.map(p => p.id === profId ? { ...p, [field]: (p[field] || 0) + 1 } : p));
    showToast(vote === "yes" ? "Vot pozitiv trimis! ✅" : "Vot negativ trimis!");
  };

  const handleApply = async () => {
    if (!form.name.trim() || form.domains.length === 0) return showToast("Completează numele și alege cel puțin un domeniu!", "error");
    setSubmitting(true);
    if (myProfile) {
      await supabase.from("professionals").update({ name: form.name, bio: form.bio, linkedin: form.linkedin, portfolio: form.portfolio, domains: form.domains }).eq("id", myProfile.id);
      showToast("Profil actualizat!");
    } else {
      await supabase.from("professionals").insert({ user_id: user.id, name: form.name, bio: form.bio, linkedin: form.linkedin, portfolio: form.portfolio, domains: form.domains });
      showToast("Aplicație trimisă! Comunitatea va vota.");
    }
    await loadData();
    setSubmitting(false);
    setTab("browse");
  };

  const toggleDomain = (d) => {
    setForm(prev => ({
      ...prev,
      domains: prev.domains.includes(d) ? prev.domains.filter(x => x !== d) : [...prev.domains, d]
    }));
  };

  const filtered = filter === "all" ? professionals : professionals.filter(p => p.domains?.includes(filter));
  const getStatus = (p) => {
    const total = (p.votes_yes || 0) + (p.votes_no || 0);
    if (total < 5) return { label: "În așteptare", color: "#f59e0b", bg: "#fffbeb" };
    const ratio = p.votes_yes / total;
    if (ratio >= 0.7) return { label: "Verificat ✓", color: "#10b981", bg: "#ecfdf5" };
    return { label: "Respins", color: "#f43f5e", bg: "#fff1f2" };
  };

  const inputStyle = { width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Outfit', sans-serif" };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, background: toast.type === "error" ? "#f43f5e" : "#10b981", color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid #f3f4f6", paddingBottom: 0 }}>
        {[
          { id: "browse", label: "🔍 Explorează" },
          { id: "apply", label: myProfile ? "✏️ Editează Profil" : "➕ Aplică ca Profesionist" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #8b5cf6" : "2px solid transparent", padding: "10px 20px", color: tab === t.id ? "#8b5cf6" : "#6b7280", fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BROWSE */}
      {tab === "browse" && (
        <div>
          {/* Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <button onClick={() => setFilter("all")} style={{ background: filter === "all" ? "#8b5cf6" : "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: filter === "all" ? "#fff" : "#374151" }}>
              Toate
            </button>
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setFilter(d)} style={{ background: filter === d ? "#8b5cf6" : "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: filter === d ? "#fff" : "#374151" }}>
                {d.split(" ")[0]} {d.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "#f9fafb", borderRadius: 20, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🏫</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Niciun profesionist încă</div>
              <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 20 }}>Fii primul care aplică!</div>
              <button onClick={() => setTab("apply")} style={{ background: "#8b5cf6", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Aplică acum
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
              {filtered.map(prof => {
                const status = getStatus(prof);
                const total = (prof.votes_yes || 0) + (prof.votes_no || 0);
                const myVote = votes[prof.id];
                return (
                  <div key={prof.id} style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 20, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                        {prof.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 2 }}>{prof.name}</div>
                        <div style={{ display: "inline-block", background: status.bg, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: status.color }}>{status.label}</div>
                      </div>
                    </div>

                    {prof.bio && <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 14 }}>{prof.bio}</div>}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {(prof.domains || []).map(d => (
                        <span key={d} style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#8b5cf6", fontWeight: 600 }}>
                          {d.split(" ")[0]} {d.split(" ").slice(1).join(" ")}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {prof.linkedin && <a href={prof.linkedin} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px", textAlign: "center", fontSize: 12, color: "#0ea5e9", fontWeight: 700, textDecoration: "none" }}>LinkedIn</a>}
                      {prof.portfolio && <a href={prof.portfolio} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "8px", textAlign: "center", fontSize: 12, color: "#8b5cf6", fontWeight: 700, textDecoration: "none" }}>Portfolio</a>}
                    </div>

                    {prof.user_id !== user.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
                          {total} voturi · {prof.votes_yes || 0} ✅ · {prof.votes_no || 0} ❌
                        </div>
                        {myVote ? (
                          <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>Ai votat: {myVote === "yes" ? "✅ Pozitiv" : "❌ Negativ"}</div>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleVote(prof.id, "yes")} style={{ flex: 1, background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 8, padding: "8px", fontSize: 13, color: "#10b981", fontWeight: 700, cursor: "pointer" }}>
                              ✅ Recomand
                            </button>
                            <button onClick={() => handleVote(prof.id, "no")} style={{ flex: 1, background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px", fontSize: 13, color: "#f43f5e", fontWeight: 700, cursor: "pointer" }}>
                              ❌ Nu recomand
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {prof.user_id === user.id && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6", fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
                        Acesta este profilul tău · {total} voturi primite
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLY */}
      {tab === "apply" && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 16, padding: 20, marginBottom: 28, fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
            💡 Aplică ca profesionist și comunitatea va vota. Dacă obții peste 70% voturi pozitive, devii profesionist verificat și poți evalua alți utilizatori.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>Nume complet *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Ion Popescu" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>Bio / Descriere</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Descrie experiența ta profesională..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>LinkedIn URL</label>
              <input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>Portfolio / Website</label>
              <input value={form.portfolio} onChange={e => setForm(p => ({ ...p, portfolio: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "block" }}>Domenii de expertiză * (alege cel puțin unul)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DOMAINS.map(d => (
                  <button key={d} onClick={() => toggleDomain(d)} style={{ background: form.domains.includes(d) ? "#8b5cf6" : "#f9fafb", border: `1px solid ${form.domains.includes(d) ? "#8b5cf6" : "#e5e7eb"}`, borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: form.domains.includes(d) ? "#fff" : "#374151", transition: "all 0.2s" }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleApply} disabled={submitting} style={{ background: submitting ? "#e5e7eb" : "#8b5cf6", border: "none", borderRadius: 12, padding: "14px", color: submitting ? "#9ca3af" : "#fff", fontWeight: 800, fontSize: 15, cursor: submitting ? "not-allowed" : "pointer", marginTop: 8, fontFamily: "'Outfit', sans-serif" }}>
              {submitting ? "Se trimite..." : myProfile ? "Actualizează Profilul" : "Aplică ca Profesionist →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

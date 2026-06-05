import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) setError(error.message);
      else setSuccess("Cont creat! Verifică emailul să confirmi.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) setError(error.message);
      else onLogin(data.user);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
    padding: "12px 16px", color: "#fff", fontSize: 15,
    fontFamily: "'Outfit', sans-serif", outline: "none",
    boxSizing: "border-box", marginBottom: 12
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080812",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{
        width: 420, background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 40
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg,#a29bfe,#4ecdc4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 900, color: "#0d0d1a",
            margin: "0 auto 12px"
          }}>S</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            Skill<span style={{ background: "linear-gradient(135deg,#a29bfe,#4ecdc4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Forge</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            {mode === "login" ? "Bine ai revenit!" : "Creează cont gratuit"}
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          borderRadius: 10, padding: 4, marginBottom: 24
        }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              style={{
                flex: 1, padding: "9px", border: "none",
                borderRadius: 8, cursor: "pointer",
                background: mode === m ? "rgba(78,205,196,0.15)" : "transparent",
                color: mode === m ? "#4ecdc4" : "rgba(255,255,255,0.4)",
                fontWeight: 700, fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                transition: "all 0.2s"
              }}>
              {m === "login" ? "Intră în cont" : "Înregistrare"}
            </button>
          ))}
        </div>

        {/* Fields */}
        {mode === "register" && (
          <input
            placeholder="Numele tău complet"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Parolă"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* Error / Success */}
        {error && (
          <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff6b6b", marginBottom: 12 }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#4ecdc4", marginBottom: 12 }}>
            ✅ {success}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", background: "#4ecdc4", border: "none",
            borderRadius: 10, padding: "13px", color: "#0d0d1a",
            fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Outfit', sans-serif",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 20px rgba(78,205,196,0.3)"
          }}>
          {loading ? "Se procesează..." : mode === "login" ? "Intră în cont →" : "Creează cont gratuit →"}
        </button>
      </div>
    </div>
  );
}
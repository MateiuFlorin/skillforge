import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const LEVELS = [
  { id: "bronze", emoji: "🥉", color: "#cd7f32", label: "Bronze", desc: "Cunoștințe de bază", xpPer: 10 },
  { id: "silver", emoji: "🥈", color: "#9ca3af", label: "Silver", desc: "Elementar", xpPer: 25 },
  { id: "gold", emoji: "🥇", color: "#f59e0b", label: "Gold", desc: "Intermediar", xpPer: 50 },
  { id: "platinum", emoji: "💎", color: "#06b6d4", label: "Platinum", desc: "Avansat", xpPer: 100 },
  { id: "diamond", emoji: "👑", color: "#8b5cf6", label: "Diamond", desc: "Expert", xpPer: 200 },
];

const API_HEADERS = () => ({
  "Content-Type": "application/json",
  "x-api-key": localStorage.getItem("skillforge_apikey") || "",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
});

async function generateQuiz(skill, levelId, sublevel) {
  const levelNames = { bronze: "Beginner", silver: "Elementary", gold: "Intermediate", platinum: "Advanced", diamond: "Expert" };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: API_HEADERS(),
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: "You are a quiz generator. Always respond with valid JSON only. No markdown, no explanation, just the JSON object.",
      messages: [{ role: "user", content: `Generate a 5-question multiple choice quiz for skill "${skill}" at ${levelNames[levelId]} level sublevel ${sublevel}/5. Return ONLY this JSON:
{"questions":[{"question":"text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correct":0},{"question":"text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correct":1},{"question":"text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correct":2},{"question":"text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correct":3},{"question":"text","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correct":0}],"practical":{"question":"practical scenario question","rubric":"key points for good answer"}}` }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function evaluatePractical(skill, levelId, sublevel, question, rubric, answer) {
  const levelNames = { bronze: "Beginner", silver: "Elementary", gold: "Intermediate", platinum: "Advanced", diamond: "Expert" };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: API_HEADERS(),
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: "You are an evaluator. Respond with valid JSON only.",
      messages: [{ role: "user", content: `Evaluate this answer for "${skill}" at ${levelNames[levelId]} sublevel ${sublevel}/5.\nQuestion: ${question}\nRubric: ${rubric}\nAnswer: ${answer}\nReturn ONLY: {"score":0-100,"passed":true,"feedback":"brief feedback in Romanian"}` }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

export default function Quiz({ domain, domainColor, onBack, user }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSublevel, setSelectedSublevel] = useState(null);
  const [step, setStep] = useState("skills");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [practicalAnswer, setPracticalAnswer] = useState("");
  const [practicalResult, setPracticalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("skillforge_apikey") || "");
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiInput, setApiInput] = useState("");

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id);
    const map = {};
    (data || []).forEach(row => {
      map[`${row.domain}|${row.skill}|${row.level_id}|${row.sublevel}`] = { xp: row.xp, completedAt: row.completed_at };
    });
    setProgress(map);
    setProgressLoading(false);
  };

  const isCompleted = (skill, levelId, sub) => !!progress[`${domain.name}|${skill}|${levelId}|${sub}`];

  const isLevelUnlocked = (skill, levelIndex) => {
    if (levelIndex === 0) return true;
    const prev = LEVELS[levelIndex - 1];
    return [1,2,3,4,5].every(s => isCompleted(skill, prev.id, s));
  };

  const isSublevelUnlocked = (skill, levelIndex, sub) => {
    if (!isLevelUnlocked(skill, levelIndex)) return false;
    if (sub === 1) return true;
    return isCompleted(skill, LEVELS[levelIndex].id, sub - 1);
  };

  const startQuiz = async (skill, levelId, sub) => {
    if (!apiKey) { setShowApiInput(true); return; }
    setSelectedSkill(skill); setSelectedLevel(levelId); setSelectedSublevel(sub);
    setStep("quiz"); setLoading(true); setQuiz(null); setQuizStep(0);
    setAnswers([]); setPracticalAnswer(""); setPracticalResult(null);
    setResult(null); setSelectedOption(null); setShowCorrect(false);
    try { const q = await generateQuiz(skill, levelId, sub); setQuiz(q); }
    catch (e) { setQuiz({ error: e.message }); }
    setLoading(false);
  };

  const handleOption = (idx) => {
    if (showCorrect) return;
    setSelectedOption(idx); setShowCorrect(true);
    const correct = quiz.questions[quizStep].correct;
    const newAnswers = [...answers, idx === correct];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (quizStep < 4) { setQuizStep(q => q + 1); setSelectedOption(null); setShowCorrect(false); }
      else setQuizStep(5);
    }, 1100);
  };

  const handlePractical = async () => {
    if (practicalAnswer.length < 20) return;
    setEvaluating(true);
    try {
      const pr = await evaluatePractical(selectedSkill, selectedLevel, selectedSublevel, quiz.practical.question, quiz.practical.rubric, practicalAnswer);
      setPracticalResult(pr);
      const mcScore = (answers.filter(Boolean).length / 5) * 100;
      const total = mcScore * 0.6 + pr.score * 0.4;
      const passed = total >= 80 && pr.passed;
      const lvl = LEVELS.find(l => l.id === selectedLevel);
      if (passed) {
        await supabase.from("user_progress").upsert({
          user_id: user.id, domain: domain.name, skill: selectedSkill,
          level_id: selectedLevel, sublevel: selectedSublevel, xp: lvl.xpPer
        }, { onConflict: "user_id,domain,skill,level_id,sublevel" });
        await loadProgress();
      }
      setResult({ passed, score: Math.round(total), xp: lvl.xpPer, mcCorrect: answers.filter(Boolean).length });
    } catch (e) {
      setPracticalResult({ score: 0, passed: false, feedback: "Eroare la evaluare. Încearcă din nou." });
    }
    setEvaluating(false);
  };

  const getTotalXP = () => Object.values(progress).reduce((a, v) => a + (v.xp || 0), 0);
  const currentLevel = selectedLevel ? LEVELS.find(l => l.id === selectedLevel) : null;
  const color = domainColor;

  if (showApiInput) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: 32, width: 440, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>🔑 Anthropic API Key</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
          Necesară pentru generarea quiz-urilor AI. Obține de la{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#8b5cf6" }}>console.anthropic.com</a>
        </div>
        <input type="password" value={apiInput} onChange={e => setApiInput(e.target.value)} placeholder="sk-ant-..."
          style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { localStorage.setItem("skillforge_apikey", apiInput); setApiKey(apiInput); setShowApiInput(false); }}
            style={{ background: "#8b5cf6", border: "none", borderRadius: 10, padding: "11px 22px", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Salvează</button>
          <button onClick={() => setShowApiInput(false)}
            style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "11px 22px", color: "#f43f5e", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Anulează</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#fff", fontFamily: "'Outfit', sans-serif", color: "#111827" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ width: "100%", padding: "20px 5vw", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 12, background: "#fff", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <button onClick={step === "skills" ? onBack : () => setStep("skills")}
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 16px", color: "#374151", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
          ← Înapoi
        </button>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{domain.name}</div>
        {getTotalXP() > 0 && (
          <div style={{ marginLeft: "auto", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 700, color: "#8b5cf6" }}>
            ⚡ {getTotalXP()} XP
          </div>
        )}
        {!apiKey && (
          <button onClick={() => { setApiInput(""); setShowApiInput(true); }}
            style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "7px 14px", color: "#f43f5e", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            🔑 API Key
          </button>
        )}
      </div>

      <div style={{ padding: "32px 5vw" }}>
        {/* SKILLS */}
        {step === "skills" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {progressLoading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: `3px solid ${color}`, margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Alege un skill</h2>
                <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>Selectează skill-ul pe care vrei să îl evaluezi</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
                  {domain.skills.map(skill => {
                    const xp = Object.entries(progress).filter(([k]) => k.startsWith(`${domain.name}|${skill}|`)).reduce((a,[,v]) => a+(v.xp||0), 0);
                    const done = Object.keys(progress).filter(k => k.startsWith(`${domain.name}|${skill}|`)).length;
                    return (
                      <button key={skill} onClick={() => { setSelectedSkill(skill); setStep("levels"); }}
                        style={{ background: done > 0 ? domain.bg : "#f9fafb", border: done > 0 ? `1px solid ${color}40` : "1px solid #e5e7eb", borderRadius: 14, padding: "16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#111827" }}>{skill}</div>
                        {done > 0
                          ? <div style={{ fontSize: 11, color, fontWeight: 700 }}>+{xp} XP · {done}/25</div>
                          : <div style={{ fontSize: 11, color: "#9ca3af" }}>Neevaluat</div>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* LEVELS */}
        {step === "levels" && selectedSkill && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: 700 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{selectedSkill}</h2>
            <p style={{ color: "#6b7280", marginBottom: 28, fontSize: 14 }}>Parcurge nivelurile în ordine. Fiecare nivel are 5 subniveluri.</p>
            {LEVELS.map((level, li) => {
              const unlocked = isLevelUnlocked(selectedSkill, li);
              const allDone = [1,2,3,4,5].every(s => isCompleted(selectedSkill, level.id, s));
              return (
                <div key={level.id} style={{ marginBottom: 16, background: unlocked ? "#fff" : "#f9fafb", border: `1px solid ${unlocked ? level.color + "40" : "#e5e7eb"}`, borderRadius: 16, padding: 20, opacity: unlocked ? 1 : 0.5, boxShadow: unlocked ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 26 }}>{level.emoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: unlocked ? level.color : "#9ca3af" }}>
                        {level.label}
                        {allDone && <span style={{ marginLeft: 8, fontSize: 11, background: `${level.color}15`, padding: "2px 8px", borderRadius: 20, color: level.color }}>✓ Complet</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{level.desc} · {level.xpPer} XP per sublevel</div>
                    </div>
                    {!unlocked && <span style={{ marginLeft: "auto", fontSize: 18 }}>🔒</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                    {[1,2,3,4,5].map(sub => {
                      const subUnlocked = isSublevelUnlocked(selectedSkill, li, sub);
                      const done = isCompleted(selectedSkill, level.id, sub);
                      return (
                        <button key={sub} onClick={() => subUnlocked && startQuiz(selectedSkill, level.id, sub)}
                          style={{ background: done ? `${level.color}15` : subUnlocked ? "#fff" : "#f9fafb", border: done ? `1px solid ${level.color}50` : `1px solid ${subUnlocked ? "#e5e7eb" : "#f3f4f6"}`, borderRadius: 10, padding: "12px 8px", cursor: subUnlocked ? "pointer" : "not-allowed", textAlign: "center", transition: "all 0.2s" }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{done ? "✅" : subUnlocked ? level.emoji : "🔒"}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: done ? level.color : subUnlocked ? "#374151" : "#d1d5db" }}>
                            {level.label.charAt(0)}{sub}
                          </div>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                            {done ? `+${level.xpPer}XP` : subUnlocked ? `${level.xpPer}XP` : ""}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedSkill}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{currentLevel?.emoji} {currentLevel?.label} · Subnivel {selectedSublevel}/5</div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: `3px solid ${color}`, margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 14, color: "#6b7280" }}>AI generează întrebări...</div>
              </div>
            )}

            {quiz?.error && (
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 14, padding: 24, textAlign: "center" }}>
                <div style={{ color: "#f43f5e", marginBottom: 12 }}>❌ {quiz.error}</div>
                <button onClick={() => startQuiz(selectedSkill, selectedLevel, selectedSublevel)}
                  style={{ background: color, border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                  Încearcă din nou
                </button>
              </div>
            )}

            {result && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{result.passed ? "🎉" : "💪"}</div>
                <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: result.passed ? "#10b981" : "#f43f5e" }}>
                  {result.passed ? "Promovat!" : "Mai încearcă!"}
                </div>
                <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 8 }}>
                  Scor: <strong style={{ color: "#f59e0b" }}>{result.score}%</strong> · {result.mcCorrect}/5 grilă corecte
                </div>
                {result.passed && <div style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6", margin: "16px 0" }}>+{result.xp} XP ⚡ salvat în cont!</div>}
                {practicalResult?.feedback && (
                  <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, margin: "16px 0", fontSize: 14, color: "#374151", lineHeight: 1.6, textAlign: "left" }}>
                    💬 {practicalResult.feedback}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                  {!result.passed && (
                    <button onClick={() => startQuiz(selectedSkill, selectedLevel, selectedSublevel)}
                      style={{ background: color, border: "none", borderRadius: 10, padding: "11px 22px", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                      Încearcă din nou
                    </button>
                  )}
                  <button onClick={() => setStep("levels")}
                    style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 22px", color: "#374151", fontWeight: 700, cursor: "pointer" }}>
                    Înapoi la niveluri
                  </button>
                </div>
              </div>
            )}

            {quiz && !quiz.error && !result && quizStep < 5 && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
                  {[0,1,2,3,4,"P"].map((s, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: (typeof s === "number" ? quizStep > s : quizStep === 5) ? color : (typeof s === "number" && quizStep === s) ? `${color}60` : "#e5e7eb", transition: "background 0.3s" }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>Întrebarea {quizStep + 1} din 5</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: "#111827" }}>
                  {quiz.questions[quizStep].question}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {quiz.questions[quizStep].options.map((opt, oi) => {
                    const isCorrect = oi === quiz.questions[quizStep].correct;
                    const isSelected = selectedOption === oi;
                    let bg = "#f9fafb"; let border = "1px solid #e5e7eb"; let col = "#374151";
                    if (showCorrect) {
                      if (isCorrect) { bg = "#ecfdf5"; border = "1px solid #6ee7b7"; col = "#10b981"; }
                      else if (isSelected) { bg = "#fff1f2"; border = "1px solid #fca5a5"; col = "#f43f5e"; }
                    }
                    return (
                      <button key={oi} onClick={() => handleOption(oi)}
                        style={{ background: bg, border, borderRadius: 12, padding: "14px 18px", cursor: showCorrect ? "default" : "pointer", textAlign: "left", fontSize: 14, color: col, fontFamily: "'Outfit', sans-serif", fontWeight: showCorrect && isCorrect ? 700 : 400, transition: "all 0.2s", lineHeight: 1.4 }}>
                        {opt}
                        {showCorrect && isCorrect && <span style={{ float: "right" }}>✓</span>}
                        {showCorrect && isSelected && !isCorrect && <span style={{ float: "right" }}>✗</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {quiz && !quiz.error && !result && quizStep === 5 && !practicalResult && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 12, color, marginBottom: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Exercițiu Practic</div>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 20, color: "#111827" }}>{quiz.practical?.question}</div>
                <textarea value={practicalAnswer} onChange={e => setPracticalAnswer(e.target.value)}
                  placeholder="Răspunsul tău..." rows={6}
                  style={{ width: "100%", background: "#f9fafb", border: `1px solid ${practicalAnswer.length > 20 ? color : "#e5e7eb"}`, borderRadius: 12, padding: "14px 16px", color: "#111827", fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{practicalAnswer.length} caractere · minim 20</div>
                  <button onClick={handlePractical} disabled={evaluating || practicalAnswer.length < 20}
                    style={{ background: practicalAnswer.length >= 20 ? color : "#e5e7eb", border: "none", borderRadius: 10, padding: "11px 22px", color: practicalAnswer.length >= 20 ? "#fff" : "#9ca3af", fontWeight: 800, fontSize: 14, cursor: practicalAnswer.length >= 20 ? "pointer" : "not-allowed", fontFamily: "'Outfit', sans-serif" }}>
                    {evaluating ? "AI evaluează..." : "Trimite Răspuns"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

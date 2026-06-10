import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

export default function Messages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (activeConv) loadMessages(activeConv); }, [activeConv]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadConversations = async () => {
    const { data } = await supabase.from("messages").select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      const convMap = {};
      data.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap[otherId]) convMap[otherId] = { otherId, lastMsg: msg, unread: 0 };
        if (!msg.read && msg.receiver_id === user.id) convMap[otherId].unread++;
      });
      setConversations(Object.values(convMap));
    }
  };

  const loadMessages = async (otherId) => {
    const { data } = await supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    await supabase.from("messages").update({ read: true })
      .eq("receiver_id", user.id).eq("sender_id", otherId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    await supabase.from("messages").insert({ sender_id: user.id, receiver_id: activeConv, content: newMessage.trim() });
    setNewMessage("");
    await loadMessages(activeConv);
    await loadConversations();
    setSending(false);
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("auth.users").select("id, email").eq("email", searchEmail).single();
    if (data) setSearchResult(data);
    else setSearchResult({ notFound: true });
    setSearching(false);
  };

  const startConversation = (otherId) => {
    setActiveConv(otherId);
    setShowNewConv(false);
    setSearchEmail("");
    setSearchResult(null);
  };

  const totalUnread = conversations.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", display: "flex", gap: 0, height: "calc(100vh - 200px)", minHeight: 500, background: "#fff", border: "1px solid #f3f4f6", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>

      {/* Sidebar */}
      <div style={{ width: 280, borderRight: "1px solid #f3f4f6", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            Mesaje {totalUnread > 0 && <span style={{ background: "#f59e0b", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 11, marginLeft: 6 }}>{totalUnread}</span>}
          </div>
          <button onClick={() => setShowNewConv(true)} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#f59e0b", cursor: "pointer" }}>
            + Nou
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              Nicio conversație încă.<br />Apasă "+ Nou" pentru a începe!
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.otherId} onClick={() => setActiveConv(conv.otherId)}
                style={{ padding: "14px 16px", cursor: "pointer", background: activeConv === conv.otherId ? "#fffbeb" : "transparent", borderLeft: activeConv === conv.otherId ? "3px solid #f59e0b" : "3px solid transparent", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {conv.otherId.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>User</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMsg.content}
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <div style={{ background: "#f59e0b", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {showNewConv ? (
          <div style={{ padding: 32 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#111827" }}>Conversație nouă</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Introdu email-ul persoanei cu care vrei să vorbești:
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                placeholder="email@exemplu.com"
                onKeyDown={e => e.key === "Enter" && searchUser()}
                style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none" }} />
              <button onClick={searchUser} disabled={searching}
                style={{ background: "#f59e0b", border: "none", borderRadius: 10, padding: "11px 20px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {searching ? "..." : "Caută"}
              </button>
            </div>
            {searchResult && !searchResult.notFound && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{searchResult.email}</div>
                <button onClick={() => startConversation(searchResult.id)}
                  style={{ background: "#f59e0b", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Trimite mesaj →
                </button>
              </div>
            )}
            {searchResult?.notFound && (
              <div style={{ color: "#f43f5e", fontSize: 13 }}>❌ Utilizatorul nu a fost găsit.</div>
            )}
            <button onClick={() => setShowNewConv(false)} style={{ marginTop: 16, background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 13 }}>
              ← Anulează
            </button>
          </div>
        ) : activeConv ? (
          <>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                U
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Conversație</div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "70%", background: isMe ? "#f59e0b" : "#f9fafb", color: isMe ? "#fff" : "#111827", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", fontSize: 14, lineHeight: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                      {msg.content}
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                        {new Date(msg.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Scrie un mesaj..." style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none" }} />
              <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                style={{ background: newMessage.trim() ? "#f59e0b" : "#e5e7eb", border: "none", borderRadius: 12, padding: "12px 20px", color: newMessage.trim() ? "#fff" : "#9ca3af", fontWeight: 700, cursor: newMessage.trim() ? "pointer" : "not-allowed", fontSize: 14 }}>
                {sending ? "..." : "→"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#9ca3af" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>Alege o conversație</div>
            <div style={{ fontSize: 14 }}>sau apasă "+ Nou" pentru a trimite primul mesaj</div>
          </div>
        )}
      </div>
    </div>
  );
}

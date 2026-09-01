import React, { useState } from "react";
import { BrainCircuit, Send, Sparkles, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function AIPlanningAssistant() {
  const { addToast } = useApp();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recAccepted, setRecAccepted] = useState(false);

  const [chat, setChat] = useState([
    { sender: "assistant", msg: "Hello! I can sequence runs to minimize changeover losses, resolve capacity blockages, or stage alternate lot ingredients. What would you like to plan today?" }
  ]);

  const handleQuery = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setChat(prev => [...prev, { sender: "user", msg: userMsg }]);
    setQuery("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setChat(prev => [
        ...prev,
        { sender: "assistant", msg: `Analyzed capacity load for Line 1. Recommend scheduling SKU-AJ-500ML-ORG before SKU-AJ-1L-ORG. This sequence saves 15 minutes of mechanical swap time.` }
      ]);
      addToast("AI recommendation updated.", "success");
    }, 1500);
  };

  const handleAcceptRec = () => {
    setRecAccepted(true);
    addToast("Proposed run order sequence accepted and saved to schedule draft.", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div>
        {/* Title is partially cut off in screenshot, assuming standard style */}
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 8px 0" }}>
          AI Supply Chain Planning Assistant
        </h1>
        <p style={{ fontSize: "15px", color: "#7a7571", margin: 0 }}>
          Leverage predictive models to sequence production orders and optimize capacity constraints
        </p>
      </div>

      {/* Recommended Action Card */}
      <div style={{ 
        backgroundColor: "#ffffff",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #e8e6e1",
        borderLeft: "6px solid #00c2d1",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        display: "flex", 
        flexDirection: "column", 
        gap: "16px",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Sparkles size={20} color="#00c2d1" strokeWidth={2.5} />
        </div>
        
        <p style={{ fontSize: "15px", color: "#5a5550", margin: 0, lineHeight: 1.6 }}>
          Concentration sweetener levels are low for Tuesday. Recommend alternate Stage Lot staging or delaying Blending Order #ORD-905 by 12 hours.
        </p>

        {!recAccepted ? (
          <button 
            onClick={handleAcceptRec} 
            style={{ 
              display: "flex", 
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "12px",
              background: "linear-gradient(to right, #cf9742, #b87c29)",
              color: "#1a1614",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(207, 151, 66, 0.3)",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <BrainCircuit size={16} strokeWidth={2.5} />
            Accept & Stage Alternative Lot
          </button>
        ) : (
          <div style={{ color: "#10b981", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <Check size={16} /> Alternative lot staging request dispatched to Warehouse.
          </div>
        )}
      </div>

      {/* Chat Area Card */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "400px",
        backgroundColor: "#ffffff",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #e8e6e1",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "24px" }}>
          {chat.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  backgroundColor: isUser ? "#0284c7" : "#f5f3ef",
                  color: isUser ? "#ffffff" : "#302b28",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  maxWidth: "85%",
                  fontSize: "14.5px",
                  lineHeight: 1.6
                }}
              >
                {msg.msg}
              </div>
            );
          })}
          {loading && (
            <div style={{ alignSelf: "flex-start", color: "#a19b95", fontSize: "14px", fontStyle: "italic", padding: "0 20px" }}>
              AI is analyzing capacity models...
            </div>
          )}
        </div>

        <form onSubmit={handleQuery} style={{ display: "flex", gap: "12px", borderTop: "1px solid #e8e6e1", paddingTop: "24px" }}>
          <input
            type="text"
            placeholder="Ask AI Planning Assistant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              flex: 1,
              padding: "14px 20px",
              backgroundColor: "#f9f8f6",
              border: "1px solid #e8e6e1",
              borderRadius: "12px",
              fontSize: "15px",
              color: "#2d2825",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = '#cf9742'}
            onBlur={(e) => e.target.style.borderColor = '#e8e6e1'}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "50px",
              height: "50px",
              background: "linear-gradient(to right, #cf9742, #b87c29)",
              color: "#1a1614",
              border: "none",
              borderRadius: "12px",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.opacity = '1')}
          >
            <Send size={20} strokeWidth={2.5} style={{ marginLeft: "4px" }} />
          </button>
        </form>
      </div>
    </div>
  );
}

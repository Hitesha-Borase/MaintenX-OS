import React, { useState } from "react";
import { BrainCircuit, Send, Sparkles, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          AI Supply Chain Planning Assistant
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Leverage predictive models to sequence production orders and optimize capacity constraints
        </p>
      </div>

      {/* Recommended Action */}
      <Card style={{ borderLeft: "4px solid #06B6D4", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={16} color="#06B6D4" /> Feasibility Sequence Optimization
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Concentration sweetener levels are low for Tuesday. Recommend alternate Stage Lot staging or delaying Blending Order #ORD-905 by 12 hours.
        </p>

        {!recAccepted ? (
          <Button variant="primary" size="sm" icon={BrainCircuit} onClick={handleAcceptRec} style={{ width: "fit-content" }}>
            Accept & Stage Alternative Lot
          </Button>
        ) : (
          <div style={{ color: "#10B981", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            <Check size={14} /> Alternative lot staging request dispatched to Warehouse.
          </div>
        )}
      </Card>

      {/* Chat Area */}
      <Card style={{ display: "flex", flexDirection: "column", gap: "14px", height: "350px" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
          {chat.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  backgroundColor: isUser ? "#0284C7" : "var(--bg-card-subtle)",
                  color: isUser ? "#FFFFFF" : "var(--text-primary)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: isUser ? "none" : "1px solid var(--border-subtle)",
                  maxWidth: "80%",
                  fontSize: "13px",
                  lineHeight: 1.5
                }}
              >
                {msg.msg}
              </div>
            );
          })}
          {loading && (
            <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic" }}>
              AI is analyzing capacity models...
            </div>
          )}
        </div>

        <form onSubmit={handleQuery} style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
          <input
            type="text"
            placeholder="Ask AI Planning Assistant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
            required
          />
          <Button type="submit" variant="primary" icon={Send} disabled={loading} />
        </form>
      </Card>
    </div>
  );
}

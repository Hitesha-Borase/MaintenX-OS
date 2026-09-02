import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import {
  BrainCircuit,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCw,
  Layers
} from "lucide-react";

export function AIPlanningAssistant() {
  const { schedules = [], mrpCalculations = [] } = usePlanning();
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedRecs, setAcceptedRecs] = useState({});

  const [chat, setChat] = useState([
    {
      sender: "assistant",
      msg: "Hello! I am your AI Supply & Production Planning Copilot. I analyze real-time BOM explosions, line run rates, and changeover matrices to optimize manufacturing flow. What would you like to solve today?"
    }
  ]);

  const quickPrompts = [
    "How can we eliminate Line 1 changeover losses?",
    "What is the fastest way to resolve the 28mm HDPE cap shortage?",
    "Simulate shifting Kroger order PO-KR-99321 to next Tuesday."
  ];

  const handleSendPrompt = (promptText) => {
    const textToSend = promptText || query;
    if (!textToSend.trim()) return;

    setChat((prev) => [...prev, { sender: "user", msg: textToSend }]);
    setQuery("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      let reply = "";
      if (textToSend.toLowerCase().includes("changeover") || textToSend.toLowerCase().includes("line 1")) {
        reply = "Analysis of Line 1: Sequencing '500ml Sparkling Citrus Soda' directly before '1L Tonic Water' merges clean-in-place CIP-04 washout cycles, saving 45 minutes of mechanical swap time and 1,200 Liters of sanitization fluids.";
      } else if (textToSend.toLowerCase().includes("shortage") || textToSend.toLowerCase().includes("cap")) {
        reply = "MRP Shortage Alert: 28mm HDPE Caps (PKG-2001) has a net deficit of 10,240 units. Authorizing an expedited LTL delivery from secondary vendor 'Crown Packaging' will arrive by Thursday 08:00, preventing a 12-hour Line 1 stoppage.";
      } else {
        reply = `Evaluated schedule simulation for "${textToSend}". Moving the run reduces peak Wednesday line capacity load from 98% to a balanced 84%, providing a safe 4-hour maintenance window for filler head lubrication.`;
      }

      setChat((prev) => [...prev, { sender: "assistant", msg: reply }]);
      addToast("AI Planning recommendation generated.", "success");
    }, 1200);
  };

  const handleAcceptRecommendation = (id, actionLabel) => {
    setAcceptedRecs((prev) => ({ ...prev, [id]: true }));
    addToast(`${actionLabel} accepted and applied to APS planning draft!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              AI Supply Chain & Planning Copilot
            </h1>
            <Badge variant="cyan">HEURISTIC OPTIMIZER ACTIVE</Badge>
          </div>
        </div>
      </div>

      {/* Featured AI Recommendation Card */}
      <Card style={{ borderLeft: "4px solid #06B6D4", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={20} color="#06B6D4" />
          <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Active AI Recommendation: Line 1 Changeover Grouping
          </h3>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          "Sequencing 500ml Sparkling Citrus Soda (SKU-5001) prior to 1L Tonic Water (SKU-5002) avoids a deep allergen CIP-04 flush, saving <strong>45 minutes</strong> of line downtime and ensuring on-time delivery for Kroger order PO-KR-99321."
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <Button
            variant={acceptedRecs["rec-1"] ? "secondary" : "primary"}
            size="sm"
            icon={acceptedRecs["rec-1"] ? CheckCircle2 : BrainCircuit}
            onClick={() => handleAcceptRecommendation("rec-1", "Sequence Optimization")}
            disabled={acceptedRecs["rec-1"]}
            style={{ fontSize: "12px" }}
          >
            {acceptedRecs["rec-1"] ? "Recommendation Applied" : "Accept & Apply Optimization"}
          </Button>
        </div>
      </Card>

      {/* Interactive Chat Console Card */}
      <Card style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "420px" }}>
        {/* Quick prompt suggestions */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "var(--bg-card-subtle)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C89547")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "360px", paddingRight: "6px" }}>
          {chat.map((m, idx) => {
            const isAI = m.sender === "assistant";

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isAI ? "flex-start" : "flex-end"
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: isAI ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                    backgroundColor: isAI ? "rgba(200, 149, 71, 0.08)" : "#C89547",
                    color: isAI ? "var(--text-primary)" : "#261603",
                    border: isAI ? "1px solid rgba(200, 149, 71, 0.2)" : "none",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    fontWeight: isAI ? 500 : 700
                  }}
                >
                  {m.msg}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 16px", borderRadius: "12px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", color: "var(--text-muted)" }}>
                Copilot is computing heuristics...
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          <input
            type="text"
            placeholder="Ask planning copilot (e.g., 'What is our Line 1 capacity bottleneck?')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input"
            style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          />
          <Button variant="primary" type="submit" icon={Send} disabled={loading || !query.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}

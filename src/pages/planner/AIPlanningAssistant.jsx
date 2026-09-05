import React, { useState, useRef, useEffect } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { useMasterData } from "../../context/MasterDataContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import {
  BrainCircuit,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";

export function AIPlanningAssistant() {
  const { schedules = [], mrpCalculations = [] } = usePlanning();
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedRecs, setAcceptedRecs] = useState({});
  const [showSimDetails, setShowSimDetails] = useState(false);
  const chatBottomRef = useRef(null);

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

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const handleSendPrompt = (promptText) => {
    const textToSend = promptText || query;
    if (!textToSend.trim()) return;

    setChat((prev) => [...prev, { sender: "user", msg: textToSend }]);
    setQuery("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      let reply = "";
      const lower = textToSend.toLowerCase();
      if (lower.includes("changeover") || lower.includes("line 1")) {
        reply = "Analysis of Line 1: Sequencing '500ml Sparkling Citrus Soda' directly before '1L Tonic Water' merges clean-in-place CIP-04 washout cycles, saving 45 minutes of mechanical swap time and 1,200 Liters of sanitization fluids.";
      } else if (lower.includes("shortage") || lower.includes("cap")) {
        reply = "MRP Shortage Alert: 28mm HDPE Caps (PKG-2001) has a net deficit of 10,240 units. Authorizing an expedited LTL delivery from secondary vendor 'Crown Packaging' will arrive by Thursday 08:00, preventing a 12-hour Line 1 stoppage.";
      } else if (lower.includes("kroger") || lower.includes("shift") || lower.includes("tuesday")) {
        reply = "Simulation complete for Kroger order PO-KR-99321: Shifting the 25,000 unit run to Tuesday Shift B drops peak Line 1 capacity load from 98% to a balanced 84%, providing a safe 4-hour maintenance window for filler lubrication without breaching customer SLA.";
      } else {
        reply = `Evaluated schedule simulation for "${textToSend}". Live APS model calculated zero critical path violations. Work center Line 1 OEE projection improved by +1.4% with optimal sequencing.`;
      }

      setChat((prev) => [...prev, { sender: "assistant", msg: reply }]);
      addToast("AI Planning recommendation generated.", "success");
    }, 900);
  };

  const handleAcceptRecommendation = (id, actionLabel) => {
    setAcceptedRecs((prev) => ({ ...prev, [id]: true }));
    addToast(`${actionLabel} accepted and applied to APS planning draft!`, "success");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        minWidth: 0,
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1
            style={{
              fontSize: "clamp(18px, 4.5vw, 24px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
              margin: 0
            }}
          >
            AI Supply Chain & Planning Copilot
          </h1>
          <Badge variant="cyan" style={{ fontSize: "11px", fontWeight: 700 }}>
            HEURISTIC OPTIMIZER ACTIVE
          </Badge>
        </div>
      </div>

      {/* Featured AI Recommendation Card */}
      <Card
        style={{
          borderLeft: "4px solid #06B6D4",
          padding: "clamp(14px, 3vw, 20px)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "var(--bg-card)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#06B6D4" style={{ flexShrink: 0 }} />
            <h3
              style={{
                fontSize: "clamp(13px, 3.5vw, 15px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0
              }}
            >
              Active AI Recommendation: Line 1 Changeover Grouping
            </h3>
          </div>
          <Badge variant={acceptedRecs["rec-1"] ? "emerald" : "amber"}>
            {acceptedRecs["rec-1"] ? "APPLIED" : "READY TO APPLY"}
          </Badge>
        </div>

        <p
          style={{
            fontSize: "clamp(12px, 3.2vw, 13px)",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.6
          }}
        >
          "Sequencing 500ml Sparkling Citrus Soda (SKU-5001) prior to 1L Tonic Water (SKU-5002) avoids a deep allergen CIP-04 flush, saving <strong style={{ color: "var(--text-primary)" }}>45 minutes</strong> of line downtime and ensuring on-time delivery for Kroger order PO-KR-99321."
        </p>

        {/* Buttons Row - Wrap cleanly on mobile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "4px"
          }}
        >
          <button
            type="button"
            onClick={() => handleAcceptRecommendation("rec-1", "Line 1 Sequence Optimization")}
            disabled={acceptedRecs["rec-1"]}
            className={acceptedRecs["rec-1"] ? "btn btn-secondary" : "btn btn-primary"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "42px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 700,
              flex: "1 1 auto",
              cursor: acceptedRecs["rec-1"] ? "default" : "pointer"
            }}
          >
            {acceptedRecs["rec-1"] ? (
              <>
                <CheckCircle2 size={16} color="#059669" />
                <span>Recommendation Applied</span>
              </>
            ) : (
              <>
                <BrainCircuit size={16} />
                <span>Accept & Apply Optimization</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSimDetails(!showSimDetails)}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              minHeight: "42px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              flex: "0 1 auto"
            }}
          >
            <Info size={15} />
            <span>{showSimDetails ? "Hide Impact" : "Simulate Impact"}</span>
            {showSimDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Simulation Details */}
        {showSimDetails && (
          <div
            style={{
              marginTop: "8px",
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-card-subtle)",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
              fontSize: "12px"
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Downtime Saved:</span>
              <strong style={{ color: "#059669", fontSize: "14px" }}>+45 Minutes</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Chemical / CIP Savings:</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>1,200 Liters Wash</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block" }}>Kroger PO SLA:</span>
              <strong style={{ color: "#059669", fontSize: "14px" }}>100% On-Time</strong>
            </div>
          </div>
        )}
      </Card>

      {/* Interactive Chat Console Card */}
      <Card
        style={{
          padding: "clamp(14px, 3vw, 20px)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          minHeight: "460px",
          boxSizing: "border-box"
        }}
      >
        {/* Quick prompt suggestions (Chips) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Suggested Inquiries (Tap to ask):
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(p)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "var(--bg-card-subtle)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  textAlign: "left",
                  lineHeight: 1.4,
                  transition: "all 0.15s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  flex: "1 1 auto",
                  maxWidth: "100%"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary-color, #C89547)";
                  e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)";
                }}
              >
                <span>💡</span>
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat message history container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            minHeight: "220px",
            maxHeight: "360px",
            padding: "4px 4px 10px 0",
            boxSizing: "border-box"
          }}
        >
          {chat.map((m, idx) => {
            const isAI = m.sender === "assistant";

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isAI ? "flex-start" : "flex-end",
                  width: "100%"
                }}
              >
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "12px 14px",
                    borderRadius: isAI ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                    backgroundColor: isAI ? "rgba(200, 149, 71, 0.08)" : "#C89547",
                    color: isAI ? "var(--text-primary)" : "#261603",
                    border: isAI ? "1px solid rgba(200, 149, 71, 0.25)" : "none",
                    fontSize: "clamp(12px, 3.2vw, 13px)",
                    lineHeight: 1.5,
                    fontWeight: isAI ? 500 : 700,
                    wordBreak: "break-word"
                  }}
                >
                  {isAI && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "11px", fontWeight: 700, color: "#92601D" }}>
                      <Sparkles size={12} />
                      <span>Copilot Intelligence</span>
                    </div>
                  )}
                  {m.msg}
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-card-subtle)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <RotateCw size={14} className="animate-spin" />
                <span>Copilot is analyzing production heuristics...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input form - fully mobile responsive with tap friendly targets */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "auto",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <input
            type="text"
            placeholder="Ask copilot (e.g., 'Check Line 1 bottleneck')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input"
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              height: "44px",
              fontSize: "14px",
              padding: "0 14px",
              minWidth: 0,
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)"
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary"
            style={{
              height: "44px",
              padding: "0 18px",
              minWidth: "44px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontWeight: 700,
              flexShrink: 0,
              margin: 0,
              borderRadius: "8px"
            }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </Card>
    </div>
  );
}

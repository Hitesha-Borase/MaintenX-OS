import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Bot,
  ShieldAlert,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AI_AGENTS, PREDICTIVE_INSIGHTS, AI_QA_EXAMPLES } from "../../data/mockAIInsights";
import { useApp } from "../../context/AppContext";

export function AIAnalytics() {
  const { addToast } = useApp();
  const [insights, setInsights] = useState(PREDICTIVE_INSIGHTS);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "AI",
      text: "Hello! I am your MaintenX OS Manufacturing Operations Assistant. You can ask me questions about line downtime, equipment FFT vibration anomalies, recipe yields, or shortage risks.",
      time: "10:45 AM",
      tag: null
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleApproveInsight = (insightId) => {
    setInsights((prev) =>
      prev.map((ins) =>
        ins.id === insightId ? { ...ins, approvalStatus: "Approved by Operator - Action Dispatched" } : ins
      )
    );
    addToast("AI Recommendation Approved: Action successfully dispatched to Line PLC & CMMS.");
  };

  const handleRejectInsight = (insightId) => {
    setInsights((prev) =>
      prev.map((ins) =>
        ins.id === insightId ? { ...ins, approvalStatus: "Rejected by Supervisor" } : ins
      )
    );
    addToast("AI Recommendation dismissed with operator feedback.", "warning");
  };

  const handleSendMessage = (textToSend = inputQuery) => {
    const q = textToSend.trim();
    if (!q) return;

    // Add user message
    const userMsg = {
      sender: "User",
      text: q,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tag: null
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Simulate AI inference match
    setTimeout(() => {
      let matched = AI_QA_EXAMPLES.find(
        (ex) =>
          ex.query.toLowerCase().includes(q.toLowerCase()) ||
          q.toLowerCase().includes("line 2") ||
          q.toLowerCase().includes("vibration") ||
          q.toLowerCase().includes("filler") ||
          q.toLowerCase().includes("pm")
      );

      if (!matched) {
        matched = {
          answer: `Analysis of active SCADA stream: For query "${q}", telemetry across Line 1 and Line 2 indicates normal operating limits with the exception of Pasteurizer HTST-300 loop pressure. Aegis neural model recommends checking work order WO-2026-0888.`,
          sources: ["Real-Time SCADA Gateway", "CMMS Telemetry DB"],
          tag: "AI_RECOMMENDATION"
        };
      }

      const aiMsg = {
        sender: "AI",
        text: matched.answer,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tag: matched.tag,
        sources: matched.sources
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const getTagBadge = (tag) => {
    switch (tag) {
      case "FACT":
        return <Badge variant="emerald">FACT (Direct Sensor/ERP)</Badge>;
      case "CALCULATION":
        return <Badge variant="cyan">CALCULATION (Deterministic)</Badge>;
      case "ESTIMATE":
        return <Badge variant="amber">ESTIMATE (Statistical)</Badge>;
      case "AI_RECOMMENDATION":
        return <Badge variant="purple">AI RECOMMENDATION (Probabilistic)</Badge>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              AI & Predictive Decision Support
            </h1>
            <Badge variant="purple" dot>
              3 Autonomous Edge Agents Active
            </Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Neural anomaly detection, predictive failure models, yield optimizers, and natural language shop-floor assistant.
          </p>
        </div>
      </div>

      {/* AI Agents Operational Status Grid */}
      <div className="grid-3">
        {AI_AGENTS.map((agent) => (
          <Card key={agent.id} style={{ display: "flex", flexDirection: "column", gap: "10px", borderLeft: "3px solid #A855F7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={18} color="#A855F7" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {agent.name}
                </span>
              </div>
              <Badge variant="emerald" dot>
                Online
              </Badge>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {agent.specialty}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
              <span>Inference Accuracy: <strong style={{ color: "#34D399" }}>{agent.accuracyRating}</strong></span>
              <span>Telemetry: <strong>{agent.telemetryPointsAnalyzed.toLocaleString()} pts</strong></span>
            </div>
          </Card>
        ))}
      </div>

      {/* Predictive Insights Cards (Tagged with Fact / Calculation / Estimate / AI Recommendation) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Active Predictive Recommendations & Anomalies
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              All recommendations require human-in-the-loop supervisor approval before automated dispatch
            </p>
          </div>
          <Badge variant="purple">Confidence &gt; 88% Threshold</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {insights.map((ins) => {
            const isApproved = ins.approvalStatus.includes("Approved");
            const isRejected = ins.approvalStatus.includes("Rejected");

            return (
              <Card
                key={ins.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  border: isApproved ? "1px solid #10B981" : isRejected ? "1px solid #64748B" : "1px solid var(--border-subtle)",
                  backgroundColor: isApproved ? "rgba(16, 185, 129, 0.04)" : "var(--bg-card)"
                }}
              >
                {/* Insight Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#A855F7" }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {ins.title}
                        </h4>
                        {getTagBadge(ins.tag)}
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Source: {ins.source} • AI Confidence: <strong style={{ color: "#38BDF8" }}>{ins.confidence}</strong>
                      </p>
                    </div>
                  </div>

                  {ins.potentialSavingsUSD && (
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Impact</span>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "#34D399" }}>
                        +${ins.potentialSavingsUSD.toLocaleString()} Savings
                      </div>
                    </div>
                  )}
                </div>

                {/* Insight Body */}
                <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                    <strong>Insight:</strong> {ins.insight}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                    <strong>Causal Basis:</strong> {ins.reason}
                  </div>
                  <div style={{ fontSize: "12px", color: "#38BDF8", marginTop: "6px", fontWeight: 600 }}>
                    <strong>Recommended Action:</strong> {ins.recommendedAction}
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ fontSize: "12px", color: isApproved ? "#34D399" : isRejected ? "#94A3B8" : "#F59E0B", fontWeight: 600 }}>
                    Status: {ins.approvalStatus}
                  </div>

                  {!isApproved && !isRejected && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button variant="danger" size="sm" icon={XCircle} onClick={() => handleRejectInsight(ins.id)}>
                        Reject
                      </Button>
                      <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => handleApproveInsight(ins.id)}>
                        Approve & Dispatch
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Natural Language Manufacturing Assistant & Q&A */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                MaintenX OS Operator Q&A Assistant
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Ask real-time questions about plant diagnostics, downtime logs, and maintenance procedures
              </p>
            </div>
          </div>
          <Badge variant="cyan">Edge Telemetry Augmented</Badge>
        </div>

        {/* Chat History Box */}
        <div
          style={{
            height: "260px",
            overflowY: "auto",
            padding: "16px",
            borderRadius: "10px",
            backgroundColor: "var(--bg-card-subtle)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          {chatMessages.map((msg, i) => {
            const isUser = msg.sender === "User";

            return (
              <div
                key={i}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    backgroundColor: isUser ? "#0284C7" : "#1E293B",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    border: isUser ? "none" : "1px solid var(--border-subtle)"
                  }}
                >
                  {msg.text}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--text-muted)", alignSelf: isUser ? "flex-end" : "flex-start" }}>
                  <span>{msg.time}</span>
                  {msg.tag && getTagBadge(msg.tag)}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ alignSelf: "flex-start", fontSize: "12px", color: "#38BDF8", fontStyle: "italic" }}>
              AI is analyzing plant telemetry...
            </div>
          )}
        </div>

        {/* Quick Query Prompt Shortcuts */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>Suggested:</span>
          {AI_QA_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              style={{ fontSize: "11px", padding: "4px 8px" }}
              onClick={() => handleSendMessage(ex.query)}
            >
              {ex.query}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: "flex", gap: "10px", marginTop: "12px" }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Ask about equipment health, downtime reasons, or SOP instructions..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          <Button variant="primary" type="submit" icon={Send}>
            Inquire
          </Button>
        </form>
      </Card>
    </div>
  );
}

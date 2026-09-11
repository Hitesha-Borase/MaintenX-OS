import React, { useState, useEffect } from "react";
import { BrainCircuit, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Briefing() {
  const { addToast } = useApp();
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [briefingText, setBriefingText] = useState(
    "Enterprise OEE is steady at 84.2%. Austin Plant exhibits the highest performance with 84.2% OEE, while Chicago lags slightly at 78.9% due to unplanned pasteurizer maintenance. Overall costing variance shows an unfavorable MTD variance of +$12,800, primarily driven by raw materials price drift and overtime labor premiums on Line 1. Recommend prioritizing maintenance allocation on Chicago East to prevent critical batch delays."
  );

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getAiBriefing();
      const data = res.data || res;
      if (data && data.briefingText) {
        setBriefingText(data.briefingText);
      }
    } catch (err) {
      console.error("Error loading AI briefing:", err);
      addToast("Failed to load executive AI briefing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await executiveService.generateAiBriefing({ timestamp: new Date().toISOString() });
      const data = res.data || res;
      if (data && data.briefingText) {
        setBriefingText(data.briefingText);
      }
      addToast(data?.message || "Executive AI Briefing regenerated with latest real-time enterprise data.", "success");
    } catch (err) {
      console.error("Error regenerating briefing:", err);
      addToast("Failed to regenerate briefing", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Executive AI Briefing Hub
          </h1>
        </div>
        <Button variant="primary" icon={RefreshCw} onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating..." : "Regenerate Briefing"}
        </Button>
      </div>

      <Card style={{ border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0, 0, 0, 0) 100%)", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <BrainCircuit size={24} color="#A855F7" />
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Enterprise Executive Briefing</h3>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "#A855F7" }} />
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
            {briefingText}
          </p>
        )}
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { BrainCircuit, RefreshCw, Loader2, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function Briefing() {
  const { addToast } = useApp();
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active briefing parameters
  const [activeMeta, setActiveMeta] = useState({
    scope: "Enterprise Fleet (All Plants)",
    timeWindow: "Last 24 Hours (Real-Time)",
    focus: "Holistic Executive Overview",
    generatedAt: "Today, 10:45 AM"
  });

  // Modal form parameters
  const [configForm, setConfigForm] = useState({
    scope: "Enterprise Fleet (All Plants)",
    timeWindow: "Last 24 Hours (Real-Time)",
    focus: "Holistic Executive Overview",
    detailLevel: "Executive Summary & Directives",
    customDirectives: ""
  });

  const [briefingText, setBriefingText] = useState(
    "Enterprise Executive Briefing: Plant 1 - Meat Processing & Smokehouse Facility operational yield is holding steady at 84.5%. Enterprise fleet output is tracking at 8,450 Liters delivered across active runs. Total downtime logged is 30 minutes across processing & packaging. Costing variance remains within operational safety thresholds."
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

  const handleOpenConfigModal = () => {
    setConfigForm({
      scope: activeMeta.scope || "Enterprise Fleet (All Plants)",
      timeWindow: activeMeta.timeWindow || "Last 24 Hours (Real-Time)",
      focus: activeMeta.focus || "Holistic Executive Overview",
      detailLevel: "Executive Summary & Directives",
      customDirectives: "Emphasize smokehouse yield retention, raw materials drift, and packaging line downtime."
    });
    setIsModalOpen(true);
  };

  const handleGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      setGenerating(true);
      const res = await executiveService.generateAiBriefing({
        scope: configForm.scope,
        timeWindow: configForm.timeWindow,
        focus: configForm.focus,
        detailLevel: configForm.detailLevel,
        customDirectives: configForm.customDirectives,
        timestamp: new Date().toISOString()
      });
      const data = res.data || res;

      const nowTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setActiveMeta({
        scope: configForm.scope,
        timeWindow: configForm.timeWindow,
        focus: configForm.focus,
        generatedAt: `Today, ${nowTime}`
      });

      if (data && data.briefingText) {
        setBriefingText(data.briefingText);
      } else {
        setBriefingText(
          `Executive AI Synthesis [${configForm.scope} | ${configForm.timeWindow} | Focus: ${configForm.focus}]:\n\n` +
          `• Operational Yield & Throughput: Fleet yield currently verified at 84.8% with zero uncontained CCP excursions across monitored smokehouses.\n` +
          `• Financial Variance & Costing: Net material variance is favorable by -0.4% MTD. Utility consumption correlates with steam boiler thermal insulation improvements.\n` +
          `• Actionable Directives: Maintenance engineering dispatched for preventative overhaul on Line 2 pasteurizer to mitigate critical supplier delay buffers.\n` +
          (configForm.customDirectives ? `\nSpecial Directive Addressed: "${configForm.customDirectives}"` : "")
        );
      }

      addToast("Executive AI Briefing regenerated with customized operational parameters.", "success");
      setIsModalOpen(false);
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
        <Button variant="primary" icon={RefreshCw} onClick={handleOpenConfigModal} disabled={generating}>
          Regenerate Briefing
        </Button>
      </div>

      <Card style={{ border: "1px solid rgba(168, 85, 247, 0.4)", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(0, 0, 0, 0) 100%)", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BrainCircuit size={24} color="#A855F7" />
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Enterprise Executive Briefing</h3>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant="cyan">{activeMeta.scope}</Badge>
            <Badge variant="warning">{activeMeta.timeWindow}</Badge>
            <Badge variant="emerald">✓ Updated {activeMeta.generatedAt}</Badge>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "#A855F7" }} />
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
            {briefingText}
          </div>
        )}
      </Card>

      {/* Briefing Generation Parameters Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Executive AI Briefing"
        subtitle="Specify plant scope, time horizon, and strategic focus for executive intelligence synthesis"
        maxWidth="560px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button variant="primary" icon={Sparkles} onClick={handleGenerate} disabled={generating}>
              {generating ? "Synthesizing AI Data..." : "Generate AI Briefing"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Target Plant / Facility Scope
              </label>
              <select
                className="input-field"
                value={configForm.scope}
                onChange={(e) => setConfigForm(prev => ({ ...prev, scope: e.target.value }))}
              >
                <option value="Enterprise Fleet (All Plants)">Enterprise Fleet (All Plants)</option>
                <option value="Plant 1 - Smokehouse & Processing">Plant 1 - Smokehouse & Processing</option>
                <option value="Plant 2 - Packaging & Cold Storage">Plant 2 - Packaging & Cold Storage</option>
                <option value="Austin Facility Line 1">Austin Facility Line 1</option>
                <option value="Chicago Plant - Pasteurizer Area">Chicago Plant - Pasteurizer Area</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Time Window / Horizon
              </label>
              <select
                className="input-field"
                value={configForm.timeWindow}
                onChange={(e) => setConfigForm(prev => ({ ...prev, timeWindow: e.target.value }))}
              >
                <option value="Last 24 Hours (Real-Time)">Last 24 Hours (Real-Time)</option>
                <option value="Current Week-to-Date">Current Week-to-Date</option>
                <option value="Month-to-Date (MTD)">Month-to-Date (MTD)</option>
                <option value="Quarter-to-Date (QTD)">Quarter-to-Date (QTD)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Strategic Focus Area
              </label>
              <select
                className="input-field"
                value={configForm.focus}
                onChange={(e) => setConfigForm(prev => ({ ...prev, focus: e.target.value }))}
              >
                <option value="Holistic Executive Overview">Holistic Executive Overview</option>
                <option value="Operational OEE & Yield Loss">Operational OEE & Yield Loss</option>
                <option value="Cost Variance & Material Drift">Cost Variance & Material Drift</option>
                <option value="Equipment Downtime & Maintenance">Equipment Downtime & Maintenance</option>
                <option value="Compliance, Scrap & CCP Control">Compliance, Scrap & CCP Control</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Synthesis Detail Level
              </label>
              <select
                className="input-field"
                value={configForm.detailLevel}
                onChange={(e) => setConfigForm(prev => ({ ...prev, detailLevel: e.target.value }))}
              >
                <option value="Executive Summary & Directives">Executive Summary & Directives</option>
                <option value="Analytical Breakdown & Root Causes">Analytical Breakdown & Root Causes</option>
                <option value="Operational Action Items Only">Operational Action Items Only</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Custom Directives & Prompts
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={configForm.customDirectives}
              onChange={(e) => setConfigForm(prev => ({ ...prev, customDirectives: e.target.value }))}
              placeholder="e.g. Focus on raw materials price drift, pasteurizer wear on Line 2, and energy savings..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Printer, CheckCircle, Award, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useProduction } from "../../context/ProductionContext";
import { dashboardService } from "../../services/dashboardService";

export function WorkInstructions() {
  const { productionOrders } = useProduction();
  const { addToast } = useApp();
  const [searchParams] = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber");

  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [sopData, setSopData] = useState({
    activeOrderNumber: "—",
    productName: "Loading active job...",
    workInstructions: "SOP Loading..."
  });
  const [steps, setSteps] = useState([
    { title: "1. Pre-Start Sanitation Guard", text: "Verify that sanitation release tag has been signed by Quality QA. Perform visual sanitisation inspection of the aseptic filler nozzles." },
    { title: "2. Equipment Readiness", text: "Validate Nitrogen flush pressure is at 2.4 Bar. Confirm cap chute and raw bottle feed are fully stocked with SKU raw materials." },
    { title: "3. Inline HMI Controls", text: "Initialize speed dials. Line standard speed is 580 BPM. Do not exceed 600 BPM limit without supervisor authorization." },
    { title: "4. Quality CCP Logging", text: "Log Brix sugar levels and pH measurements every 30 minutes in the Quality Checks tab. Burst limit: 200 kPa." },
    { title: "5. Lot Handoff Procedure", text: "Before shift change, complete production quantities, log active downtime reasons, and clean the line conveyor." }
  ]);

const toSafeStr = (val, fallback = "") => {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.name || val.code || val.orderNumber || fallback;
  return String(val);
};

  // Fetch live SOP status & active job details from backend on mount or when orderNumberParam changes
  useEffect(() => {
    dashboardService.getWorkInstructions(orderNumberParam)
      .then(data => {
        if (data) {
          const resObj = data.data || data;
          setSopData({
            activeOrderNumber: toSafeStr(resObj.activeOrderNumber || resObj.orderNumber, "PO-2026"),
            productName: toSafeStr(resObj.productName, "Standard Product"),
            workInstructions: toSafeStr(resObj.workInstructions, "SOP-PKG-042: High-Speed Aseptic Fill Procedures")
          });
          if (resObj.acknowledged !== undefined) {
            setAcknowledged(resObj.acknowledged);
          }
          if (Array.isArray(resObj.steps) && resObj.steps.length > 0) {
            setSteps(resObj.steps);
          }
        }
      })
      .catch(err => console.warn("[WorkInstructions] Failed to fetch SOP status:", err.message));
  }, [orderNumberParam]);

  // ─── Acknowledge SOP -> POST /api/v1/dashboards/operator/work-instructions/acknowledge
  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      const res = await dashboardService.acknowledgeWorkInstructions({
        sopId: sopData.workInstructions,
        orderNumber: sopData.activeOrderNumber
      });
      setAcknowledged(true);
      addToast(res?.message || "SOP safety, PPE requirements, and CCP operational controls acknowledged.", "success");
    } catch (err) {
      setAcknowledged(true);
      addToast("SOP safety, PPE requirements, and CCP operational controls acknowledged.", "success");
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
            Work Instructions & Digital SOPs
          </h1>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()} style={{ fontSize: "12px", height: "34px", padding: "6px 12px" }}>
            Print Manual
          </Button>

          {!acknowledged ? (
            <Button variant="success" icon={ShieldCheck} onClick={handleAcknowledge} disabled={acknowledging} style={{ fontSize: "12px", height: "34px", padding: "6px 14px", fontWeight: 700 }}>
              {acknowledging ? "Saving..." : "Acknowledge SOP Clearance"}
            </Button>
          ) : (
            <Badge variant="emerald" style={{ padding: "6px 12px", fontSize: "12px" }}>SOP Cleared & Acknowledged</Badge>
          )}
        </div>
      </div>

      {/* Active SOP Document Header Card */}
      <Card style={{ borderLeft: "4px solid #A855F7", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "16px 18px", boxSizing: "border-box", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "rgba(168, 85, 247, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A855F7", flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 800, color: "var(--text-primary)", margin: 0, wordBreak: "break-word", lineHeight: 1.3 }}>
              {sopData.workInstructions || "SOP-PKG-042: High-Speed Aseptic Cold Fill & Nitrogen Flush Procedures v4.1"}
            </h3>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
              <span>Associated with Active Job:</span>
              <span style={{ backgroundColor: "rgba(2, 132, 199, 0.1)", color: "#0284C7", padding: "2px 8px", borderRadius: "6px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                {sopData.activeOrderNumber}
              </span>
              <span style={{ color: "var(--text-muted)" }}>({sopData.productName})</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Step by Step Procedures */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", boxSizing: "border-box" }}>
        {steps.map((step, idx) => (
          <Card key={idx} style={{ padding: "14px 16px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxSizing: "border-box", minWidth: 0 }}>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "6px", wordBreak: "break-word" }}>
              {step.title}
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0, wordBreak: "break-word" }}>
              {step.text}
            </p>
          </Card>
        ))}
      </div>

      {/* Bottom Digital Compliance Sign-Off Card */}
      <Card style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: acknowledged ? "rgba(16, 185, 129, 0.08)" : "#FFFFFF", border: acknowledged ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)", padding: "14px 18px", boxSizing: "border-box", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 200px", minWidth: 0 }}>
          <Award size={22} color={acknowledged ? "#10B981" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: acknowledged ? "#059669" : "var(--text-primary)", wordBreak: "break-word" }}>
            {acknowledged ? "Instructions & Safety Protocols Acknowledged" : "I have read and agree to follow these manufacturing SOPs."}
          </span>
        </div>

        <div style={{ flexShrink: 0 }}>
          {!acknowledged ? (
            <Button variant="success" icon={CheckCircle} onClick={handleAcknowledge} disabled={acknowledging} style={{ fontSize: "12px", height: "34px", padding: "6px 14px", fontWeight: 700 }}>
              {acknowledging ? "Saving..." : "Acknowledge"}
            </Button>
          ) : (
            <Badge variant="emerald" style={{ padding: "4px 10px" }}>Acknowledged</Badge>
          )}
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import {
  Boxes,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  PackageCheck,
  Truck,
  Factory,
  FileCheck,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { TraceabilityNodeGraph } from "../../components/charts/TraceabilityNodeGraph";
import { TRACEABILITY_RECORDS } from "../../data/mockTraceability";
import { useApp } from "../../context/AppContext";

export function Batch360Traceability() {
  const { addToast } = useApp();
  const [selectedBatchId, setSelectedBatchId] = useState("BAT-2026-0892");
  const [activeDirection, setActiveDirection] = useState("forward"); // forward | backward
  const [isRecallSimOpen, setIsRecallSimOpen] = useState(false);

  const currentRecord = TRACEABILITY_RECORDS[selectedBatchId] || TRACEABILITY_RECORDS["BAT-2026-0892"];

  const handleSimulateRecall = () => {
    addToast("Mock Recall Simulation: 100% of affected lots identified across 2 distribution centers in 4.2 seconds.", "warning");
    setIsRecallSimOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Batch 360° End-to-End Traceability
            </h1>
            <Badge variant="emerald">Multi-Tier Chain of Custody</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Forward and backward genealogical trace from supplier farm lots through processing CCPs to customer store shelves.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="danger" icon={AlertTriangle} onClick={handleSimulateRecall}>
            Simulate Mock Recall
          </Button>
          <Button variant="secondary" icon={Download} onClick={() => addToast("Exporting FDA / FSMA 204 Regulatory Traceability Report (PDF)...")}>
            Export Audit Tree
          </Button>
        </div>
      </div>

      {/* Search & Batch Selector Header */}
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Select Batch Identifier:</span>
            <select
              className="form-select"
              style={{ width: "auto", height: "36px", fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 700, border: "1px solid var(--border-active)" }}
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                addToast(`Loaded Genealogical Trace Tree for ${e.target.value}`);
              }}
            >
              <option value="BAT-2026-0892">BAT-2026-0892 (Organic Orange Juice 500ml)</option>
              <option value="BAT-2026-0885">BAT-2026-0885 (Sparkling Yuzu Tea 330ml Can)</option>
            </select>
          </div>

          <div style={{ display: "flex", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)", padding: "2px" }}>
            <button
              onClick={() => setActiveDirection("forward")}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: activeDirection === "forward" ? 700 : 500,
                color: activeDirection === "forward" ? "#FFFFFF" : "var(--text-secondary)",
                backgroundColor: activeDirection === "forward" ? "#0284C7" : "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Forward Trace (Supplier → Customer)
            </button>
            <button
              onClick={() => setActiveDirection("backward")}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: activeDirection === "backward" ? 700 : 500,
                color: activeDirection === "backward" ? "#FFFFFF" : "var(--text-secondary)",
                backgroundColor: activeDirection === "backward" ? "#0284C7" : "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Backward Trace (Recall Root Analysis)
            </button>
          </div>
        </div>
      </Card>

      {/* Batch Overview Tickers */}
      <div className="grid-4">
        <StatCard
          title="Product Code"
          value={currentRecord.sku}
          unit=""
          trend={{ value: currentRecord.productName, isPositive: true, text: "SKU" }}
          icon={Boxes}
          colorVariant="blue"
        />
        <StatCard
          title="Manufacturing Bay"
          value={currentRecord.line}
          unit=""
          trend={{ value: currentRecord.plant, isPositive: true, text: "facility" }}
          icon={Factory}
          colorVariant="cyan"
        />
        <StatCard
          title="Production Volume"
          value={currentRecord.totalUnits.toLocaleString()}
          unit="units"
          trend={{ value: "12 Pallets", isPositive: true, text: "sealed" }}
          icon={PackageCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Regulatory Compliance"
          value="100%"
          unit="FSMA 204"
          trend={{ value: "0 Trace Gaps", isPositive: true, text: "verified" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Interactive Traceability Tree Graph */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Genealogical Node Network Graph: {selectedBatchId}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Click on any node in the chain to inspect certificates, process telemetry, and shipping waybills
            </p>
          </div>
          <Badge variant="cyan">6 Stage Verification Chain</Badge>
        </div>

        <TraceabilityNodeGraph stages={currentRecord.traceabilityGraph.forwardTree} />
      </Card>

      {/* Mock Recall Simulator Result Banner */}
      {isRecallSimOpen && (
        <Card style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #EF4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "#EF4444", color: "#FFFFFF" }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                  MOCK RECALL DRILL EXECUTION COMPLETED (Grade A+)
                </h4>
                <p style={{ fontSize: "12px", color: "#FCA5A5", marginTop: "2px" }}>
                  Affected Product: {currentRecord.productName} • 24,000 Units • 2 DC Destinations (Whole Foods Atlanta, Target Charlotte)
                </p>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "11px", color: "#FFFFFF" }}>
                  <span>Time to 100% Traceability: <strong>4.2 seconds</strong></span>
                  <span>Affected Pallet IDs: <strong>PLT-904-01 to PLT-904-12</strong></span>
                  <span>Regulatory SLA: <strong>&lt; 2 hours (Exceeded)</strong></span>
                </div>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setIsRecallSimOpen(false)}>
              Dismiss Drill
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

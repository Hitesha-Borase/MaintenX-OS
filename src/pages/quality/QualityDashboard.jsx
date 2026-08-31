import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileCheck,
  Search,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";

export function QualityDashboard() {
  const { qualityChecks, addQualityCheck, deviations, updateDeviationStatus, releaseBatchQA } = useQuality();
  const { addToast } = useApp();

  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0892");
  const [checkType, setCheckType] = useState("In-Process CCP Inspection");
  const [brixValue, setBrixValue] = useState("11.9");
  const [phValue, setPhValue] = useState("3.72");
  const [sealPressure, setSealPressure] = useState("3.9");

  const passCount = qualityChecks.filter((q) => q.status === "PASS" || q.status === "RELEASED").length;
  const holdCount = qualityChecks.filter((q) => q.status === "HOLD" || q.status === "BLOCKED").length;

  const handleCreateCheck = (e) => {
    e.preventDefault();
    const newCheck = addQualityCheck({
      orderId: "PO-2026-904",
      batchId: selectedBatch,
      productName: "Organic Cold-Pressed Orange Juice 500ml",
      checkType,
      samplePoint: "Fill Head #6 Discharge Conveyor",
      status: "PASS",
      inspector: "QA Specialist",
      parameters: [
        { name: "Brix Sugar Content", target: "11.8 ± 0.3 °Bx", actual: `${brixValue} °Bx`, status: "PASS" },
        { name: "pH Value", target: "3.65 - 3.85 pH", actual: `${phValue} pH`, status: "PASS" },
        { name: "Seal Burst Pressure", target: "> 3.2 bar", actual: `${sealPressure} bar`, status: "PASS" }
      ],
      notes: "Sample verified against Grade A standard specification."
    });

    addToast(`Quality inspection ${newCheck.id} recorded with 100% PASS!`);
    setIsCheckModalOpen(false);
  };

  const handleReleaseLot = (batchId) => {
    releaseBatchQA(batchId);
    addToast(`Batch ${batchId} released for distribution. Certificate of Analysis (CoA) published.`);
  };

  const columns = [
    {
      header: "Inspection ID",
      accessor: "id",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.timestamp}</div>
          </div>
        </div>
      )
    },
    {
      header: "Batch & Product",
      accessor: "productName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{row.batchId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{val}</div>
        </div>
      )
    },
    {
      header: "Inspection Scope",
      accessor: "checkType",
      render: (val) => <Badge variant="cyan">{val}</Badge>
    },
    {
      header: "Sample Location",
      accessor: "samplePoint",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{val}</span>
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "RELEASED" || val === "PASS" ? "emerald" : val === "HOLD" ? "rose" : "amber";
        return <Badge variant={variant} dot>{val}</Badge>;
      }
    },
    {
      header: "QA Inspector",
      accessor: "inspector",
      render: (val) => <span style={{ fontSize: "12px", color: "#38BDF8" }}>{val}</span>
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (row.status !== "RELEASED") {
              handleReleaseLot(row.batchId);
            } else {
              addToast(`Viewing Certificate of Analysis for ${row.batchId}`);
            }
          }}
        >
          {row.status === "RELEASED" ? "View CoA" : "Authorize QA Release"}
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Quality Management System (QMS) & CCPs
            </h1>
            <Badge variant="emerald">HACCP & SQF Level 3</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            In-process critical control point (CCP) monitoring, laboratory assays, deviation holds, and lot releases.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsCheckModalOpen(true)}>
            + Log Quality Check
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Passed Inspections"
          value={passCount.toString()}
          unit="lots"
          trend={{ value: "100% In Spec", isPositive: true, text: "Brix / pH / Seal" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Active QA Holds"
          value={holdCount.toString()}
          unit="lots"
          trend={{ value: "Tank TK-04", isPositive: false, text: "thermal excursion" }}
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="First Pass Yield (FPY)"
          value="98.1%"
          unit=""
          trend={{ value: "+0.1%", isPositive: true, text: "above 98% SLA" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="HACCP CCP Compliance"
          value="100%"
          unit="audited"
          trend={{ value: "0 Violations", isPositive: true, text: "last 30 days" }}
          icon={FileCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Quality Checks Table */}
      <Card>
        <DataTable
          title="In-Process & Finished Goods Quality Inspections"
          columns={columns}
          data={qualityChecks}
          searchPlaceholder="Search inspection ID, batch, product, inspector..."
          exportFilename="flowstate_quality_inspections.csv"
        />
      </Card>

      {/* Deviations & Hold Log */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Active Quality Deviations & Material Holds
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Quarantined tanks, pallets, and formal non-conformance investigations
            </p>
          </div>
          <Badge variant="rose">1 Active Hold</Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {deviations.map((dev) => (
            <div
              key={dev.id}
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="rose">RED QA HOLD</Badge>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{dev.id}: {dev.title}</span>
                </div>
                <span style={{ fontSize: "12px", color: "#FCA5A5", fontWeight: 600 }}>
                  Quarantined: {dev.holdQuantity} in {dev.tankOrPallet}
                </span>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                <strong>Occurrence Cause:</strong> {dev.occurrenceCause}
              </div>

              <div style={{ fontSize: "12px", color: "#38BDF8" }}>
                <strong>Disposition / CAPA:</strong> {dev.correctiveActionSummary}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addToast(`Disposition authorized: Rework batch ${dev.batchId} via secondary repasteurization loop.`)}
                >
                  Authorize Repasteurization
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => addToast(`Batch ${dev.batchId} marked for controlled bio-waste scrap.`)}
                >
                  Scrap Lot
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Log Quality Check Modal */}
      <Modal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        title="Log In-Process Quality Inspection"
        subtitle="Record analytical measurements against master product specification"
      >
        <form onSubmit={handleCreateCheck} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Active Production Batch</label>
            <input
              type="text"
              className="form-input"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Brix (°Bx) [11.8 ± 0.3]</label>
              <input
                type="text"
                className="form-input"
                value={brixValue}
                onChange={(e) => setBrixValue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">pH Value [3.65 - 3.85]</label>
              <input
                type="text"
                className="form-input"
                value={phValue}
                onChange={(e) => setPhValue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seal Burst [&gt; 3.2 bar]</label>
              <input
                type="text"
                className="form-input"
                value={sealPressure}
                onChange={(e) => setSealPressure(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Button variant="secondary" onClick={() => setIsCheckModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Inspection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

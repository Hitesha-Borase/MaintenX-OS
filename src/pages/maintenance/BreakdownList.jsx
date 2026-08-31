import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  AlertTriangle,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  DollarSign,
  Search,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function BreakdownList() {
  const { breakdowns, reportBreakdown, assets } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [assetId, setAssetId] = useState(assets[0]?.id || "FM-001");
  const [symptom, setSymptom] = useState("");
  const [technician, setTechnician] = useState("Marcus Vance");

  const activeCount = breakdowns.filter((b) => b.status !== "Resolved" && b.status !== "Closed").length;
  const totalDowntimeMin = breakdowns.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
  const totalCostUSD = breakdowns.reduce((sum, b) => sum + (b.impact?.downtimeCostUSD || 0), 0);

  const handleReport = (e) => {
    e.preventDefault();
    if (!symptom.trim()) return;
    const asset = assets.find((a) => a.id === assetId);
    const newBD = reportBreakdown({
      assetId,
      assetName: asset?.name || assetId,
      plant: asset?.plant || "Plant 1",
      department: asset?.department || "Packaging",
      line: asset?.line || "Line 1",
      failureCode: "MEC-004",
      failureCategory: "Mechanical",
      symptom,
      technician,
      impact: { productionLossUnits: 3000, downtimeCostUSD: 5200, safetyRisk: "Medium", scrapRatePercent: 1.8 }
    });
    addToast(`Breakdown ${newBD.id} logged! Production halted on ${asset?.line}.`);
    setIsReportModalOpen(false);
    navigate(`/maintenance/breakdowns/${newBD.id}`);
  };

  const columns = [
    {
      header: "Breakdown ID",
      accessor: "id",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
            <AlertOctagon size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{row.id}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.startTime}</div>
          </div>
        </div>
      )
    },
    {
      header: "Asset & Line",
      accessor: "assetName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{row.assetId} - {row.assetName}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.department} • {row.line}</div>
        </div>
      )
    },
    {
      header: "Failure Mode",
      accessor: "failureCategory",
      render: (val, row) => (
        <div>
          <Badge variant="rose">{row.failureCode}</Badge>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{val}</div>
        </div>
      )
    },
    {
      header: "Symptom",
      accessor: "symptom",
      render: (val) => (
        <span style={{ fontSize: "12px", color: "var(--text-primary)", display: "inline-block", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {val}
        </span>
      )
    },
    {
      header: "Downtime (min)",
      accessor: "durationMinutes",
      render: (val) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
          {val} mins
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => (
        <Badge variant={val === "Resolved" ? "emerald" : "rose"} dot={val !== "Resolved"}>
          {val}
        </Badge>
      )
    },
    {
      header: "Action",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maintenance/breakdowns/${row.id}`);
          }}
        >
          Triage Detail
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
              Unplanned Breakdown Management
            </h1>
            <Badge variant="rose">{activeCount} Active Outages</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Emergency incident response, downtime root cause logging, and technician dispatch tracking.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="danger" icon={AlertOctagon} onClick={() => setIsReportModalOpen(true)}>
            + Report Breakdown
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Active Breakdowns"
          value={activeCount.toString()}
          unit="machines"
          trend={{ value: "Line 2 Affected", isPositive: activeCount === 0, text: "Pasteurizer HT-105" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="Total Downtime (Shift)"
          value={`${totalDowntimeMin}`}
          unit="mins"
          trend={{ value: "3.1 hours lost", isPositive: false, text: "unplanned" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Financial Downtime Loss"
          value={`$${totalCostUSD.toLocaleString()}`}
          unit="USD"
          trend={{ value: "Production Loss", isPositive: false, text: "absorbed" }}
          icon={DollarSign}
          colorVariant="rose"
        />
        <StatCard
          title="RCA Investigations"
          value="2"
          unit="active"
          trend={{ value: "5-Why Initiated", isPositive: true, text: "CAPA pending" }}
          icon={CheckCircle2}
          colorVariant="cyan"
          onClick={() => navigate("/rca-capa")}
        />
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Breakdown Incident Log"
          columns={columns}
          data={breakdowns}
          searchPlaceholder="Search breakdown ID, asset, symptom, failure category..."
          onRowClick={(row) => navigate(`/maintenance/breakdowns/${row.id}`)}
          exportFilename="flowstate_breakdown_log.csv"
        />
      </Card>

      {/* Report Breakdown Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Unplanned Breakdown"
        subtitle="Halt line operations and initiate emergency maintenance response"
      >
        <form onSubmit={handleReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Asset Experiencing Failure *</label>
            <select className="form-select" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.line})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Observed Symptom / Alarm *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Plate heat exchanger gasket burst; pressure dropped by 2.4 bar..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dispatched Technician</label>
            <select className="form-select" value={technician} onChange={(e) => setTechnician(e.target.value)}>
              <option value="Marcus Vance">Marcus Vance (Senior Reliability Tech)</option>
              <option value="David Kim">David Kim (Thermal & Hydraulic Tech)</option>
              <option value="Sarah Jenkins">Sarah Jenkins (Lead Quality Tech)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" icon={AlertOctagon}>
              Log Breakdown & Halt Line
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

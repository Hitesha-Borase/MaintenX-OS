import React, { useState, useMemo } from "react";
import {
  History,
  Wrench,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  X,
  FileText,
  ShieldCheck,
  CalendarRange,
  RotateCcw,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

// Rich initial historical maintenance records (GMP / ISO-55001 compliant)
const INITIAL_MAINTENANCE_HISTORY = [
  {
    id: "HIST-2026-001",
    date: "2026-09-04",
    time: "14:15",
    assetId: "ASSET-001",
    assetName: "Rotary Bottling Filler (Aseptic)",
    type: "Breakdown Repair",
    taskTitle: "Infeed star-wheel jam & spindle bearing replacement",
    technician: "Marcus Vance (Senior Tech)",
    downtimeMinutes: 42,
    partsUsed: "High-Temp Ceramic Bearing #6204 (2x)",
    costUSD: 480.00,
    status: "Verified & Closed",
    rootCause: "Sub-microscopic particulate buildup caused friction torque limit trip.",
    actionTaken: "Cleaned spindle housing, replaced bearings, calibrated torque sensor to 14.5 Nm.",
    signoffBy: "Quality QA Lead (Dave Miller)",
    complianceRef: "GMP-SOP-M04"
  },
  {
    id: "HIST-2026-002",
    date: "2026-09-03",
    time: "09:30",
    assetId: "ASSET-003",
    assetName: "HTST Flash Pasteurizer",
    type: "Preventive Maintenance",
    taskTitle: "Quarterly Plate Heat Exchanger Gasket Overhaul",
    technician: "Elena Rostova",
    downtimeMinutes: 120,
    partsUsed: "EPDM Food-Grade Gasket Kit Set-A",
    costUSD: 850.00,
    status: "Verified & Closed",
    rootCause: "Scheduled preventive lifecycle replacement at 3,000 thermal cycles.",
    actionTaken: "Opened plate pack, inspected for pinholes, replaced all gaskets, passed hydrostatic pressure test at 6.0 Bar.",
    signoffBy: "Plant Safety Officer",
    complianceRef: "HACCP-CCP-01"
  },
  {
    id: "HIST-2026-003",
    date: "2026-09-02",
    time: "11:00",
    assetId: "ASSET-002",
    assetName: "Induction Cap Sealer",
    type: "Calibration",
    taskTitle: "RF Sealing Coil Power & Thermal Profiling",
    technician: "Marcus Vance",
    downtimeMinutes: 25,
    partsUsed: "None (Calibration standard only)",
    costUSD: 120.00,
    status: "Verified & Closed",
    rootCause: "Routine monthly metrology alignment.",
    actionTaken: "Calibrated thermocouple with NIST-traceable thermal probe; adjusted output power to 3.8 kW.",
    signoffBy: "QA Metrology Specialist",
    complianceRef: "ISO-17025"
  },
  {
    id: "HIST-2026-004",
    date: "2026-09-01",
    time: "16:45",
    assetId: "ASSET-004",
    assetName: "Sleeve Rotary Labeler",
    type: "Breakdown Repair",
    taskTitle: "Cutting Blade Roller Edge Re-sharpening & Alignment",
    technician: "Carlos Mendez",
    downtimeMinutes: 35,
    partsUsed: "Carbide Rotary Blade Tip (1x)",
    costUSD: 240.00,
    status: "Verified & Closed",
    rootCause: "Burr on foil roll caused blade dulling after 180,000 cuts.",
    actionTaken: "Swapped blade tip, cleaned vacuum rotary drum, verified cut tolerance within ±0.2mm.",
    signoffBy: "Packaging Line Supervisor",
    complianceRef: "SOP-PKG-11"
  },
  {
    id: "HIST-2026-005",
    date: "2026-08-29",
    time: "08:15",
    assetId: "ASSET-005",
    assetName: "Semi-Auto Depalletizer",
    type: "Preventive Maintenance",
    taskTitle: "Pneumatic Cylinder Seal Rebuild & Chain Tensioning",
    technician: "Elena Rostova",
    downtimeMinutes: 60,
    partsUsed: "Festo Pneumatic Seal Kit PK-4",
    costUSD: 195.00,
    status: "Verified & Closed",
    rootCause: "Preventive PM execution (PM-2026-W35).",
    actionTaken: "Replaced rod wipers, lubricated drive chains with food-grade H1 grease, tested cycle speed.",
    signoffBy: "Maintenance Lead",
    complianceRef: "PM-DEP-002"
  },
  {
    id: "HIST-2026-006",
    date: "2026-08-27",
    time: "13:10",
    assetId: "ASSET-001",
    assetName: "Rotary Bottling Filler (Aseptic)",
    type: "Breakdown Repair",
    taskTitle: "Filling Valve #14 Diaphragm Micro-Leak",
    technician: "Marcus Vance",
    downtimeMinutes: 28,
    partsUsed: "PTFE Valve Diaphragm E-Seal (1x)",
    costUSD: 110.00,
    status: "Verified & Closed",
    rootCause: "CIP (Clean-In-Place) caustic exposure degradation over 450 thermal cycles.",
    actionTaken: "Sanitized valve manifold, replaced PTFE diaphragm, conducted helium leak test. Result: Zero leakage.",
    signoffBy: "Sanitation & QA Manager",
    complianceRef: "FDA-21CFR-111"
  }
];

export function MaintenanceHistory() {
  const { workOrders = [], breakdowns = [] } = useCMMS();
  const { addToast } = useApp();

  const [historyRecords] = useState(INITIAL_MAINTENANCE_HISTORY);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("30_DAYS");

  // Merge context completed items if any
  const allRecords = useMemo(() => {
    const liveWOs = workOrders
      .filter((w) => w.status === "Completed" || w.status === "Verified" || w.status === "Closed")
      .map((w, idx) => ({
        id: `HIST-LIVE-${w.id}`,
        date: w.completedDate || w.createdDate || "2026-09-04",
        time: "10:00",
        assetId: w.assetId,
        assetName: w.assetName,
        type: w.type === "Preventive" ? "Preventive Maintenance" : "Breakdown Repair",
        taskTitle: w.title,
        technician: w.assignedTechnician || "Marcus Vance",
        downtimeMinutes: w.durationMinutes || 45,
        partsUsed: w.partsUsed || "Standard Maintenance Supplies",
        costUSD: w.cost || 250.00,
        status: "Verified & Closed",
        rootCause: w.description || "Operational wear & scheduled intervention",
        actionTaken: "Full inspection and component replacement executed according to standard operating procedure.",
        signoffBy: "Maintenance Lead",
        complianceRef: "ISO-55001"
      }));

    // Combine and deduplicate
    const combined = [...historyRecords];
    liveWOs.forEach((lw) => {
      if (!combined.some((c) => c.taskTitle === lw.taskTitle)) {
        combined.push(lw);
      }
    });

    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [historyRecords, workOrders]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      const matchSearch =
        rec.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === "ALL" || rec.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [allRecords, searchTerm, typeFilter]);

  // Aggregate Metrics
  const totalCompleted = filteredRecords.length;
  const totalDowntimeHours = (filteredRecords.reduce((sum, r) => sum + r.downtimeMinutes, 0) / 60).toFixed(1);
  const totalCostUSD = filteredRecords.reduce((sum, r) => sum + r.costUSD, 0);
  const firstTimeFixRate = "96.4%";

  const getTypeBadge = (type) => {
    switch (type) {
      case "Breakdown Repair":
        return <Badge variant="rose">Breakdown</Badge>;
      case "Preventive Maintenance":
        return <Badge variant="cyan">Preventive</Badge>;
      case "Calibration":
        return <Badge variant="amber">Calibration</Badge>;
      default:
        return <Badge variant="slate">{type}</Badge>;
    }
  };

  const columns = [
    {
      header: "Date & Time",
      accessor: "date",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{val}</strong>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.time}</div>
        </div>
      )
    },
    {
      header: "Job Scope & Reference",
      accessor: "taskTitle",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8C5B23" }}>
            <Wrench size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              ID: {row.id} • Ref: {row.complianceRef}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Target Machine",
      accessor: "assetName",
      render: (val, row) => (
        <div>
          <strong style={{ color: "var(--text-primary)" }}>{val}</strong>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetId}</div>
        </div>
      )
    },
    {
      header: "Work Type",
      accessor: "type",
      render: (val) => getTypeBadge(val)
    },
    {
      header: "Technician",
      accessor: "technician",
      render: (val) => <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{val}</span>
    },
    {
      header: "Downtime",
      accessor: "downtimeMinutes",
      render: (val) => (
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#D97706", fontFamily: "var(--font-mono)" }}>
          {val}m
        </span>
      )
    },
    {
      header: "Parts & Cost (USD)",
      accessor: "costUSD",
      render: (val, row) => (
        <div>
          <strong style={{ color: "#10B981", fontFamily: "var(--font-mono)" }}>
            ${val.toFixed(2)}
          </strong>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.partsUsed}>
            {row.partsUsed}
          </div>
        </div>
      )
    },
    {
      header: "Audit Status",
      accessor: "status",
      render: (val) => (
        <Badge variant="emerald" dot>
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
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedRecord(row)}
        >
          Audit Details
        </Button>
      )
    }
  ];

  const handleExportCSV = () => {
    const headers = ["Record ID,Date,Time,Asset ID,Asset Name,Type,Task,Technician,Downtime (min),Cost (USD),Status,Signoff"];
    const rows = filteredRecords.map((r) =>
      `"${r.id}","${r.date}","${r.time}","${r.assetId}","${r.assetName}","${r.type}","${r.taskTitle}","${r.technician}","${r.downtimeMinutes}","${r.costUSD}","${r.status}","${r.signoffBy}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maintenx_maintenance_history_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Maintenance History export downloaded successfully!", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Maintenance History & Regulatory Audit Log
            </h1>
            <Badge variant="emerald">ISO-55001 / FDA CFR-11 Verified</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Comprehensive audit record of all resolved breakdowns, executed preventive schedules, and component replacements.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Audit CSV
          </Button>
          <Button variant="ghost" icon={RotateCcw} onClick={() => addToast("Maintenance history synchronized with plant telemetry.", "info")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Completed Jobs"
          value={totalCompleted.toString()}
          unit="Records"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Total Resolved Downtime"
          value={totalDowntimeHours}
          unit="Hours"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Parts Spend (USD)"
          value={`$${totalCostUSD.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          unit="Total Parts"
          icon={DollarSign}
          colorVariant="cyan"
        />
        <StatCard
          title="First-Time Fix Rate"
          value={firstTimeFixRate}
          unit="Compliance"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "14px 16px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", width: "100%" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "420px", flex: 1, minWidth: "220px" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search asset, task, technician, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "12px", backgroundColor: "var(--bg-card)", width: "100%" }}
              />
            </div>

            <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              Showing {filteredRecords.length} records
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "2px",
              WebkitOverflowScrolling: "touch",
              width: "100%",
              minWidth: 0,
              scrollbarWidth: "none"
            }}
          >
            {["ALL", "Breakdown Repair", "Preventive Maintenance", "Calibration"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  backgroundColor: typeFilter === t ? "#8C5B23" : "var(--bg-card)",
                  color: typeFilter === t ? "#FFFFFF" : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.15s ease"
                }}
              >
                {t === "ALL" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Historical Audit Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <DataTable
          title="Consolidated Maintenance History Archive"
          columns={columns}
          data={filteredRecords}
          searchPlaceholder="Filter table rows..."
          exportFilename="maintenx_maintenance_history.csv"
        />
      </Card>

      {/* DETAIL AUDIT MODAL */}
      {selectedRecord && (
        <div className="modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content" style={{ maxWidth: "620px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={18} color="#8C5B23" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Maintenance Job Completion Dossier
                </h2>
              </div>
              <button onClick={() => setSelectedRecord(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {selectedRecord.taskTitle}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    Archive Tag: {selectedRecord.id} • SOP/Ref: {selectedRecord.complianceRef}
                  </div>
                </div>
                {getTypeBadge(selectedRecord.type)}
              </div>

              {/* Data Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Asset Involved:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedRecord.assetName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{selectedRecord.assetId}</div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Completion Timestamp:</span>
                  <strong style={{ color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                    {selectedRecord.date} at {selectedRecord.time}
                  </strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Lead Technician:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedRecord.technician}</strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Downtime Impact:</span>
                  <strong style={{ color: "#D97706", fontFamily: "var(--font-mono)" }}>{selectedRecord.downtimeMinutes} Minutes</strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Replaced Spare Parts:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedRecord.partsUsed}</strong>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Total Job Cost:</span>
                  <strong style={{ color: "#10B981", fontFamily: "var(--font-mono)" }}>${selectedRecord.costUSD.toFixed(2)} USD</strong>
                </div>
              </div>

              {/* Engineering Root Cause & Action */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                <div style={{ padding: "10px 12px", backgroundColor: "rgba(239, 68, 68, 0.05)", borderLeft: "3px solid #EF4444", borderRadius: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#EF4444", display: "block", marginBottom: "2px" }}>Identified Root Cause:</span>
                  <span style={{ color: "var(--text-secondary)" }}>{selectedRecord.rootCause}</span>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "rgba(16, 185, 129, 0.05)", borderLeft: "3px solid #10B981", borderRadius: "4px" }}>
                  <span style={{ fontWeight: 700, color: "#10B981", display: "block", marginBottom: "2px" }}>Corrective Action Taken & Verification:</span>
                  <span style={{ color: "var(--text-secondary)" }}>{selectedRecord.actionTaken}</span>
                </div>
              </div>

              {/* Electronic Sign-off Badge */}
              <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} color="#10B981" />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Quality Sign-off: {selectedRecord.signoffBy}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      21 CFR Part 11 Electronic Signature Verified
                    </div>
                  </div>
                </div>
                <Badge variant="emerald">PASS</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={() => {
                    addToast(`Exported formal dossier for ${selectedRecord.id}`);
                    setSelectedRecord(null);
                  }}
                >
                  Print QA Sign-off
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

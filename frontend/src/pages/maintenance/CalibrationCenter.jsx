import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
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

export function CalibrationCenter() {
  const { calibrations, addCalibrationRecord } = useCMMS();
  const { addToast } = useApp();

  const [selectedCert, setSelectedCert] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [calData, setCalData] = useState({ assetId: "", nextDueDate: "", result: "PASS - Within Tolerance" });

  const handleLogCalibration = (e) => {
    e.preventDefault();
    addCalibrationRecord(calData);
    addToast("Calibration record successfully logged.");
    setIsLogModalOpen(false);
    setCalData({ assetId: "", nextDueDate: "", result: "PASS - Within Tolerance" });
  };

  const validCount = calibrations.filter((c) => c.status === "Valid").length;
  const dueSoonCount = calibrations.filter((c) => c.status === "Due Soon").length;
  const overdueCount = calibrations.filter((c) => c.status === "Overdue" || c.status === "Failed").length;

  const columns = [
    {
      header: "Instrument ID & Description",
      accessor: "instrumentName",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{row.instrumentId}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{val}</div>
          </div>
        </div>
      )
    },
    {
      header: "Linked Asset",
      accessor: "assetId",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#38BDF8" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.assetName}</div>
        </div>
      )
    },
    {
      header: "Measurement Range",
      accessor: "range",
      render: (val, row) => (
        <div>
          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>{val}</span>
          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Spec: {row.accuracySpec}</div>
        </div>
      )
    },
    {
      header: "Calibration Status",
      accessor: "status",
      render: (val) => {
        const variant = val === "Valid" ? "emerald" : val === "Due Soon" ? "amber" : "rose";
        return <Badge variant={variant} dot={val !== "Valid"}>{val}</Badge>;
      }
    },
    {
      header: "Next Due Date",
      accessor: "nextDueDate",
      render: (val, row) => (
        <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: row.status === "Overdue" ? "#EF4444" : "var(--text-primary)" }}>
          {val}
        </span>
      )
    },
    {
      header: "Certificate",
      accessor: "certificateNumber",
      render: (val, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={FileText}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCert(row);
          }}
        >
          {val}
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
              Instrumentation Calibration & Metrology Center
            </h1>
            <Badge variant="emerald">ISO 17025 Compliant</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsLogModalOpen(true)}>
            + Log Calibration
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Valid Instruments"
          value={validCount.toString()}
          unit="certified"
          trend={{ value: "In Calibration", isPositive: true, text: "ISO compliant" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Due Soon (< 30 Days)"
          value={dueSoonCount.toString()}
          unit="sensors"
          trend={{ value: "MX-003 Pressure", isPositive: false, text: "schedule window" }}
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="Overdue Calibration"
          value={overdueCount.toString()}
          unit="critical"
          trend={{ value: "INS-FM-012 Flow", isPositive: false, text: "QA flagged" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Audit Readiness"
          value="95.0%"
          unit=""
          trend={{ value: "Traceable", isPositive: true, text: "NIST certificates" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
      </div>

      {/* Data Table */}
      <Card>
        <DataTable
          title="Calibration Schedule & Metrology Records"
          columns={columns}
          data={calibrations}
          searchPlaceholder="Search instrument ID, name, asset, certificate..."
          onRowClick={(row) => setSelectedCert(row)}
          exportFilename="flowstate_calibration_records.csv"
        />
      </Card>

      {/* Certificate Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Calibration Certificate Details"
        subtitle={selectedCert?.certificateNumber}
      >
        {selectedCert && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "14px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{selectedCert.instrumentName}</div>
              <div style={{ fontSize: "12px", color: "var(--accent-blue)", marginTop: "2px" }}>ID: {selectedCert.instrumentId} • Linked Asset: {selectedCert.assetId}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Calibrated By:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedCert.technician}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Calibration Standard:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{selectedCert.standardUsed}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Measured Error Offset:</span>
                <span style={{ fontWeight: 700, color: "#34D399", fontFamily: "var(--font-mono)" }}>{selectedCert.resultError}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ color: "var(--text-muted)" }}>Next Due Date:</span>
                <span style={{ fontWeight: 600, color: selectedCert.status === "Overdue" ? "#EF4444" : "var(--text-primary)" }}>{selectedCert.nextDueDate}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <Button variant="secondary" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
              <Button variant="primary" icon={FileText} onClick={() => addToast("Downloading NIST Traceable PDF Certificate...")}>
                Download PDF Certificate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Log Calibration Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Calibration Record"
        subtitle="Enter new calibration test results"
      >
        <form onSubmit={handleLogCalibration} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Asset / Instrument ID</label>
            <input
              type="text"
              className="form-input"
              value={calData.assetId}
              onChange={(e) => setCalData({ ...calData, assetId: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Next Due Date</label>
            <input
              type="date"
              className="form-input"
              value={calData.nextDueDate}
              onChange={(e) => setCalData({ ...calData, nextDueDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Result</label>
            <select
              className="form-input"
              value={calData.result}
              onChange={(e) => setCalData({ ...calData, result: e.target.value })}
            >
              <option value="PASS - Within Tolerance">PASS - Within Tolerance</option>
              <option value="FAIL - Out of Tolerance">FAIL - Out of Tolerance</option>
              <option value="ADJUSTED - Back to Spec">ADJUSTED - Back to Spec</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>Log Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


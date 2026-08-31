import React, { useState } from "react";
import {
  Sliders,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { AreaChart } from "../../components/charts/AreaChart";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function CalibrationHistoryPage() {
  const { calibrationHistory } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = calibrationHistory.filter((h) => {
    return (
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.instrumentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownloadCertificate = (entry) => {
    const certText = `
================================================================================
          METROLOGY CALIBRATION CERTIFICATE & TRACEABILITY REPORT
================================================================================
Certificate No:    ${entry.certificateNumber}
Calibration ID:    ${entry.id}
Instrument Tag:    ${entry.instrumentId}
Description:       ${entry.instrumentName}
Date of Test:      ${entry.calibrationDate}
Calibrated By:     ${entry.technician}
Primary Standard:  ${entry.standardUsed}

--------------------------------------------------------------------------------
TEST RESULTS:
As-Found Deviation:  ${entry.asFoundError}
As-Left Deviation:   ${entry.asLeftError}
Final Verdict:       ${entry.result}
--------------------------------------------------------------------------------
Traceability Standard: ISO/IEC 17025:2017 & NIST Primary Weight Reference
Authorized Signatory: Plant Quality & Metrology Superintendent
================================================================================
`;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Calibration_Certificate_${entry.certificateNumber}.txt`;
    a.click();
    addToast(`Certificate ${entry.certificateNumber} downloaded.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Calibration Audit History
            </h1>
            <Badge variant="cyan">{calibrationHistory.length} Historical Records</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Comprehensive traceability logs, multi-year error drift history, and digital ISO calibration certificates.
          </p>
        </div>
      </div>

      {/* Drift Trend Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Instrument Error Drift Stability Index
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Historical deviation trends across test cycles
            </p>
          </div>
          <Badge variant="emerald">Within Spec Limit (±0.15%)</Badge>
        </div>

        <AreaChart
          data={[
            { label: "Q1 2025", value: 0.08 },
            { label: "Q2 2025", value: 0.05 },
            { label: "Q3 2025", value: 0.07 },
            { label: "Q4 2025", value: 0.04 },
            { label: "Q1 2026", value: 0.06 },
            { label: "Q2 2026", value: 0.02 }
          ]}
          height={180}
          color="#10B981"
          unit="%"
        />
      </Card>

      {/* Historical Records Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search historical audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit Record ID</th>
                <th>Instrument Tag / Name</th>
                <th>Test Date</th>
                <th>Standard Used</th>
                <th>As-Found Error</th>
                <th>As-Left Error</th>
                <th>Verdict</th>
                <th>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h) => (
                <tr key={h.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{h.id}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{h.certificateNumber}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#38BDF8" }}>{h.instrumentId}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{h.instrumentName}</div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    {h.calibrationDate}
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {h.standardUsed}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#F59E0B" }}>
                    {h.asFoundError}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#10B981", fontWeight: 700 }}>
                    {h.asLeftError}
                  </td>
                  <td>
                    <Badge variant={h.result.includes("Passed") ? "emerald" : "rose"}>
                      {h.result}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownloadCertificate(h)}
                    >
                      Certificate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Sliders,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  X,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function CalibrationRecordsPage() {
  const [searchParams] = useSearchParams();
  const calIdParam = searchParams.get("calId");
  const navigate = useNavigate();

  const { calibrations, recordCalibrationResult, assets } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(!!calIdParam);
  const [selectedCalId, setSelectedCalId] = useState(calIdParam || calibrations[0]?.id);

  const [testForm, setTestForm] = useState({
    asFoundError: "+0.08",
    errorVal: "+0.01",
    passed: true,
    certNo: `CERT-NIST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    technician: "Marcus Vance",
    standardUsed: "Fluke 754 Documenting Process Calibrator"
  });

  useEffect(() => {
    if (calIdParam) {
      setSelectedCalId(calIdParam);
      setIsTestModalOpen(true);
    }
  }, [calIdParam]);

  const targetCal = calibrations.find((c) => c.id === selectedCalId) || calibrations[0];

  const filteredCalibrations = calibrations.filter((c) => {
    return (
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleTestSubmit = (e) => {
    e.preventDefault();
    if (!targetCal) return;

    recordCalibrationResult(targetCal.id, {
      ...testForm,
      instrumentId: targetCal.instrumentId,
      instrumentName: targetCal.instrumentName
    });

    addToast(`Calibration Test recorded for ${targetCal.instrumentId}! Status: ${testForm.passed ? "VALID" : "FAILED"}`, "success");
    setIsTestModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Calibration ID,Instrument Tag,Instrument Name,Range,Accuracy Spec,Last Cal Date,Error,Cert Number,Status\n";
    const rows = filteredCalibrations
      .map(
        (c) =>
          `"${c.id}","${c.instrumentId}","${c.instrumentName}","${c.range}","${c.accuracySpec}","${c.lastCalibrationDate}","${c.resultError || "N/A"}","${c.certificateNumber}","${c.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Calibration_Records_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Calibration records exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Calibration Records & Certificates
            </h1>
            <Badge variant="emerald">ISO 17025 Compliant</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Active metrology certificates, error deviations, calibration standards verification, and as-left tolerance validation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Records
          </Button>
          <Button variant="secondary" onClick={() => navigate("/calibration/history")}>
            Calibration History
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsTestModalOpen(true)}>
            + Record Calibration Test
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Active Certified Instruments"
          value={calibrations.filter((c) => c.status === "Valid").length.toString()}
          unit="Certified"
          trend={{ value: "NIST & ISO traceable", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Instrument Drift Rate"
          value="< 0.05%"
          unit="Nominal"
          trend={{ value: "Within class tolerance", isPositive: true, text: "" }}
          icon={Sliders}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Readiness Score"
          value="100%"
          unit="Passed"
          trend={{ value: "Zero non-conformances", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table Card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search instrument tag, certificate #, standard..."
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
                <th>Certificate Number</th>
                <th>Instrument Tag / Name</th>
                <th>Host Asset</th>
                <th>Tolerance Spec</th>
                <th>As-Left Error</th>
                <th>Last Cal Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalibrations.map((c) => {
                const isValid = c.status === "Valid";

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>
                        {c.certificateNumber}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{c.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{c.instrumentId}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{c.instrumentName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>{c.assetId}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{c.assetName}</div>
                    </td>
                    <td>
                      <Badge variant="cyan">{c.accuracySpec}</Badge>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isValid ? "#10B981" : "#EF4444" }}>
                        {c.resultError || "±0.00"}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {c.lastCalibrationDate}
                    </td>
                    <td>
                      <Badge variant={isValid ? "emerald" : "rose"} dot={isValid}>
                        {c.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedCalId(c.id);
                          setIsTestModalOpen(true);
                        }}
                      >
                        Record Test
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECORD CALIBRATION MODAL */}
      {isTestModalOpen && targetCal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Record Metrology Calibration Result
                </h2>
                <div style={{ fontSize: "12px", color: "#38BDF8" }}>
                  Instrument: {targetCal.instrumentId} — {targetCal.instrumentName}
                </div>
              </div>
              <button onClick={() => setIsTestModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTestSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Select Instrument</label>
                  <select
                    className="form-select"
                    value={selectedCalId}
                    onChange={(e) => setSelectedCalId(e.target.value)}
                  >
                    {calibrations.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.instrumentId} ({c.assetId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Certificate Number</label>
                  <input
                    type="text"
                    required
                    value={testForm.certNo}
                    onChange={(e) => setTestForm({ ...testForm, certNo: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">As-Found Error</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +0.08°C"
                    value={testForm.asFoundError}
                    onChange={(e) => setTestForm({ ...testForm, asFoundError: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">As-Left Error (Post Calibration)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +0.01°C"
                    value={testForm.errorVal}
                    onChange={(e) => setTestForm({ ...testForm, errorVal: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Primary Test Standard Used</label>
                  <input
                    type="text"
                    value={testForm.standardUsed}
                    onChange={(e) => setTestForm({ ...testForm, standardUsed: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Calibration Result</label>
                  <select
                    className="form-select"
                    value={testForm.passed ? "PASS" : "FAIL"}
                    onChange={(e) => setTestForm({ ...testForm, passed: e.target.value === "PASS" })}
                  >
                    <option value="PASS">PASS (Within Tolerance)</option>
                    <option value="FAIL">FAIL (Out of Tolerance)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsTestModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Calibration Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

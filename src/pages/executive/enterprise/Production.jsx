import React, { useState } from "react";
import { Factory, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";

export function Production() {
  const { addToast } = useApp();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [exporting, setExporting] = useState(false);

  const plantData = [
    { plant: "Austin Main Plant", volume: "620,000 Cases", completion: "98.2%", runTime: "412 hrs" },
    { plant: "Chicago East Plant", volume: "480,000 Cases", completion: "91.5%", runTime: "392 hrs" },
    { plant: "Boston Logistics Hub", volume: "320,000 Cases", completion: "93.8%", runTime: "288 hrs" }
  ];

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      addToast(`Production volume data exported as ${exportFormat.toUpperCase()} file successfully.`, "success");
      setIsExportModalOpen(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Enterprise Production
        </h1>
        <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExport}>
          Export Volume Data
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Total Volume (MTD)" value="1.42M Cases" description="Target: 1.50M Cases" icon={Factory} color="#0284C7" />
        <StatCard title="Attainment Rate" value="94.6%" description="Target: 95.0%" icon={Factory} color="#059669" />
        <StatCard title="Active Line Capacity" value="92.1%" description="18 of 20 Lines Active" icon={Factory} color="#D97706" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Volume by Plant
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {plantData.map((item, idx) => (
            <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{item.plant}</span>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                <span>Run Time: <strong>{item.runTime}</strong></span>
                <span>Completion: <strong style={{ color: "#059669", fontFamily: "var(--font-mono)" }}>{item.completion}</strong></span>
                <span style={{ color: "#0284C7", fontWeight: 800, fontFamily: "var(--font-mono)" }}>{item.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Production Volume Data"
        subtitle="Select export format and date range for the production report"
        maxWidth="460px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={Download} onClick={handleConfirmExport}>
              {exporting ? "Exporting..." : "Export Report"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
          <div>
            <label style={{ display: "block", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input-field"
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF Report (.pdf)</option>
            </select>
          </div>
          <div style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div>Total Records: <strong>3 Plants</strong></div>
            <div>Volume MTD: <strong>1.42M Cases</strong></div>
            <div>Attainment: <strong style={{ color: "#059669" }}>94.6%</strong></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

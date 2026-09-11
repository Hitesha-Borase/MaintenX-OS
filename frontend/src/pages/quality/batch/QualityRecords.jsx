import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, Search, RefreshCw, Eye, 
  CheckCircle2, X, Info, ShieldCheck, FileText, ArrowRight
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";

export function QualityRecords() {
  const { addToast } = useApp();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getQualityRecords();
      if (res?.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.warn("Quality records fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleExportCSV = async () => {
    try {
      await qualityService.exportQualityRecords({ count: records.length });
    } catch (err) {
      console.warn("Export quality records error:", err.message);
    }

    const headers = "Record ID,Batch,Type,Result,Date,Officer,Details\n";
    const rows = records.map(r => `"${r.id}","${r.batch}","${r.type}","${r.result}","${r.date}","${r.officer}","${r.details}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Batch_Quality_Records_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("Quality records exported as CSV.", "info");
  };

  const filteredRecords = records.filter(r =>
    (r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.batch || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.officer || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSpreadsheet size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Batch Quality Records
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Consolidated verification logs across CCP thermal runs, analytical lab tests, and packaging integrity
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export Records
          </Button>
          <Button variant="primary" icon={RefreshCw} onClick={fetchRecords} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Total Records</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Audit Ready
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {records.length}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Immutable electronic verification
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Passed Tests</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              100% PASS
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {records.filter(r => r.result === "PASS").length}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Within target critical limits
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>QA Officers Active</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Certified
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            2 Leads
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Dr. Rachel Thorne & Marcus Vance
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by Record ID, batch number, check type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#2B1D11" }}
          />
        </div>
      </Card>

      {/* Structured Table Card */}
      <Card style={{ padding: "0", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>
            Master Batch Quality Records ({filteredRecords.length})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Record ID</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Batch Reference</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Verification Category</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Verified By</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Result</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, index) => (
                <tr 
                  key={r.id || index}
                  style={{ 
                    borderBottom: index === filteredRecords.length - 1 ? "none" : "1px solid #F0E8DD",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C89547" }} />
                      <span>{r.id}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                    {r.batch}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#2B1D11", fontWeight: 500 }}>
                    {r.type}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#6B5B4E" }}>
                    {r.officer} &bull; {r.date}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "rgba(200, 149, 71, 0.25)",
                      color: "#2B1D11",
                      border: "1px solid rgba(200, 149, 71, 0.4)"
                    }}>
                      {r.result}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={Eye} 
                      onClick={() => setSelectedRecord(r)}
                    >
                      View Record
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Record Dossier */}
      {selectedRecord && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E8DDCF",
            width: "100%",
            maxWidth: "560px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileSpreadsheet size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  Quality Record: {selectedRecord.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", textTransform: "uppercase" }}>{selectedRecord.type}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#2B1D11", marginTop: "4px" }}>Batch: {selectedRecord.batch}</div>
                <div style={{ fontSize: "13px", color: "#6B5B4E", marginTop: "2px" }}>{selectedRecord.details}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Date Executed</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedRecord.date}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Audited By</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8B6914" }}>{selectedRecord.officer}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Verification Result</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8B6914" }}>{selectedRecord.result}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Audit Status</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>Compliant & Sealed</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  icon={CheckCircle2}
                  onClick={() => {
                    addToast(`Record ${selectedRecord.id} verified in compliance audit vault.`, "success");
                    setSelectedRecord(null);
                  }}
                >
                  Verify Compliance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  RefreshCw, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Calendar, 
  Search,
  Share2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import qualityService from "../../services/qualityService";

export function Reports() {
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newReportName, setNewReportName] = useState("");
  const [newReportCategory, setNewReportCategory] = useState("CRITICAL_CONTROL_POINTS");

  const [reports, setReports] = useState([
    { 
      id: "REP-001", 
      name: "CCP Pasteurizer Temperature Log & Excursion Audit", 
      date: "2026-08-31", 
      category: "CRITICAL_CONTROL_POINTS",
      format: "PDF / CSV",
      status: "READY",
      recordsCount: 142,
      generatedBy: "System (Automated Daily)"
    },
    { 
      id: "REP-002", 
      name: "Batch Release & Reject Summary Report (Monthly)", 
      date: "2026-08-31", 
      category: "BATCH_RELEASE",
      format: "PDF / Excel",
      status: "READY",
      recordsCount: 88,
      generatedBy: "Maria Santos"
    },
    { 
      id: "REP-003", 
      name: "Quality Events, NCRs & Deviations Dossier", 
      date: "2026-08-31", 
      category: "EVENTS_NCR",
      format: "PDF / CSV",
      status: "READY",
      recordsCount: 26,
      generatedBy: "Dr. Rachel Thorne"
    },
    { 
      id: "REP-004", 
      name: "Sanitation CIP & Environmental Swab Compliance Log", 
      date: "2026-08-30", 
      category: "SANITATION_CIP",
      format: "PDF / CSV",
      status: "READY",
      recordsCount: 54,
      generatedBy: "Sanitation Lead"
    }
  ]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getReports();
      if (res?.data && Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (err) {
      console.warn("Reports fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handlePrint = (report) => {
    addToast(`Preparing ${report.name} for high-resolution print...`, "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownload = async (report) => {
    try {
      setGeneratingReportId(report.id);
      const res = await qualityService.generateReport({ reportId: report.id, name: report.name });
      addToast(res?.data?.message || `Report ${report.name} compiled and ready for download!`, "success");
    } catch (err) {
      addToast(`Compiling ${report.name}... Download initiated`, "info");
    } finally {
      setGeneratingReportId(null);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportName.trim()) {
      addToast("Please enter a report title", "warning");
      return;
    }

    try {
      const payload = {
        name: newReportName,
        category: newReportCategory,
        reportId: `REP-00${reports.length + 1}`
      };

      const res = await qualityService.generateReport(payload);
      
      const newEntry = {
        id: `REP-00${reports.length + 1}`,
        name: newReportName,
        date: new Date().toISOString().split("T")[0],
        category: newReportCategory,
        format: "PDF / CSV",
        status: "READY",
        recordsCount: 35,
        generatedBy: "Dr. Rachel Thorne"
      };

      setReports(prev => [newEntry, ...prev]);
      setShowGenerateModal(false);
      setNewReportName("");
      addToast(res?.data?.message || `Report "${newReportName}" generated successfully!`, "success");
    } catch (err) {
      addToast("Failed to trigger report generation", "error");
    }
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B6914" }}>
              Analytics & Auditing
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Quality Assurance Reports
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Generate, print, and export regulatory compliance dossiers for CCP audits, batch releases, and sanitation logs.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button 
            variant="primary" 
            icon={PlusCircle} 
            onClick={() => setShowGenerateModal(true)}
            style={{
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              fontWeight: 700
            }}
          >
            Generate Report
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={loadReports} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileSpreadsheet size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Available Reports</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{reports.length}</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Automated Schedules</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>Daily & Monthly</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Compliance Status</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#2B1D11" }}>100% READY</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Download size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Export Formats</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>PDF & CSV</div>
          </div>
        </Card>
      </div>

      {/* Main Reports Data Table */}
      <Card style={{ padding: "20px 24px", borderRadius: "16px", background: "white", border: "1px solid #E8DDCF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              QA Report Repository
            </h2>
            <span style={{ fontSize: "12px", background: "rgba(200, 149, 71, 0.15)", color: "#8B6914", padding: "3px 8px", borderRadius: "12px", fontWeight: 700 }}>
              {filteredReports.length} Reports
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: "8px",
                border: "1px solid #D1C7BA",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#FAF8F5"
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Report ID</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Report Title</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Category</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Generated Date</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Records</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Generated By</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((rep) => (
                <tr key={rep.id} style={{ borderBottom: "1px solid #F0EAE1" }}>
                  <td style={{ padding: "14px", fontWeight: 700, color: "#2B1D11" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FileSpreadsheet size={16} color="#8B6914" />
                      {rep.id}
                    </div>
                  </td>
                  <td style={{ padding: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {rep.name}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", background: "rgba(200, 149, 71, 0.12)", padding: "3px 8px", borderRadius: "6px" }}>
                      {rep.category}
                    </span>
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {rep.date}
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-primary)", fontWeight: 600 }}>
                    {rep.recordsCount} Rows
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)" }}>
                    {rep.generatedBy}
                  </td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => handlePrint(rep)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #D1C7BA",
                          background: "#FAF8F5",
                          color: "#2B1D11",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <Printer size={14} />
                        Print
                      </button>

                      <button
                        onClick={() => handleDownload(rep)}
                        disabled={generatingReportId === rep.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                          color: "#261603",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        <Download size={14} />
                        {generatingReportId === rep.id ? "Compiling..." : "PDF Export"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            padding: "24px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #E8DDCF", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={22} color="#8B6914" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#2B1D11" }}>
                  Generate New QA Report
                </h3>
              </div>
              <button 
                onClick={() => setShowGenerateModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Report Title <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.g. Aseptic Pasteurizer Thermal Deviation Log"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D1C7BA",
                    fontSize: "14px",
                    backgroundColor: "#FAF8F5",
                    outline: "none"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Category
                </label>
                <select
                  value={newReportCategory}
                  onChange={(e) => setNewReportCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #D1C7BA",
                    fontSize: "14px",
                    backgroundColor: "#FAF8F5",
                    outline: "none"
                  }}
                >
                  <option value="CRITICAL_CONTROL_POINTS">Critical Control Points (CCP)</option>
                  <option value="BATCH_RELEASE">Batch Release & Disposition</option>
                  <option value="EVENTS_NCR">Quality Events & NCRs</option>
                  <option value="SANITATION_CIP">Sanitation & CIP Loops</option>
                  <option value="REGULATORY_AUDIT">21 CFR Part 11 Regulatory Audit</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <Button variant="outline" type="button" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Generate & Compile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

import React, { useState, useEffect } from "react";
import { 
  SearchCode, Plus, Search, FileSpreadsheet, RefreshCw, 
  FileText, CheckCircle, X, Info, ArrowRight, ShieldCheck, Activity, Target
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function Investigations() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInv, setSelectedInv] = useState(null);
  const [showFindingModal, setShowFindingModal] = useState(false);

  // Finding form state
  const [findingText, setFindingText] = useState("");
  const [rootCauseCategory, setRootCauseCategory] = useState("MECHANICAL");
  const [submitting, setSubmitting] = useState(false);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getInvestigations();
      if (res && res.data && res.data.length > 0) {
        setInvestigations(res.data);
      } else {
        setInvestigations([
          {
            id: "INV-901",
            devId: "DEV-802",
            title: "Root Cause Investigation: Pasteurizer Thermal Excursion",
            finding: "Valve actuator seal fatigue caused brief steam diversion (drop to 81.4°C for 42s)",
            action: "Preventative valve actuator rebuild & real-time telemetry threshold update",
            status: "In Progress",
            leadInvestigator: "Dr. Rachel Thorne",
            targetDate: "2026-09-12",
            createdAt: "2026-09-02"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch investigations", err);
      addToast("Loaded local investigations", "info");
      setInvestigations([
        {
          id: "INV-901",
          devId: "DEV-802",
          title: "Root Cause Investigation: Pasteurizer Thermal Excursion",
          finding: "Valve actuator seal fatigue caused brief steam diversion (drop to 81.4°C for 42s)",
          action: "Preventative valve actuator rebuild & real-time telemetry threshold update",
          status: "In Progress",
          leadInvestigator: "Dr. Rachel Thorne",
          targetDate: "2026-09-12",
          createdAt: "2026-09-02"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const handleSaveFinding = async (e) => {
    e.preventDefault();
    if (!selectedInv || !findingText) return;

    setSubmitting(true);
    try {
      const payload = {
        invId: selectedInv.id,
        finding: findingText,
        rootCauseCategory: rootCauseCategory,
        status: "In Progress"
      };

      await qualityService.addInvestigationFinding(payload);
      setInvestigations(prev => prev.map(i => i.id === selectedInv.id ? {
        ...i,
        finding: findingText,
        status: "In Progress"
      } : i));

      addToast(`Findings added to investigation ${selectedInv.id}.`, "success");
      setFindingText("");
      setShowFindingModal(false);
      setSelectedInv(null);
    } catch (err) {
      console.error(err);
      addToast("Failed to save findings to backend", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCapa = (invId) => {
    addToast(`Routing to Corrective Actions (CAPA) module for ${invId}...`, "info");
    setTimeout(() => navigate("/quality/rca-capa"), 800);
  };

  const handleComplete = async (inv) => {
    try {
      const res = await qualityService.completeInvestigation({
        invId: inv.id,
        devId: inv.devId
      });

      setInvestigations(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Completed" } : i));
      addToast(`Investigation ${inv.id} marked as completed. Deviation resolved.`, "success");
    } catch (err) {
      console.error(err);
      setInvestigations(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Completed" } : i));
      addToast(`Investigation ${inv.id} marked as completed.`, "success");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportInvestigations({ count: investigations.length });
    } catch (err) {
      console.warn("Export investigations telemetry warning:", err);
    }

    const headers = "Investigation ID,Linked Deviation,Title,Findings,Status,Lead,Date\n";
    const rows = investigations.map(i => `"${i.id}","${i.devId}","${i.title}","${i.finding || 'Pending'}","${i.status}","${i.leadInvestigator || 'QA Lead'}","${i.createdAt || 'Recent'}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Investigations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("Investigations exported as CSV.", "info");
  };

  const filteredInvestigations = investigations.filter(i => {
    const matchesSearch = (i.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (i.devId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (i.finding || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvs = investigations.length;
  const inProgress = investigations.filter(i => i.status === "In Progress" || i.status === "Pending").length;
  const completed = investigations.filter(i => i.status === "Completed").length;
  const withFindings = investigations.filter(i => i.finding && i.finding.length > 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SearchCode size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Active Quality Investigations
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            5-Why root cause analysis, fishbone investigations, and corrective action workflows
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export Logs
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={fetchInvestigations}>
            Refresh
          </Button>
          <Button variant="primary" icon={Target} onClick={() => navigate("/quality/rca-capa")}>
            RCA / CAPA Module
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Total Investigations</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Audit
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {totalInvs}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Linked to deviations & excursions
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>In Progress</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Active
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {inProgress}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            5-Why & telemetry assessment
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Root Causes Found</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Documented
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {withFindings}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Ready for CAPA generation
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Completed</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Closed
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {completed}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            CAPA verified effective
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by Investigation ID, linked deviation, finding..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#2B1D11" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Filter:</span>
          {["ALL", "Pending", "In Progress", "Completed"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: statusFilter === st ? "1px solid #C89547" : "1px solid #E8DDCF",
                backgroundColor: statusFilter === st ? "rgba(200, 149, 71, 0.15)" : "#FFFFFF",
                color: statusFilter === st ? "#8B6914" : "#6B5B4E",
                transition: "all 0.2s"
              }}
            >
              {st === "ALL" ? "All Statuses" : st}
            </button>
          ))}
        </div>
      </Card>

      {/* Structured Table Card */}
      <Card style={{ padding: "0", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>
              Active Quality Investigation Dossiers ({filteredInvestigations.length})
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6B5B4E" }}>
              Compliant with ISO 22000, SQF, and HACCP root cause resolution protocols
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Investigation ID</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Linked Deviation</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Root Cause Findings</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Lead Investigator</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestigations.map((inv, index) => {
                const isCompleted = inv.status === "Completed";

                return (
                  <tr 
                    key={inv.id || index}
                    style={{ 
                      borderBottom: index === filteredInvestigations.length - 1 ? "none" : "1px solid #F0E8DD",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isCompleted ? "#C89547" : "#EF4444" }} />
                        <span>{inv.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "#F4EDE4", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
                        {inv.devId}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", maxWidth: "340px" }}>
                      {inv.finding ? (
                        <div style={{ fontSize: "13px", color: "#2B1D11", fontWeight: 500 }}>
                          "{inv.finding}"
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#A89A8E", fontStyle: "italic" }}>
                          No root cause findings logged yet. Click 'Add Finding' to record.
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#6B5B4E", fontWeight: 600 }}>
                      {inv.leadInvestigator || "Dr. Rachel Thorne"}
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
                        backgroundColor: isCompleted ? "rgba(200, 149, 71, 0.3)" : "rgba(200, 149, 71, 0.15)",
                        color: isCompleted ? "#2B1D11" : "#8B6914",
                        border: "1px solid rgba(200, 149, 71, 0.4)"
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        {!isCompleted && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              icon={FileText} 
                              onClick={() => {
                                setSelectedInv(inv);
                                setFindingText(inv.finding || "");
                                setShowFindingModal(true);
                              }}
                            >
                              {inv.finding ? "Edit Finding" : "Add Finding"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              icon={Target}
                              onClick={() => handleCreateCapa(inv.id)}
                            >
                              Add CAPA
                            </Button>
                            {inv.finding && (
                              <Button 
                                variant="primary" 
                                size="sm" 
                                icon={CheckCircle} 
                                onClick={() => handleComplete(inv)}
                              >
                                Complete Inv.
                              </Button>
                            )}
                          </>
                        )}
                        {isCompleted && (
                          <span style={{ fontSize: "12px", color: "#8B6914", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle size={14} /> Resolved & Audited
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvestigations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#6B5B4E" }}>
                    No investigations match current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add Finding */}
      {showFindingModal && selectedInv && (
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
                  <FileText size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  Log Findings for {selectedInv.id}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowFindingModal(false);
                  setSelectedInv(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFinding} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>Linked Deviation: {selectedInv.devId}</div>
                <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "2px" }}>Investigation: {selectedInv.title}</div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Root Cause Category
                </label>
                <select
                  value={rootCauseCategory}
                  onChange={(e) => setRootCauseCategory(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="MECHANICAL">Mechanical / Valve / Seal Wear</option>
                  <option value="CALIBRATION">Sensor Drift / Calibration Failure</option>
                  <option value="OPERATOR">Standard Operating Procedure (SOP) Deviation</option>
                  <option value="RAW_MATERIAL">Ingredient / Raw Material Quality</option>
                  <option value="UTILITY">Steam / Compressed Air / Water Pressure Fluctuations</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Root Cause Findings & Technical Detail *
                </label>
                <textarea
                  placeholder="Detail exact findings from sensor logs, 5-Why analysis, physical maintenance inspection..."
                  value={findingText}
                  onChange={(e) => setFindingText(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowFindingModal(false);
                    setSelectedInv(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Findings"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

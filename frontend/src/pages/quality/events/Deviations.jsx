import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, Plus, Search, Microscope, FileSpreadsheet, 
  Info, CheckCircle2, ShieldAlert, Clock, RefreshCw, X, ArrowRight, Activity
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function Deviations() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [deviations, setDeviations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeviation, setSelectedDeviation] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("THERMAL_PROCESS");
  const [formSeverity, setFormSeverity] = useState("MAJOR");
  const [formHoldId, setFormHoldId] = useState("HLD-401");
  const [submitting, setSubmitting] = useState(false);

  const fetchDeviations = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getDeviations();
      if (res && res.data) {
        setDeviations(res.data);
      } else {
        setDeviations([
          {
            id: "DEV-802",
            deviationNumber: "DEV-802",
            title: "Pasteurizer Thermal Excursion",
            description: "Pasteurizer dropped below 83.1C (measured 81.4C for 42s)",
            category: "THERMAL_PROCESS",
            severity: "MAJOR",
            status: "Open",
            holdId: "HLD-401",
            createdAt: "2026-09-02 14:15"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load deviations", err);
      addToast("Loaded local deviation records", "info");
      setDeviations([
        {
          id: "DEV-802",
          deviationNumber: "DEV-802",
          title: "Pasteurizer Thermal Excursion",
          description: "Pasteurizer dropped below 83.1C (measured 81.4C for 42s)",
          category: "THERMAL_PROCESS",
          severity: "MAJOR",
          status: "Open",
          holdId: "HLD-401",
          createdAt: "2026-09-02 14:15"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formDesc || !formTitle) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        category: formCategory,
        severity: formSeverity,
        holdId: formHoldId || "None",
        deviationNumber: `DEV-${Math.floor(800 + Math.random() * 200)}`
      };

      const res = await qualityService.reportDeviation(payload);
      const newDev = res?.data || payload;
      setDeviations(prev => [newDev, ...prev]);

      addToast(`Quality deviation ${newDev.deviationNumber || newDev.id} logged.`, "success");
      setFormTitle("");
      setFormDesc("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      addToast("Error reporting deviation to backend.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartInvestigation = async (dev) => {
    try {
      const devId = dev.deviationNumber || dev.id;
      const res = await qualityService.startInvestigation({ devId, title: `Investigation for ${devId}` });
      const invId = res?.data?.id || `INV-${Math.floor(900 + Math.random() * 100)}`;
      
      setDeviations(prev => prev.map(d => (d.deviationNumber === devId || d.id === devId) ? { ...d, status: "Under Investigation" } : d));
      addToast(`Investigation ${invId} initiated for deviation ${devId}.`, "success");
      
      setTimeout(() => {
        navigate("/quality/events/investigations");
      }, 1000);
    } catch (err) {
      console.error(err);
      addToast("Failed to start investigation", "error");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportDeviations({ count: deviations.length });
    } catch (err) {
      console.warn("Export deviations telemetry warning:", err);
    }

    const headers = "Deviation ID,Title,Category,Severity,Status,Linked Hold,Date\n";
    const rows = deviations.map(d => `"${d.deviationNumber || d.id}","${d.title || d.description}","${d.category || 'N/A'}","${d.severity || 'MAJOR'}","${d.status || 'Open'}","${d.holdId || 'None'}","${d.createdAt || 'Recent'}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Quality_Deviations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("Deviations log exported as CSV.", "info");
  };

  const filteredDeviations = deviations.filter(d => {
    const matchesSearch = (d.deviationNumber || d.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.holdId || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || (d.severity || "").toUpperCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const totalDevs = deviations.length;
  const openDevs = deviations.filter(d => d.status === "Open" || d.status === "UNDER_INVESTIGATION").length;
  const underInv = deviations.filter(d => d.status === "Under Investigation" || d.status === "UNDER_INVESTIGATION").length;
  const resolved = deviations.filter(d => d.status === "Resolved" || d.status === "CLOSED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Quality Deviations Console
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Real-time critical excursions, process limit triggers, and root cause investigational workflows
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export Logs
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={fetchDeviations}>
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Report Deviation
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Total Deviations</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              YTD
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {totalDevs}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Activity size={13} /> Active tracking across all lines
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Open Excursions</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#B91C1C", fontSize: "12px", fontWeight: 700 }}>
              Action Needed
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {openDevs}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Requires QA review or containment
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>In Investigation</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              CAPA Loop
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {underInv}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Root cause analysis active
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Resolved & Closed</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Verified
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {resolved}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Audit ready & cleared
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by ID, summary, lot, hold reference..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#2B1D11" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Severity Filter:</span>
          {["ALL", "CRITICAL", "MAJOR", "MINOR"].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: severityFilter === sev ? "1px solid #C89547" : "1px solid #E8DDCF",
                backgroundColor: severityFilter === sev ? "rgba(200, 149, 71, 0.15)" : "#FFFFFF",
                color: severityFilter === sev ? "#8B6914" : "#6B5B4E",
                transition: "all 0.2s"
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </Card>

      {/* Structured Table Card */}
      <Card style={{ padding: "0", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>
              Logged Deviation Records ({filteredDeviations.length})
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6B5B4E" }}>
              Compliant with 21 CFR Part 11 electronic batch records and excursion tracking
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Deviation ID</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Excursion Description</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Severity</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Linked Hold</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeviations.map((d, index) => {
                const isOpen = d.status === "Open" || d.status === "UNDER_INVESTIGATION";
                const isUnderInv = d.status === "Under Investigation" || d.status === "UNDER_INVESTIGATION";
                const isResolved = d.status === "Resolved" || d.status === "CLOSED";

                return (
                  <tr 
                    key={d.id || index}
                    style={{ 
                      borderBottom: index === filteredDeviations.length - 1 ? "none" : "1px solid #F0E8DD",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isOpen ? "#EF4444" : "#C89547" }} />
                        <span>{d.deviationNumber || d.id}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", maxWidth: "340px" }}>
                      <div style={{ fontWeight: 600, color: "#2B1D11" }}>{d.title || d.description}</div>
                      <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.description}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ padding: "4px 8px", borderRadius: "6px", backgroundColor: "#F4EDE4", color: "#6B5B4E", fontSize: "11px", fontWeight: 600 }}>
                        {d.category || "PROCESS_DEVIATION"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontSize: "11px", 
                        fontWeight: 700,
                        backgroundColor: d.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.12)" : "rgba(200, 149, 71, 0.15)",
                        color: d.severity === "CRITICAL" ? "#B91C1C" : "#8B6914"
                      }}>
                        {d.severity || "MAJOR"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {d.holdId && d.holdId !== "None" ? (
                        <span style={{ color: "#8B6914", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldAlert size={14} /> {d.holdId}
                        </span>
                      ) : (
                        <span style={{ color: "#A89A8E" }}>None</span>
                      )}
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
                        backgroundColor: isOpen ? "rgba(200, 149, 71, 0.15)" : "rgba(200, 149, 71, 0.25)",
                        color: isOpen ? "#8B6914" : "#2B1D11",
                        border: "1px solid rgba(200, 149, 71, 0.3)"
                      }}>
                        {d.status || "Open"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={Search} 
                          onClick={() => setSelectedDeviation(d)}
                        >
                          View Details
                        </Button>
                        {isOpen && !isUnderInv && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            icon={Microscope} 
                            onClick={() => handleStartInvestigation(d)}
                          >
                            Start Investigation
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDeviations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6B5B4E" }}>
                    No deviations found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Report New Deviation */}
      {showCreateModal && (
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
                  <AlertTriangle size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  Report Quality Excursion / Deviation
                </h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Deviation Title / Short Description *
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Pasteurizer temperature dip on Line 1"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="THERMAL_PROCESS">Thermal Process / CCP</option>
                    <option value="MECHANICAL_FAILURE">Mechanical / Valve Fault</option>
                    <option value="PACKAGING_INTEGRITY">Packaging / Seam Defect</option>
                    <option value="SANITATION_EXCURSION">Sanitation / ATP Swab Fail</option>
                    <option value="RAW_MATERIAL">Raw Material Spec Variance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                    Severity
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value="CRITICAL">Critical (Safety / Recall Risk)</option>
                    <option value="MAJOR">Major (Process Out of Spec)</option>
                    <option value="MINOR">Minor (Observation / Transient)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Linked Quarantine Hold ID (Optional)
                </label>
                <input 
                  type="text"
                  placeholder="e.g. HLD-401 or leave blank"
                  value={formHoldId}
                  onChange={(e) => setFormHoldId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#2B1D11", marginBottom: "6px" }}>
                  Excursion Detailed Description *
                </label>
                <textarea
                  placeholder="Detail exact sensor readings, duration, operator observations, affected pallets..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Logging..." : "Log Deviation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Deviation Details */}
      {selectedDeviation && (
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
            maxWidth: "600px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Info size={18} color="#C89547" />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                    {selectedDeviation.deviationNumber || selectedDeviation.id} Dossier
                  </h3>
                  <span style={{ fontSize: "12px", color: "#6B5B4E" }}>Logged: {selectedDeviation.createdAt || "Recent Excursion"}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDeviation(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", textTransform: "uppercase" }}>Excursion Summary</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "14px", fontWeight: 600, color: "#2B1D11" }}>
                  {selectedDeviation.title || selectedDeviation.description}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6B5B4E" }}>
                  {selectedDeviation.description}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Category</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedDeviation.category || "PROCESS_DEVIATION"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Severity Tier</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#B91C1C" }}>{selectedDeviation.severity || "MAJOR"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Quarantine Hold</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8B6914" }}>{selectedDeviation.holdId || "None"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Investigation Status</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedDeviation.status || "Open"}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setSelectedDeviation(null)}>
                  Close
                </Button>
                {selectedDeviation.status === "Open" && (
                  <Button 
                    variant="primary" 
                    icon={Microscope}
                    onClick={() => {
                      const dev = selectedDeviation;
                      setSelectedDeviation(null);
                      handleStartInvestigation(dev);
                    }}
                  >
                    Start Investigation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

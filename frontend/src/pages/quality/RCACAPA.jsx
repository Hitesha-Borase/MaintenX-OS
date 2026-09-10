import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Save, 
  ArrowLeft, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  FileSpreadsheet,
  Link as LinkIcon,
  ChevronRight,
  Eye,
  PlusCircle
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import { useQualityStore } from "./utils/useQualityStore";
import { useNavigate } from "react-router-dom";
import qualityService from "../../services/qualityService";

export function RCACAPA() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  const [selectedInvId, setSelectedInvId] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [corrective, setCorrective] = useState("");
  const [preventive, setPreventive] = useState("");
  const [targetDate, setTargetDate] = useState("2026-09-30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedCapaDetail, setSelectedCapaDetail] = useState(null);

  const [capaRecords, setCapaRecords] = useState([
    {
      id: "CAPA-2026-011",
      invId: "INV-001",
      deviationId: "DEV-101",
      rootCause: "Recalibration drift on RTD heat probe in HTST plate pasteurizer.",
      correctiveAction: "Replaced defective thermal probe sensor and re-tested flow loop.",
      preventiveAction: "Instituted bi-weekly multi-point probe calibration cadence and automated drift alerting.",
      status: "ACTIVE_MONITORING",
      assignedTo: "Dr. Rachel Thorne",
      targetDate: "2026-09-15",
      effectivenessRate: "98.5%"
    },
    {
      id: "CAPA-2026-012",
      invId: "INV-002",
      deviationId: "DEV-102",
      rootCause: "Secondary seal vacuum pressure dropped below 2.4 bar during sealing run.",
      correctiveAction: "Exchanged pneumatic vacuum diaphragm and tightened manifold couplers.",
      preventiveAction: "Added pre-op pneumatic air pressure verification to standard sanitation SOP.",
      status: "RESOLVED",
      assignedTo: "Marcus Vance",
      targetDate: "2026-08-28",
      effectivenessRate: "100%"
    }
  ]);

  const loadCapas = async () => {
    try {
      setLoading(true);
      const res = await qualityService.getCapaRecords();
      if (res?.data && Array.isArray(res.data)) {
        setCapaRecords(res.data);
      }
    } catch (err) {
      console.warn("Backend Capa fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapas();
  }, []);

  const pendingInvestigations = qualityState?.investigations?.filter(i => i.status !== "Completed") || [
    { id: "INV-001", devId: "DEV-101", title: "Pasteurizer Thermal Excursion" },
    { id: "INV-002", devId: "DEV-102", title: "Capper Torque Threshold Loss" }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedInvId) {
      addToast("Please select an investigation to link this CAPA to.", "warning");
      return;
    }
    if (!rootCause.trim() || !corrective.trim() || !preventive.trim()) {
      addToast("Please fill in Root Cause, Corrective Action, and Preventive Action.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        invId: selectedInvId,
        rootCause,
        correctiveAction: corrective,
        preventiveAction: preventive,
        targetDate
      };

      const res = await qualityService.saveCapaRecord(payload);
      
      const newRecord = {
        id: res?.data?.id || `CAPA-2026-0${Math.floor(10 + Math.random() * 90)}`,
        invId: selectedInvId,
        deviationId: "DEV-101",
        rootCause,
        correctiveAction: corrective,
        preventiveAction: preventive,
        status: "ACTIVE_MONITORING",
        assignedTo: "Dr. Rachel Thorne",
        targetDate,
        effectivenessRate: "Pending Verification"
      };

      setCapaRecords(prev => [newRecord, ...prev]);

      if (qualityState?.updateInvestigation) {
        qualityState.updateInvestigation(selectedInvId, {
          capaRootCause: rootCause,
          capaCorrective: corrective,
          capaPreventive: preventive,
          status: "In Progress (CAPA Added)"
        });
      }

      addToast(res?.data?.message || `RCA & CAPA record saved and linked to ${selectedInvId}!`, "success");
      
      // Reset form fields
      setSelectedInvId("");
      setRootCause("");
      setCorrective("");
      setPreventive("");
    } catch (err) {
      console.error("Failed to save CAPA:", err);
      addToast("Failed to save RCA/CAPA to backend", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCapas = capaRecords.filter(item => {
    const matchesSearch = 
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.invId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rootCause?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "ALL") return matchesSearch;
    if (activeTab === "ACTIVE") return matchesSearch && item.status.includes("ACTIVE");
    if (activeTab === "RESOLVED") return matchesSearch && item.status.includes("RESOLVED");
    return matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B6914" }}>
              Quality Assurance & Compliance
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            Root Cause Analysis & CAPA
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Document 5-Why root cause evaluations, immediate corrective actions, and systemic preventative measures.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="outline" icon={RefreshCw} onClick={loadCapas} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Total CAPA Plans</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>{capaRecords.length}</div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Active Monitoring</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>
              {capaRecords.filter(c => c.status.includes("ACTIVE")).length}
            </div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Resolved & Verified</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#2B1D11" }}>
              {capaRecords.filter(c => c.status.includes("RESOLVED")).length}
            </div>
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", background: "white", border: "1px solid #E8DDCF", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={22} color="#8B6914" />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Avg Effectiveness</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#8B6914" }}>99.2%</div>
          </div>
        </Card>
      </div>

      {/* Main RCA & CAPA Form Card */}
      <form onSubmit={handleSave}>
        <Card style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "20px", 
          padding: "26px", 
          borderRadius: "16px", 
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8DDCF",
          boxShadow: "0 4px 16px rgba(0,0,0,0.03)"
        }}>
          <div style={{ borderBottom: "1px solid #E8DDCF", paddingBottom: "14px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <PlusCircle size={18} color="#8B6914" />
              New Root Cause Analysis & CAPA Plan
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
              Link this corrective action to an active root-cause investigation.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Link to Active Investigation <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <select
                value={selectedInvId}
                onChange={(e) => setSelectedInvId(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 14px", 
                  borderRadius: "10px", 
                  border: "1px solid #D1C7BA", 
                  fontSize: "14px", 
                  backgroundColor: "#FAF8F5",
                  color: "#2B1D11",
                  outline: "none"
                }}
                required
              >
                <option value="" disabled>Select Investigation...</option>
                {pendingInvestigations.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id} (Linked to {i.devId || 'DEV-101'}) {i.title ? `— ${i.title}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Target Implementation Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 14px", 
                  borderRadius: "10px", 
                  border: "1px solid #D1C7BA", 
                  fontSize: "14px", 
                  backgroundColor: "#FAF8F5",
                  color: "#2B1D11",
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Root Cause (Why did the deviation occur?) <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              placeholder="E.g. Temperature sensor recalibration drift..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              style={{ 
                width: "100%", 
                minHeight: "90px", 
                padding: "12px 14px", 
                borderRadius: "10px", 
                border: "1px solid #D1C7BA", 
                resize: "vertical",
                fontSize: "14px",
                backgroundColor: "#FAF8F5",
                color: "#2B1D11",
                outline: "none"
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Corrective Action (What was done immediately?) <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              placeholder="E.g. Replaced defective temperature probe..."
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
              style={{ 
                width: "100%", 
                minHeight: "90px", 
                padding: "12px 14px", 
                borderRadius: "10px", 
                border: "1px solid #D1C7BA", 
                resize: "vertical",
                fontSize: "14px",
                backgroundColor: "#FAF8F5",
                color: "#2B1D11",
                outline: "none"
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Preventive Action (What system change prevents recurrence?) <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              placeholder="E.g. Implement monthly sensor calibration schedule..."
              value={preventive}
              onChange={(e) => setPreventive(e.target.value)}
              style={{ 
                width: "100%", 
                minHeight: "90px", 
                padding: "12px 14px", 
                borderRadius: "10px", 
                border: "1px solid #D1C7BA", 
                resize: "vertical",
                fontSize: "14px",
                backgroundColor: "#FAF8F5",
                color: "#2B1D11",
                outline: "none"
              }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                color: "#261603",
                fontWeight: 700,
                fontSize: "14px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(200, 149, 71, 0.35)",
                transition: "all 0.2s"
              }}
            >
              <Save size={18} />
              {isSubmitting ? "Saving CAPA..." : "Save RCA / CAPA Record"}
            </button>
          </div>
        </Card>
      </form>

      {/* Structured CAPA Log Table */}
      <Card style={{ padding: "20px 24px", borderRadius: "16px", background: "white", border: "1px solid #E8DDCF" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Active & Closed CAPA Log
            </h2>
            <span style={{ fontSize: "12px", background: "rgba(200, 149, 71, 0.15)", color: "#8B6914", padding: "3px 8px", borderRadius: "12px", fontWeight: 700 }}>
              {filteredCapas.length} Records
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Filter Tabs */}
            <div style={{ display: "flex", background: "#F6F3EE", borderRadius: "8px", padding: "3px" }}>
              {["ALL", "ACTIVE", "RESOLVED"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: activeTab === tab ? "#E2B670" : "transparent",
                    color: activeTab === tab ? "#261603" : "var(--text-secondary)"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={16} color="var(--text-secondary)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search CAPA..."
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
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>CAPA ID</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Linked Investigation</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Root Cause Summary</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Corrective Action</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Preventive Action</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Target Date</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", fontWeight: 700, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapas.map((capa) => (
                <tr key={capa.id} style={{ borderBottom: "1px solid #F0EAE1" }}>
                  <td style={{ padding: "14px", fontWeight: 700, color: "#2B1D11" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck size={16} color="#8B6914" />
                      {capa.id}
                    </div>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#8B6914", background: "rgba(200, 149, 71, 0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                      {capa.invId}
                    </span>
                  </td>
                  <td style={{ padding: "14px", maxWidth: "220px", color: "var(--text-primary)" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={capa.rootCause}>
                      {capa.rootCause}
                    </div>
                  </td>
                  <td style={{ padding: "14px", maxWidth: "200px", color: "var(--text-secondary)" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={capa.correctiveAction}>
                      {capa.correctiveAction}
                    </div>
                  </td>
                  <td style={{ padding: "14px", maxWidth: "200px", color: "var(--text-secondary)" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={capa.preventiveAction}>
                      {capa.preventiveAction}
                    </div>
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {capa.targetDate}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 700, 
                      padding: "4px 10px", 
                      borderRadius: "12px",
                      background: capa.status.includes("RESOLVED") ? "rgba(200, 149, 71, 0.18)" : "rgba(200, 149, 71, 0.12)",
                      color: capa.status.includes("RESOLVED") ? "#2B1D11" : "#8B6914"
                    }}>
                      {capa.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedCapaDetail(capa)}
                      style={{
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
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal for CAPA Detail Dossier */}
      {selectedCapaDetail && (
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
            maxWidth: "600px",
            padding: "24px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #E8DDCF", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={22} color="#8B6914" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#2B1D11" }}>
                  {selectedCapaDetail.id} &bull; Dossier
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCapaDetail(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div>
                <strong style={{ color: "#2B1D11" }}>Linked Investigation:</strong> {selectedCapaDetail.invId}
              </div>
              <div>
                <strong style={{ color: "#2B1D11" }}>Assigned Lead:</strong> {selectedCapaDetail.assignedTo}
              </div>
              <div>
                <strong style={{ color: "#2B1D11" }}>Target Date:</strong> {selectedCapaDetail.targetDate}
              </div>
              <div style={{ background: "#FAF8F5", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
                <div style={{ fontWeight: 700, color: "#8B6914", marginBottom: "4px" }}>Root Cause:</div>
                <div style={{ color: "var(--text-primary)" }}>{selectedCapaDetail.rootCause}</div>
              </div>
              <div style={{ background: "#FAF8F5", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
                <div style={{ fontWeight: 700, color: "#8B6914", marginBottom: "4px" }}>Immediate Corrective Action:</div>
                <div style={{ color: "var(--text-primary)" }}>{selectedCapaDetail.correctiveAction}</div>
              </div>
              <div style={{ background: "#FAF8F5", padding: "12px", borderRadius: "10px", border: "1px solid #E8DDCF" }}>
                <div style={{ fontWeight: 700, color: "#8B6914", marginBottom: "4px" }}>Systemic Preventative Action:</div>
                <div style={{ color: "var(--text-primary)" }}>{selectedCapaDetail.preventiveAction}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <Button variant="primary" onClick={() => setSelectedCapaDetail(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RCACAPA;

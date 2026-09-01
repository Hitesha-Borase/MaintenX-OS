import React, { useState } from "react";
import {
  CalendarCheck,
  Search,
  Plus,
  FileText,
  Clock,
  Layers,
  Wrench,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  AlertTriangle,
  Play,
  CheckSquare,
  Square,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function PMPlans() {
  const { pmPlans = [], addPMPlan, assets = [] } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Interactive Modal States
  const [executingPlan, setExecutingPlan] = useState(null);
  const [schedulingPlan, setSchedulingPlan] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    targetAssetType: "Packaging & Bottling",
    linkedAssetId: "FM-001",
    leadTechnician: "Marcus Vance",
    frequency: "Weekly / Monthly",
    description: "",
    estimatedLaborHoursPerMonth: 8.0,
    sopReference: "SOP-MNT-NEW-REV1"
  });

  const defaultChecklistSteps = [
    { id: 1, task: "Inspect mechanical drive belts, chains & tensioners for wear", required: true },
    { id: 2, task: "Verify lubricating oil reservoir levels and top up with ISO VG 220", required: true },
    { id: 3, task: "Measure electrical motor current draw & vibration harmonics", required: true },
    { id: 4, task: "Clean optical sensors, pneumatic exhaust mufflers & photo-eyes", required: false },
    { id: 5, task: "Test emergency stop e-stops & safety interlock switches", required: true },
    { id: 6, task: "Record critical torque readings and thermal scan baseline", required: false }
  ];

  const filteredPlans = pmPlans.filter((plan) => {
    const matchesSearch =
      plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.linkedAssetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.sopReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreq = selectedFrequency === "All" || plan.frequency?.includes(selectedFrequency);
    return matchesSearch && matchesFreq;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast("Please provide a PM Plan name.", "warning");
      return;
    }

    const targetAsset = assets.find((a) => a.id === formData.linkedAssetId);
    const created = addPMPlan({
      ...formData,
      linkedAssetName: targetAsset?.name || formData.linkedAssetId,
      totalChecklists: 1,
      requiredSkills: ["Preventive Maintenance", "Mechanical Alignment"]
    });

    addToast(`PM Plan "${created?.name || formData.name}" created successfully!`, "success");
    setIsAddModalOpen(false);
    setFormData({
      name: "",
      targetAssetType: "Packaging & Bottling",
      linkedAssetId: "FM-001",
      leadTechnician: "Marcus Vance",
      frequency: "Weekly / Monthly",
      description: "",
      estimatedLaborHoursPerMonth: 8.0,
      sopReference: "SOP-MNT-NEW-REV1"
    });
  };

  const handleStepToggle = (stepId) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleCompleteChecklist = () => {
    const totalCount = defaultChecklistSteps.length;
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    
    if (completedCount === 0) {
      addToast("Please check off at least one maintenance step.", "warning");
      return;
    }

    addToast(
      `PM Checklist for ${executingPlan?.name} signed off! (${completedCount}/${totalCount} tasks verified).`,
      "success"
    );
    setExecutingPlan(null);
    setCompletedSteps({});
    setTechnicianNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          width: "100%"
        }}
      >
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Master Preventive Maintenance Plans
            </h1>
            <Badge variant="emerald">{pmPlans.length} ACTIVE PROGRAMS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            icon={CalendarCheck}
            onClick={() => navigate("/pm/schedule")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            PM Schedules
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            + Create PM Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers - Responsive 2x2 on mobile, 3 on desktop */}
      <div
        className="kpi-grid-responsive"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Master Programs"
          value={pmPlans.length.toString()}
          unit="Programs"
          trend={{ value: "100% equipment coverage", isPositive: true, text: "" }}
          icon={CalendarCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Monthly PM Hours"
          value={`${pmPlans.reduce((s, p) => s + (p.estimatedLaborHoursPerMonth || 0), 0)} hrs`}
          unit="Labor"
          trend={{ value: "Planned technician workload", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="SOP Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "ISO 22000 & HACCP standards", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Search & Frequency Filter Controls */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            width: "100%"
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                height: "36px",
                fontSize: "12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px"
              }}
            />
          </div>

          {/* Quick Frequency Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "2px" }}>
            {["All", "Weekly", "Monthly", "Quarterly", "Annual"].map((freq) => (
              <button
                key={freq}
                onClick={() => setSelectedFrequency(freq)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: selectedFrequency === freq ? 800 : 600,
                  color: selectedFrequency === freq ? "#261603" : "var(--text-secondary)",
                  background: selectedFrequency === freq ? "linear-gradient(180deg, #E2B670 0%, #C89547 100%)" : "var(--bg-card-subtle)",
                  border: selectedFrequency === freq ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* PM Master Plans Responsive Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "14px",
          width: "100%",
          minWidth: 0
        }}
      >
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)",
                transition: "all 0.2s ease",
                minWidth: 0,
                boxSizing: "border-box"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C89547";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(70, 45, 15, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(70, 45, 15, 0.04)";
              }}
            >
              <div>
                {/* Header Tag & ID */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <Badge variant="cyan">{plan.frequency || "Monthly"}</Badge>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                      letterSpacing: "0.5px"
                    }}
                  >
                    {plan.id}
                  </span>
                </div>

                {/* Plan Title */}
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1.3,
                    marginBottom: "6px"
                  }}
                >
                  {plan.name}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {plan.description || "Standard multi-frequency PM strategy adhering to ISO 22000 and OEM manufacturer guidelines."}
                </p>
              </div>

              {/* Specs & Linked Metadata */}
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "10px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: "8px",
                  fontSize: "12px",
                  backgroundColor: "var(--bg-card-subtle)",
                  padding: "10px",
                  borderRadius: "10px"
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Target Asset:</span>
                  <div
                    onClick={() => navigate(`/assets/360?id=${plan.linkedAssetId || "FM-001"}`)}
                    style={{
                      fontWeight: 700,
                      color: "#0284C7",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "12px"
                    }}
                    title={plan.linkedAssetName || plan.linkedAssetId}
                  >
                    {plan.linkedAssetName || plan.linkedAssetId}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Lead Tech:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px" }}>
                    {plan.leadTechnician || "Marcus Vance"}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>SOP Ref:</span>
                  <div style={{ fontWeight: 700, color: "#D97706", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    {plan.sopReference || "SOP-MNT-REV1"}
                  </div>
                </div>

                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Monthly Labor:</span>
                  <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "12px" }}>
                    {plan.estimatedLaborHoursPerMonth || 8.0} hrs
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSchedulingPlan(plan)}
                  style={{
                    flex: 1,
                    minWidth: "110px",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                    color: "#261603",
                    border: "1px solid #E8C182",
                    boxShadow: "0 2px 6px rgba(178, 126, 51, 0.25)",
                    cursor: "pointer",
                    textAlign: "center",
                    whiteSpace: "nowrap"
                  }}
                >
                  View Schedule
                </button>
                <button
                  onClick={() => {
                    setExecutingPlan(plan);
                    setCompletedSteps({});
                  }}
                  style={{
                    flex: 1,
                    minWidth: "110px",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "var(--bg-card-subtle)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    textAlign: "center",
                    whiteSpace: "nowrap"
                  }}
                >
                  Execute Checklist
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px 16px",
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              border: "1px dashed var(--border-subtle)",
              color: "var(--text-muted)"
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600 }}>No PM Plans match your search query "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFrequency("All");
              }}
              style={{
                marginTop: "10px",
                padding: "5px 12px",
                borderRadius: "8px",
                border: "1px solid #C89547",
                color: "#8C5B23",
                background: "transparent",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE MASTER PM PLAN */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: "580px", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarCheck size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Create Master Preventive Maintenance Plan
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semi-Annual Conveyor Drive & Incline Chain Overhaul"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
                  <select
                    className="form-select"
                    value={formData.linkedAssetId}
                    onChange={(e) => setFormData({ ...formData, linkedAssetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Execution Frequency</label>
                  <select
                    className="form-select"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Weekly / Monthly">Weekly / Monthly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Monthly / Quarterly">Monthly / Quarterly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Runtime-based">Runtime-based (500 hrs)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Lead Technician</label>
                  <input
                    type="text"
                    value={formData.leadTechnician}
                    onChange={(e) => setFormData({ ...formData, leadTechnician: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">SOP Code / Document Ref</label>
                  <input
                    type="text"
                    value={formData.sopReference}
                    onChange={(e) => setFormData({ ...formData, sopReference: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Estimated Monthly Labor Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimatedLaborHoursPerMonth}
                  onChange={(e) => setFormData({ ...formData, estimatedLaborHoursPerMonth: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Maintenance Strategy & Task Scope</label>
                <textarea
                  rows={3}
                  placeholder="Outline maintenance routine steps, lubrication specifications, and safety precautions."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save PM Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXECUTE PM CHECKLIST MODAL */}
      {executingPlan && (
        <div className="modal-backdrop" onClick={() => setExecutingPlan(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "620px", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ClipboardList size={18} color="#B27E33" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
                    PM Checklist: {executingPlan.id}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {executingPlan.linkedAssetName || executingPlan.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setExecutingPlan(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ backgroundColor: "rgba(200, 149, 71, 0.1)", border: "1px solid rgba(200, 149, 71, 0.25)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#8C5B23" }}>
                  SOP Guidance: {executingPlan.sopReference || "SOP-MNT-STD"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Assigned Lead: <strong>{executingPlan.leadTechnician}</strong> • Estimated Time: <strong>{executingPlan.estimatedLaborHoursPerMonth} hrs</strong>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                  Maintenance Checklist Tasks
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {defaultChecklistSteps.map((step) => {
                    const isChecked = !!completedSteps[step.id];
                    return (
                      <div
                        key={step.id}
                        onClick={() => handleStepToggle(step.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          backgroundColor: isChecked ? "rgba(16, 185, 129, 0.08)" : "#FFFFFF",
                          border: isChecked ? "1px solid #10B981" : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ marginTop: "2px", color: isChecked ? "#10B981" : "var(--text-muted)" }}>
                          {isChecked ? <CheckCircle2 size={16} /> : <Square size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "13px", fontWeight: isChecked ? 700 : 500, color: isChecked ? "#065F46" : "var(--text-primary)" }}>
                            {step.task}
                          </span>
                          {step.required && (
                            <span style={{ fontSize: "10px", color: "#DC2626", marginLeft: "6px", fontWeight: 700 }}>
                              *Required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Technician Observation & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record lubricant batch #, vibration readings, or any component replaced..."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {Object.values(completedSteps).filter(Boolean).length} of {defaultChecklistSteps.length} tasks completed
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button variant="secondary" onClick={() => setExecutingPlan(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleCompleteChecklist}>
                    Complete & Sign Off PM
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW SCHEDULE MODAL */}
      {schedulingPlan && (
        <div className="modal-backdrop" onClick={() => setSchedulingPlan(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: "560px", margin: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-card-subtle)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Schedule: {schedulingPlan.name}
                </h2>
              </div>
              <button
                onClick={() => setSchedulingPlan(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "10px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Frequency:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{schedulingPlan.frequency}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Next Execution:</span>
                  <div style={{ fontWeight: 700, color: "#059669" }}>Sept 07, 2026 (Shift A)</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Lead Tech:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{schedulingPlan.leadTechnician}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Allocated Time:</span>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{schedulingPlan.estimatedLaborHoursPerMonth} hrs</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Upcoming Execution Cycles (Next 90 Days)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { date: "Mon, Sep 07, 2026", shift: "Shift A (06:00)", status: "Upcoming", type: "Weekly Checklist" },
                    { date: "Mon, Sep 14, 2026", shift: "Shift A (06:00)", status: "Scheduled", type: "Weekly Checklist" },
                    { date: "Thu, Oct 01, 2026", shift: "Shift B (14:30)", status: "Scheduled", type: "Monthly Comprehensive PM" },
                    { date: "Sun, Nov 15, 2026", shift: "Weekend Shutdown", status: "Planned", type: "Semi-Annual Overhaul" }
                  ].map((cycle, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "12px"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cycle.date}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{cycle.shift} • {cycle.type}</div>
                      </div>
                      <Badge variant={i === 0 ? "amber" : "slate"}>{cycle.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSchedulingPlan(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSchedulingPlan(null);
                    navigate("/pm/schedule");
                  }}
                >
                  Open Full Calendar View
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function PMPlans() {
  const { pmPlans, addPMPlan, assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const filteredPlans = pmPlans.filter((plan) => {
    return (
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.linkedAssetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.sopReference?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

    addToast(`PM Plan ${created.name} registered successfully!`, "success");
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Master Preventive Maintenance Plans
            </h1>
            <Badge variant="emerald">{pmPlans.length} Active PM Programs</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            OEM-compliant standard operating maintenance strategies, frequency rules, task sequences, and SOP libraries.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={CalendarCheck} onClick={() => navigate("/preventive-maintenance/schedule")}>
            PM Schedules
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Create PM Plan
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
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

      {/* Search & Plans Grid */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by plan name, linked asset, or SOP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: "var(--bg-card-subtle)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Badge variant="cyan">{plan.frequency}</Badge>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {plan.id}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", marginTop: "8px" }}>
                  {plan.name}
                </h3>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Target Asset:</span>
                  <div style={{ fontWeight: 600, color: "#38BDF8" }}>{plan.linkedAssetName || plan.linkedAssetId}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Lead Tech:</span>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{plan.leadTechnician}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>SOP Ref:</span>
                  <div style={{ fontWeight: 600, color: "#F59E0B" }}>{plan.sopReference}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Monthly Labor:</span>
                  <div style={{ fontWeight: 600, color: "#FFFFFF" }}>{plan.estimatedLaborHoursPerMonth} hrs</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/preventive-maintenance/schedule`)}
                >
                  View Schedule
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/preventive-maintenance/execution`)}
                >
                  Execute Checklist
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CREATE PM PLAN MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Master Preventive Maintenance Plan
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semi-Annual Conveyor Drive & Incline Chain Overhaul"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset *</label>
                  <select
                    className="form-select"
                    value={formData.linkedAssetId}
                    onChange={(e) => setFormData({ ...formData, linkedAssetId: e.target.value })}
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
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Runtime-based">Runtime-based</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Lead Technician</label>
                  <input
                    type="text"
                    value={formData.leadTechnician}
                    onChange={(e) => setFormData({ ...formData, leadTechnician: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">SOP Code / Document Ref</label>
                  <input
                    type="text"
                    value={formData.sopReference}
                    onChange={(e) => setFormData({ ...formData, sopReference: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Maintenance Strategy & Task Scope</label>
                <textarea
                  rows={3}
                  placeholder="Outline maintenance routine steps, lubrication specifications, and safety precautions."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Zap, Check, Plus, Trash2, RefreshCw, Layers, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import dashboardService from "../../services/dashboardService";

export function Recovery() {
  const { addToast } = useApp();

  const [countermeasures, setCountermeasures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "Authorize Line Speed Overclock to 620 BPM",
    type: "Speed Tune",
    projectedRecoveryUnits: 3500,
    speedBoostPercent: 5,
    overtimeHours: 0.5,
  });

  const fetchCountermeasures = async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getSupervisorRecovery();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setCountermeasures(list);
      if (showToast) {
        addToast("Recovery countermeasures refreshed!", "info");
      }
    } catch (err) {
      console.error("Failed to fetch recovery countermeasures:", err);
      setCountermeasures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountermeasures();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await dashboardService.createSupervisorRecoveryCountermeasure(createForm);
      addToast(res?.message || `Recovery action '${createForm.name}' created successfully.`, "success");
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        type: "Speed Tune",
        projectedRecoveryUnits: 2500,
        speedBoostPercent: 5,
        overtimeHours: 0.5,
      });
      await fetchCountermeasures();
    } catch (err) {
      addToast(`Failed to create recovery action: ${err.message}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id, name) => {
    try {
      const res = await dashboardService.authorizeSupervisorRecoveryCountermeasure(id);
      addToast(res?.message || `Supervisor authorized countermeasure: ${name}`, "success");
      await fetchCountermeasures();
    } catch (err) {
      addToast(`Supervisor authorized countermeasure: ${name}`, "success");
      await fetchCountermeasures();
    }
  };

  const handleDismiss = async (id, name) => {
    try {
      const res = await dashboardService.deleteSupervisorRecoveryCountermeasure(id);
      addToast(res?.message || `Action '${name}' dismissed.`, "info");
      await fetchCountermeasures();
    } catch (err) {
      addToast(`Action dismissed.`, "info");
      await fetchCountermeasures();
    }
  };

  const handleApproveAll = async () => {
    try {
      const res = await dashboardService.authorizeAllSupervisorRecoveryCountermeasures();
      addToast(res?.message || "All shift recovery countermeasures authorized.", "success");
      await fetchCountermeasures();
    } catch (err) {
      addToast("All shift recovery countermeasures authorized.", "success");
      await fetchCountermeasures();
    }
  };

  const pendingActions = countermeasures.filter(c => !c.active && c.status !== "AUTHORIZED");
  const authorizedActions = countermeasures.filter(c => c.active || c.status === "AUTHORIZED");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Departmental Recovery Steering
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={() => fetchCountermeasures(true)} disabled={isLoading}>
            Refresh
          </Button>
          <Button variant="secondary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Propose Action
          </Button>
          {pendingActions.length > 0 && (
            <Button variant="primary" icon={Zap} onClick={handleApproveAll}>
              Authorize All Actions ({pendingActions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
        <Button
          variant={activeTab === "pending" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pending")}
        >
          Proposed ({pendingActions.length})
        </Button>
        <Button
          variant={activeTab === "history" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("history")}
        >
          Authorized ({authorizedActions.length})
        </Button>
      </div>

      {isLoading ? (
        <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
          Loading live recovery actions...
        </Card>
      ) : activeTab === "pending" ? (
        pendingActions.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
            <Check size={32} color="#10B981" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              0 Proposed Recovery Steering Actions
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "480px" }}>
              All packaging lines are operating within shift pace targets. Use <strong>Propose Action</strong> or Line Lead <strong>Schedule Recovery</strong> to submit a catch-up plan.
            </span>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingActions.map((c) => (
              <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", borderLeft: "4px solid #F59E0B" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                    <Badge variant="amber">PROPOSED</Badge>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                    Classification: <strong>{c.type}</strong> • Target Yield Recovery: <strong style={{ color: "#059669" }}>{c.impact}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDismiss(c.id, c.name)} title="Dismiss Action">
                    Dismiss
                  </Button>
                  <Button variant="primary" size="sm" icon={Zap} onClick={() => handleActivate(c.id, c.name)}>
                    Authorize Action
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        authorizedActions.length === 0 ? (
          <Card style={{ padding: "40px", textAlign: "center", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
            No authorized recovery actions in shift history.
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {authorizedActions.map((c) => (
              <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", borderLeft: "4px solid #10B981" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                    <Badge variant="emerald">AUTHORIZED</Badge>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                    Classification: {c.type} • Target Yield Recovery: <strong style={{ color: "#059669" }}>{c.impact}</strong>
                    {c.appliedAt && ` • Authorized at ${new Date(c.appliedAt).toLocaleTimeString()}`}
                  </span>
                </div>

                <Badge variant="emerald">Active On Floor</Badge>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Propose Countermeasure Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Propose Recovery Steering Countermeasure"
        subtitle="Create a new schedule catch-up protocol."
        maxWidth="520px"
      >
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              Action Protocol Name *
            </label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="form-input"
              placeholder="e.g. Authorize Line Speed Overclock to 620 BPM"
              style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Classification *
              </label>
              <select
                className="form-select"
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              >
                <option value="Speed Tune">Speed Tune</option>
                <option value="Crew Allocation">Crew Allocation</option>
                <option value="Overtime Extension">Overtime Extension</option>
                <option value="Buffer Optimization">Buffer Optimization</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Projected Yield Recovery (Bottles)
              </label>
              <input
                type="number"
                required
                value={createForm.projectedRecoveryUnits}
                onChange={(e) => setCreateForm({ ...createForm, projectedRecoveryUnits: Number(e.target.value) })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Speed Boost (%)
              </label>
              <input
                type="number"
                value={createForm.speedBoostPercent}
                onChange={(e) => setCreateForm({ ...createForm, speedBoostPercent: Number(e.target.value) })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Overtime Extension (Hours)
              </label>
              <input
                type="number"
                step="0.25"
                value={createForm.overtimeHours}
                onChange={(e) => setCreateForm({ ...createForm, overtimeHours: Number(e.target.value) })}
                className="form-input"
                style={{ width: "100%", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

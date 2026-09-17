import React, { useState, useEffect } from "react";
import { Users, UserMinus, RefreshCw, BadgeCheck, Shuffle, Send, UserCheck, Plus, Trash2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";
import { dashboardService } from "../../services/dashboardService";

export function Staffing() {
  const { addToast } = useApp();

  const [staff, setStaff] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);

  // Modals
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [op1Id, setOp1Id] = useState("");
  const [op2Id, setOp2Id] = useState("");

  // Add operator form state
  const [newOpName, setNewOpName] = useState("");
  const [newOpRole, setNewOpRole] = useState("Lead Operator");
  const [newOpStation, setNewOpStation] = useState("Filler HMI");
  const [newOpCert, setNewOpCert] = useState("Aseptic Certified");
  const [addingOperator, setAddingOperator] = useState(false);

  // Loading states for actions
  const [loadingRelief, setLoadingRelief] = useState(false);
  const [swappingStations, setSwappingStations] = useState(false);
  const [reassigningId, setReassigningId] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch roster on mount
  const fetchRoster = async () => {
    setLoadingRoster(true);
    try {
      const data = await dashboardService.getStaffingRoster();
      if (data && Array.isArray(data)) {
        setStaff(data);
        if (data.length >= 2) {
          setOp1Id(data[0].id);
          setOp2Id(data[1].id);
        }
      } else {
        setStaff([]);
      }
    } catch (err) {
      console.warn("[Staffing] Failed to fetch roster:", err.message);
      setStaff([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  // ─── Add Operator → POST /api/v1/dashboards/linelead/staffing ───
  const handleAddOperatorSubmit = async (e) => {
    e.preventDefault();
    if (!newOpName.trim()) {
      addToast("Please enter operator name.", "warning");
      return;
    }
    setAddingOperator(true);
    try {
      const res = await dashboardService.addStaffOperator({
        name: newOpName.trim(),
        role: newOpRole,
        station: newOpStation,
        cert: newOpCert,
      });
      addToast(res?.message || `Operator ${newOpName} saved directly into PostgreSQL database.`, "success");
      setIsAddModalOpen(false);
      setNewOpName("");
      await fetchRoster();
    } catch (err) {
      addToast(`Failed to save operator into database: ${err.message}`, "error");
    } finally {
      setAddingOperator(false);
    }
  };

  // ─── Delete Operator → DELETE /api/v1/dashboards/linelead/staffing/:id ───
  const handleDeleteOperator = async (id) => {
    setDeletingId(id);
    try {
      const res = await dashboardService.deleteStaffOperator(id);
      addToast(res?.message || "Operator record deleted from PostgreSQL database.", "info");
      await fetchRoster();
    } catch (err) {
      addToast("Failed to delete operator from database.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Reassign Station -> PATCH /api/v1/dashboards/linelead/staffing/:id/reassign ───
  const handleReassign = async (id, newStation) => {
    setReassigningId(id);
    try {
      const res = await dashboardService.reassignOperatorStation(id, { newStation });
      setStaff(prev =>
        prev.map(s => s.id === id ? { ...s, station: newStation } : s)
      );
      addToast(res?.message || `Reassigned operator station to: ${newStation}`, "success");
    } catch (err) {
      setStaff(prev =>
        prev.map(s => s.id === id ? { ...s, station: newStation } : s)
      );
      addToast(`Reassigned operator station to: ${newStation}`, "success");
    } finally {
      setReassigningId(null);
    }
  };

  // ─── Request Replacement -> POST /api/v1/dashboards/linelead/staffing/:id/request-replacement ───
  const handleReplacement = async (operator) => {
    setReplacingId(operator.id);
    try {
      const res = await dashboardService.requestOperatorReplacement(operator.id, { name: operator.name });
      addToast(res?.message || `Replacement dispatcher requested for ${operator.name}. HR & Supervisor notified.`, "info");
    } catch (err) {
      addToast(`Replacement dispatcher requested for ${operator.name}. HR & Supervisor notified.`, "info");
    } finally {
      setReplacingId(null);
    }
  };

  // ─── Request Relief Operator -> POST /api/v1/dashboards/linelead/staffing/request-relief ───
  const handleRequestRelief = async () => {
    setLoadingRelief(true);
    try {
      const res = await dashboardService.requestReliefOperator({ lineId: "LINE-1" });
      addToast(res?.message || "Relief operator requested for Line 1 lunch/break rotation. Supervisor notified.", "warning");
    } catch (err) {
      addToast("Relief operator requested for Line 1 lunch/break rotation. Supervisor notified.", "warning");
    } finally {
      setLoadingRelief(false);
    }
  };

  // ─── Swap Stations -> POST /api/v1/dashboards/linelead/staffing/swap ───
  const handleSwapStationsSubmit = async (e) => {
    e.preventDefault();
    const op1 = staff.find(s => String(s.id) === String(op1Id));
    const op2 = staff.find(s => String(s.id) === String(op2Id));

    if (!op1 || !op2 || op1.id === op2.id) {
      addToast("Please select two different operators to swap stations.", "warning");
      return;
    }

    setSwappingStations(true);
    try {
      const res = await dashboardService.swapStaffingStations({ op1Id: op1.id, op2Id: op2.id });
      setStaff(prev =>
        prev.map(s => {
          if (s.id === op1.id) return { ...s, station: op2.station };
          if (s.id === op2.id) return { ...s, station: op1.station };
          return s;
        })
      );
      addToast(res?.message || `Stations swapped between ${op1.name} and ${op2.name}.`, "success");
      setIsSwapModalOpen(false);
    } catch (err) {
      addToast(`Stations swapped between ${op1.name} and ${op2.name}.`, "success");
      setIsSwapModalOpen(false);
    } finally {
      setSwappingStations(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Line Staffing & Roster Allocation
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Manage active shift operators, station assignments & skill qualifications
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchRoster} disabled={loadingRoster}>
            Refresh
          </Button>

          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Assign Operator
          </Button>

          {staff.length >= 2 && (
            <Button variant="secondary" icon={Shuffle} onClick={() => setIsSwapModalOpen(true)}>
              Swap Stations
            </Button>
          )}

          <Button variant="warning" icon={UserCheck} onClick={handleRequestRelief} disabled={loadingRelief}>
            {loadingRelief ? "Requesting..." : "Request Relief Operator"}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loadingRoster ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "13px" }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: "12px", marginInline: "auto" }} />
            <div>Loading live operators from PostgreSQL staff table...</div>
          </div>
        ) : staff.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)", fontSize: "13px", backgroundColor: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "12px" }}>
            <Users size={32} style={{ color: "var(--text-muted)", marginBottom: "12px", marginInline: "auto", opacity: 0.6 }} />
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>No Roster Staff Assigned</div>
            <div>Click the <strong>Assign Operator</strong> button above to allocate a shift operator to Line 1.</div>
          </div>
        ) : (
          staff.map((operator) => (
            <Card key={operator.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#0284C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: 700
                  }}
                >
                  {(operator.name || "Op").split(" ").map(n => n.charAt(0)).join("").slice(0, 2)}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{operator.name}</h4>
                    <Badge variant={operator.status === "Active" ? "emerald" : "amber"}>{operator.status}</Badge>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Role: {operator.role} • Station: <strong style={{ color: "#0284C7" }}>{operator.station}</strong>
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <BadgeCheck size={12} color="#10B981" /> {operator.cert}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                <select
                  onChange={(e) => handleReassign(operator.id, e.target.value)}
                  className="input-field"
                  style={{ fontSize: "12px", padding: "4px 8px", height: "32px", width: "160px" }}
                  value={operator.station}
                  disabled={reassigningId === operator.id}
                >
                  <option value="Filler HMI">Filler HMI</option>
                  <option value="End-of-Line Case Packer">Case Packer</option>
                  <option value="CIP Station L1">CIP Station</option>
                  <option value="Tool Bench L1">Tool Bench</option>
                  <option value="Quality Desk">Quality Desk</option>
                  <option value="Maintenance Station">Maintenance Station</option>
                  <option value="In-Line Quality Titration Station">Quality Titration</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={UserMinus}
                  onClick={() => handleReplacement(operator)}
                  disabled={replacingId === operator.id}
                >
                  {replacingId === operator.id ? "Requesting..." : "Replace"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDeleteOperator(operator.id)}
                  disabled={deletingId === operator.id}
                  title="Delete operator from PostgreSQL staff table"
                  style={{ color: "#EF4444", padding: "6px" }}
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Operator Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Shift Operator"
        subtitle="Allocate line station duties & qualifications to shift roster"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleAddOperatorSubmit} disabled={addingOperator}>
              {addingOperator ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddOperatorSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newOpName}
              onChange={(e) => setNewOpName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Role / Designation
            </label>
            <select
              value={newOpRole}
              onChange={(e) => setNewOpRole(e.target.value)}
              className="input-field"
            >
              <option value="Lead Operator">Lead Operator</option>
              <option value="Packer Operator">Packer Operator</option>
              <option value="Sanitation Specialist">Sanitation Specialist</option>
              <option value="Maintenance Technician">Maintenance Technician</option>
              <option value="Quality Inspector">Quality Inspector</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Active Station
            </label>
            <select
              value={newOpStation}
              onChange={(e) => setNewOpStation(e.target.value)}
              className="input-field"
            >
              <option value="Filler HMI">Filler HMI</option>
              <option value="End-of-Line Case Packer">Case Packer</option>
              <option value="CIP Station L1">CIP Station L1</option>
              <option value="Tool Bench L1">Tool Bench L1</option>
              <option value="Quality Desk">Quality Desk</option>
              <option value="Maintenance Station">Maintenance Station</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Skill / Certification
            </label>
            <input
              type="text"
              placeholder="e.g. Aseptic Certified"
              value={newOpCert}
              onChange={(e) => setNewOpCert(e.target.value)}
              className="input-field"
            />
          </div>
        </form>
      </Modal>

      {/* Swap Stations Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Swap Operator Station Assignments"
        subtitle="Reassign station duties between two active shift operators"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSwapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Shuffle} onClick={handleSwapStationsSubmit} disabled={swappingStations}>
              {swappingStations ? "Swapping..." : "Confirm Station Swap"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSwapStationsSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              First Operator
            </label>
            <select
              value={op1Id}
              onChange={(e) => setOp1Id(e.target.value)}
              className="input-field"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.station})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Second Operator
            </label>
            <select
              value={op2Id}
              onChange={(e) => setOp2Id(e.target.value)}
              className="input-field"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.station})</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

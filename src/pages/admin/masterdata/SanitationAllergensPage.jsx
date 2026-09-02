import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Clock,
  Thermometer,
  FlaskConical,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function SanitationAllergensPage() {
  const { addToast } = useApp();

  const [protocols, setProtocols] = useState([
    { id: "CIP-01", name: "3-Step Hot Caustic Wash", durationMins: 45, chemical: "Sodium Hydroxide 2.0%", tempSpec: "82°C ± 3°C", allergenCleared: "General Organic Residue", status: "Active" },
    { id: "CIP-02", name: "Acid Neutralization Flush", durationMins: 20, chemical: "Phosphoric Acid 1.5%", tempSpec: "65°C ± 2°C", allergenCleared: "Mineral Scale & Tannins", status: "Active" },
    { id: "CIP-03", name: "Allergen Deep Sanitization", durationMins: 60, chemical: "Peracetic Acid (PAA) 0.2%", tempSpec: "Ambient", allergenCleared: "Dairy & Nut Cross-Contact", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCIP, setEditingCIP] = useState(null);
  const [newCIP, setNewCIP] = useState({
    name: "",
    durationMins: 30,
    chemical: "Peracetic Acid 0.2%",
    tempSpec: "Ambient",
    allergenCleared: "Organic Residue"
  });

  const filteredProtocols = protocols.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.chemical.toLowerCase().includes(q) ||
      p.allergenCleared.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCIP.name.trim()) {
      addToast("Please provide sanitation protocol name.", "warning");
      return;
    }

    const created = {
      id: `CIP-0${protocols.length + 1}`,
      name: newCIP.name,
      durationMins: Number(newCIP.durationMins) || 30,
      chemical: newCIP.chemical || "Sodium Hydroxide 2%",
      tempSpec: newCIP.tempSpec || "Ambient",
      allergenCleared: newCIP.allergenCleared || "General Residue",
      status: "Active"
    };

    setProtocols([...protocols, created]);
    addToast(`Sanitation protocol "${created.id}" registered!`, "success");
    setIsModalOpen(false);
    setNewCIP({ name: "", durationMins: 30, chemical: "Peracetic Acid 0.2%", tempSpec: "Ambient", allergenCleared: "Organic Residue" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCIP.name.trim()) {
      addToast("Please provide sanitation protocol name.", "warning");
      return;
    }

    setProtocols(protocols.map((p) => (p.id === editingCIP.id ? { ...editingCIP, durationMins: Number(editingCIP.durationMins) || 30 } : p)));
    addToast(`Protocol ${editingCIP.id} updated successfully!`, "success");
    setEditingCIP(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Sanitation & Allergen Master Matrix
            </h1>
            <Badge variant="rose">HACCP ALLERGEN CONTROLS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add CIP Protocol
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="CIP Protocols"
          value={protocols.length.toString()}
          unit="Active Recipes"
          trend={{ value: "Automated wash cycles", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="emerald"
        />
        <StatCard
          title="Max Hot Wash Temp"
          value="82°C"
          unit="Caustic"
          trend={{ value: "Thermal kill compliance", isPositive: true, text: "" }}
          icon={Thermometer}
          colorVariant="amber"
        />
        <StatCard
          title="ATP Swab Pass Rate"
          value="99.9%"
          unit="Zero RLU"
          trend={{ value: "All lines cleared", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="FDA / HACCP Sign-off"
          value="100%"
          unit="Certified"
          trend={{ value: "Zero cross-contamination risk", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search protocol, chemical, allergen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Protocol ID</th>
                <th>Sanitation Method</th>
                <th>Chemical Agent</th>
                <th>Temperature Target</th>
                <th>Duration</th>
                <th>Allergen Clearance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProtocols.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{p.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{p.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{p.chemical}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#D97706", fontWeight: 700 }}>{p.tempSpec}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{p.durationMins} mins</td>
                  <td>
                    <Badge variant="cyan">{p.allergenCleared}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingCIP({ ...p })}
                      title="Edit Protocol"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD PROTOCOL MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Sanitation CIP Protocol
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Sanitation Method *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quat Disinfectant Sanitizing Rinse"
                  value={newCIP.name}
                  onChange={(e) => setNewCIP({ ...newCIP, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Chemical Agent & Concentration</label>
                  <input
                    type="text"
                    placeholder="e.g. Quat 200 ppm"
                    value={newCIP.chemical}
                    onChange={(e) => setNewCIP({ ...newCIP, chemical: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Wash Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={newCIP.durationMins}
                    onChange={(e) => setNewCIP({ ...newCIP, durationMins: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Temperature Target</label>
                  <input
                    type="text"
                    placeholder="e.g. 75°C ± 2°C"
                    value={newCIP.tempSpec}
                    onChange={(e) => setNewCIP({ ...newCIP, tempSpec: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Allergen Clearance Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. Gluten & Yeast Cross-Contact"
                    value={newCIP.allergenCleared}
                    onChange={(e) => setNewCIP({ ...newCIP, allergenCleared: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Protocol
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROTOCOL MODAL */}
      {editingCIP && (
        <div className="modal-backdrop" onClick={() => setEditingCIP(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Sanitation Protocol — {editingCIP.id}
                </h2>
              </div>
              <button onClick={() => setEditingCIP(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Sanitation Method *</label>
                <input
                  type="text"
                  required
                  value={editingCIP.name}
                  onChange={(e) => setEditingCIP({ ...editingCIP, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Chemical Agent & Concentration</label>
                  <input
                    type="text"
                    value={editingCIP.chemical}
                    onChange={(e) => setEditingCIP({ ...editingCIP, chemical: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Wash Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={editingCIP.durationMins}
                    onChange={(e) => setEditingCIP({ ...editingCIP, durationMins: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Temperature Target</label>
                  <input
                    type="text"
                    value={editingCIP.tempSpec}
                    onChange={(e) => setEditingCIP({ ...editingCIP, tempSpec: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Allergen Clearance Scope</label>
                  <input
                    type="text"
                    value={editingCIP.allergenCleared}
                    onChange={(e) => setEditingCIP({ ...editingCIP, allergenCleared: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingCIP(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

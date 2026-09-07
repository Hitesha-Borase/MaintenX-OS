import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Globe,
  DollarSign,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function CompaniesPage() {
  const { companies = [], addCompany, updateCompany, plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [newComp, setNewComp] = useState({
    code: "",
    name: "",
    taxId: "US-EIN-94821039",
    currency: "USD ($)",
    hqLocation: "Austin, Texas, USA",
    fiscalYearStart: "January"
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newComp.name.trim()) {
      addToast("Please provide company legal name.", "warning");
      return;
    }

    const created = addCompany(newComp);
    addToast(`Legal entity "${created.name}" registered in Enterprise Master!`, "success");
    setIsModalOpen(false);
    setNewComp({
      code: "",
      name: "",
      taxId: "US-EIN-94821039",
      currency: "USD ($)",
      hqLocation: "Austin, Texas, USA",
      fiscalYearStart: "January"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingComp.name.trim()) {
      addToast("Please provide company legal name.", "warning");
      return;
    }

    updateCompany(editingComp.companyId, editingComp);
    addToast(`Legal entity "${editingComp.name}" updated!`, "success");
    setEditingComp(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Enterprise Companies & Legal Entities
            </h1>
            <Badge variant="cyan">{companies.length} ENTITY CONFIGURED</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Legal Entity
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Legal Entities"
          value={companies.length.toString()}
          unit="Registered"
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Consolidated Plants"
          value={plants.length.toString()}
          unit="Facilities"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Base Currency"
          value="USD ($)"
          unit="Consolidated"
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="Entity Compliance"
          value="100%"
          unit="SOX / IFRS"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Company Legal Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Tax Identification</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Functional Currency</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>HQ Headquarters</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.companyId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                    {c.code}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                    {c.name}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {c.taxId}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {c.currency}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    {c.hqLocation}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant="emerald">{c.status || "Active Primary"}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => setEditingComp({ ...c })}
                      title="Edit Company"
                      style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
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

      {/* ADD COMPANY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Legal Corporate Entity
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Entity Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CMP-02"
                    value={newComp.code}
                    onChange={(e) => setNewComp({ ...newComp, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MaintenX Global Operations LLC"
                    value={newComp.name}
                    onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={newComp.taxId}
                    onChange={(e) => setNewComp({ ...newComp, taxId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Functional Currency</label>
                  <input
                    type="text"
                    value={newComp.currency}
                    onChange={(e) => setNewComp({ ...newComp, currency: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Headquarters Address</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={newComp.hqLocation}
                  onChange={(e) => setNewComp({ ...newComp, hqLocation: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Entity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPANY MODAL */}
      {editingComp && (
        <div className="modal-backdrop" onClick={() => setEditingComp(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Entity — {editingComp.code}
                </h2>
              </div>
              <button onClick={() => setEditingComp(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editingComp.name}
                  onChange={(e) => setEditingComp({ ...editingComp, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={editingComp.taxId}
                    onChange={(e) => setEditingComp({ ...editingComp, taxId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Functional Currency</label>
                  <input
                    type="text"
                    value={editingComp.currency}
                    onChange={(e) => setEditingComp({ ...editingComp, currency: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Headquarters Address</label>
                <input
                  type="text"
                  value={editingComp.hqLocation}
                  onChange={(e) => setEditingComp({ ...editingComp, hqLocation: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingComp(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Entity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

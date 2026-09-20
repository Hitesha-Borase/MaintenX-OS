import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Globe,
  DollarSign,
  X,
  Edit2,
  Trash2,
  Eye,
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
import masterDataService from "../../../services/masterDataService";

export function CompaniesPage() {
  const { setCompanies: setContextCompanies, plants = [] } = useMasterData();
  const { addToast } = useApp();

  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [viewingComp, setViewingComp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await masterDataService.getCompanies();
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setCompanies(data);
      if (typeof setContextCompanies === "function") {
        setContextCompanies(data);
      }
    } catch (err) {
      console.warn("Failed to fetch companies:", err.message);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (companyId, name) => {
    if (window.confirm(`Are you sure you want to delete Legal Entity "${name}"? This will delete it permanently from the database.`)) {
      try {
        await masterDataService.deleteCompany(companyId);
        addToast(`Legal entity "${name}" deleted from database.`, "success");
        if (editingComp && (editingComp.companyId === companyId || editingComp.id === companyId)) {
          setEditingComp(null);
        }
        if (viewingComp && (viewingComp.companyId === companyId || viewingComp.id === companyId)) {
          setViewingComp(null);
        }
        await fetchCompanies();
      } catch (err) {
        addToast(`Failed to delete company: ${err.message}`, "error");
      }
    }
  };

  const [newComp, setNewComp] = useState({
    code: "",
    name: "",
    taxId: "US-EIN-94821039",
    currency: "USD ($)",
    hqLocation: "Austin, Texas, USA",
    fiscalYearStart: "January",
    status: "Active"
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newComp.name.trim()) {
      addToast("Please provide company legal name.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await masterDataService.createCompany(newComp);
      addToast(`Legal entity "${newComp.name}" registered in database!`, "success");
      setIsModalOpen(false);
      setNewComp({
        code: "",
        name: "",
        taxId: "US-EIN-94821039",
        currency: "USD ($)",
        hqLocation: "Austin, Texas, USA",
        fiscalYearStart: "January",
        status: "Active"
      });
      await fetchCompanies();
    } catch (err) {
      addToast(`Failed to register company: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingComp.name.trim()) {
      addToast("Please provide company legal name.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = editingComp.id || editingComp.companyId || editingComp.code;
      await masterDataService.updateCompany(targetId, editingComp);
      addToast(`Legal entity "${editingComp.name}" updated in database!`, "success");
      setEditingComp(null);
      await fetchCompanies();
    } catch (err) {
      addToast(`Failed to update company: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
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
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)", fontSize: "13px" }}>
                    No legal entities found in database. Click "+ Add Legal Entity" to register one.
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id || c.companyId || c.code} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
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
                      <Badge variant={c.status?.toLowerCase() === "suspended" ? "amber" : c.status?.toLowerCase() === "inactive" ? "rose" : "emerald"}>
                        {(c.status || "Active").toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => setViewingComp({ ...c })}
                          title="View Company Details"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditingComp({ ...c })}
                          title="Edit Company"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id || c.companyId || c.code, c.name)}
                          title="Delete Company"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={newComp.status || "Active"}
                    onChange={(e) => setNewComp({ ...newComp, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fiscal Year Start</label>
                  <select
                    value={newComp.fiscalYearStart || "January"}
                    onChange={(e) => setNewComp({ ...newComp, fiscalYearStart: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </div>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Entity Code *</label>
                  <input
                    type="text"
                    required
                    value={editingComp.code || ""}
                    onChange={(e) => setEditingComp({ ...editingComp, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editingComp.name || ""}
                    onChange={(e) => setEditingComp({ ...editingComp, name: e.target.value })}
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
                    value={editingComp.taxId || ""}
                    onChange={(e) => setEditingComp({ ...editingComp, taxId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Functional Currency</label>
                  <input
                    type="text"
                    value={editingComp.currency || ""}
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
                  value={editingComp.hqLocation || ""}
                  onChange={(e) => setEditingComp({ ...editingComp, hqLocation: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingComp.status || "Active"}
                    onChange={(e) => setEditingComp({ ...editingComp, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fiscal Year Start</label>
                  <select
                    value={editingComp.fiscalYearStart || "January"}
                    onChange={(e) => setEditingComp({ ...editingComp, fiscalYearStart: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="January">January</option>
                    <option value="April">April</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(editingComp.companyId || editingComp.id || editingComp.code, editingComp.name)}
                  style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} /> Delete
                </Button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button variant="secondary" onClick={() => setEditingComp(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Entity"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COMPANY MODAL */}
      {viewingComp && (
        <div className="modal-backdrop" onClick={() => setViewingComp(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Company Legal Entity Details
                </h2>
              </div>
              <button onClick={() => setViewingComp(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", backgroundColor: "var(--bg-card-subtle)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Entity Code</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {viewingComp.code}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                  <div style={{ marginTop: "4px" }}>
                    <Badge variant={viewingComp.status?.toLowerCase() === "suspended" ? "amber" : viewingComp.status?.toLowerCase() === "inactive" ? "rose" : "emerald"}>
                      {(viewingComp.status || "Active").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Company Legal Name</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>
                  {viewingComp.name}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Tax ID / EIN</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {viewingComp.taxId || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Functional Currency</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#059669", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {viewingComp.currency || "USD ($)"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Headquarters</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px" }}>
                    {viewingComp.hqLocation || "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Fiscal Year Start</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginTop: "4px" }}>
                    {viewingComp.fiscalYearStart || "January"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(viewingComp.companyId || viewingComp.id || viewingComp.code, viewingComp.name)}
                  style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Trash2 size={13} /> Delete
                </Button>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingComp({ ...viewingComp });
                      setViewingComp(null);
                    }}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Edit2 size={13} /> Edit
                  </Button>
                  <Button variant="secondary" onClick={() => setViewingComp(null)} style={{ fontSize: "12px", padding: "6px 12px" }}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

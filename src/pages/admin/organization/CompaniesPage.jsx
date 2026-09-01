import React, { useState } from "react";
import {
  Building2,
  Plus,
  CheckCircle2,
  Globe,
  DollarSign,
  X,
  Edit2,
  ShieldCheck,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function CompaniesPage() {
  const { addToast } = useApp();

  const [companies, setCompanies] = useState([
    { id: "COMP-01", legalName: "FlowState Beverages Global Corp", taxId: "US-EIN-94821039", currency: "USD ($)", hq: "Austin, Texas, USA", status: "Primary Legal Entity" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComp, setNewComp] = useState({
    legalName: "",
    taxId: "",
    currency: "USD ($)",
    hq: ""
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newComp.legalName.trim()) {
      addToast("Please provide company legal name.", "warning");
      return;
    }

    const created = {
      id: `COMP-0${companies.length + 1}`,
      legalName: newComp.legalName,
      taxId: newComp.taxId || "US-EIN-Pending",
      currency: newComp.currency,
      hq: newComp.hq || "Corporate HQ",
      status: "Subsidiary Entity"
    };

    setCompanies([...companies, created]);
    addToast(`Legal entity "${created.legalName}" added!`, "success");
    setIsModalOpen(false);
    setNewComp({ legalName: "", taxId: "", currency: "USD ($)", hq: "" });
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
            <Badge variant="cyan">MULTI-ENTITY ENTERPRISE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Legal Entity
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
          title="Legal Entities"
          value={companies.length.toString()}
          unit="Registered"
          trend={{ value: "Primary corporation active", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Base Currency"
          value="USD ($)"
          unit="Consolidated"
          trend={{ value: "Multi-currency support active", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="cyan"
        />
        <StatCard
          title="Global HQ"
          value="Austin, TX"
          unit="USA"
          trend={{ value: "Central enterprise node", isPositive: true, text: "" }}
          icon={Globe}
          colorVariant="amber"
        />
        <StatCard
          title="Tax & Legal Audit"
          value="100%"
          unit="Compliant"
          trend={{ value: "SOX & GAAP Validated", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Companies List */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Entity Ref</th>
                <th>Legal Corporate Name</th>
                <th>Tax / EIN Identifier</th>
                <th>Base Currency</th>
                <th>Headquarters</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{c.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{c.legalName}</strong>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{c.taxId}</td>
                  <td>
                    <Badge variant="emerald">{c.currency}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{c.hq}</td>
                  <td>
                    <Badge variant="cyan">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Legal Entity
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Legal Corporate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FlowState Beverages EMEA Ltd"
                  value={newComp.legalName}
                  onChange={(e) => setNewComp({ ...newComp, legalName: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Tax / EIN Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. GB-VAT-891023"
                    value={newComp.taxId}
                    onChange={(e) => setNewComp({ ...newComp, taxId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Base Currency</label>
                  <select
                    className="form-select"
                    value={newComp.currency}
                    onChange={(e) => setNewComp({ ...newComp, currency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Headquarters Location</label>
                <input
                  type="text"
                  placeholder="e.g. London, United Kingdom"
                  value={newComp.hq}
                  onChange={(e) => setNewComp({ ...newComp, hq: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
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
    </div>
  );
}

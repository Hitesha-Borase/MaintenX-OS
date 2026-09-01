import React, { useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Layers,
  FlaskConical,
  Percent,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function BOMRecipesPage() {
  const { addToast } = useApp();

  const [recipes, setRecipes] = useState([
    { id: "BOM-5001", sku: "500ml Sparkling Citrus Soda", version: "v2.4 (Approved)", batchSize: "10,000 Liters", ingredientsCount: 6, yieldTarget: "99.4%", status: "Active" },
    { id: "BOM-5002", sku: "1L Tonic Water Natural", version: "v1.8 (Approved)", batchSize: "8,000 Liters", ingredientsCount: 5, yieldTarget: "99.2%", status: "Active" },
    { id: "BOM-5003", sku: "330ml Organic Ginger Beer", version: "v3.1 (Approved)", batchSize: "12,000 Liters", ingredientsCount: 7, yieldTarget: "99.0%", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBOM, setNewBOM] = useState({
    sku: "",
    version: "v1.0 (Draft)",
    batchSize: "10,000 Liters",
    ingredientsCount: 5,
    yieldTarget: "99.5%"
  });

  const filteredRecipes = recipes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.sku.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.version.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBOM.sku.trim()) {
      addToast("Please provide target SKU product.", "warning");
      return;
    }

    const created = {
      id: `BOM-500${recipes.length + 1}`,
      sku: newBOM.sku,
      version: newBOM.version,
      batchSize: newBOM.batchSize || "10,000 Liters",
      ingredientsCount: Number(newBOM.ingredientsCount) || 4,
      yieldTarget: newBOM.yieldTarget || "99.0%",
      status: "Active"
    };

    setRecipes([...recipes, created]);
    addToast(`Recipe BOM "${created.id}" created for ${created.sku}!`, "success");
    setIsModalOpen(false);
    setNewBOM({ sku: "", version: "v1.0 (Draft)", batchSize: "10,000 Liters", ingredientsCount: 5, yieldTarget: "99.5%" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Bill of Materials (BOM) & Recipes
            </h1>
            <Badge variant="emerald">{recipes.length} ACTIVE RECIPES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Recipe Formula
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
          title="Active Formulations"
          value={recipes.length.toString()}
          unit="BOMs"
          trend={{ value: "Approved master recipes", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Target Yield"
          value="99.2%"
          unit="Nominal"
          trend={{ value: "< 0.8% batch liquid loss", isPositive: true, text: "" }}
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Version Control"
          value="100%"
          unit="Audited"
          trend={{ value: "ISO 22000 & 21 CFR Part 11", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="amber"
        />
        <StatCard
          title="ERP BOM Synced"
          value="100%"
          unit="S/4HANA"
          trend={{ value: "Live material consumption", isPositive: true, text: "" }}
          icon={CheckCircle2}
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
              placeholder="Search recipe BOM, target SKU, version..."
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
                <th>Recipe BOM Ref</th>
                <th>Target SKU Product</th>
                <th>Formula Version</th>
                <th>Standard Batch Size</th>
                <th>Raw Ingredients</th>
                <th>Target Yield</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{r.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{r.sku}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{r.version}</Badge>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{r.batchSize}</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{r.ingredientsCount} Items</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{r.yieldTarget}</td>
                  <td>
                    <Badge variant="emerald">{r.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => addToast(`Opened formula recipe breakdown for ${r.id}`, "info")}
                      title="Edit Recipe"
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

      {/* ADD BOM MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create Recipe & BOM Formula
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Target SKU Product *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500ml Sparkling Pomegranate Soda"
                  value={newBOM.sku}
                  onChange={(e) => setNewBOM({ ...newBOM, sku: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Formula Version</label>
                  <input
                    type="text"
                    value={newBOM.version}
                    onChange={(e) => setNewBOM({ ...newBOM, version: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Batch Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 10,000 Liters"
                    value={newBOM.batchSize}
                    onChange={(e) => setNewBOM({ ...newBOM, batchSize: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Ingredients Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newBOM.ingredientsCount}
                    onChange={(e) => setNewBOM({ ...newBOM, ingredientsCount: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Target Yield</label>
                  <input
                    type="text"
                    placeholder="e.g. 99.4%"
                    value={newBOM.yieldTarget}
                    onChange={(e) => setNewBOM({ ...newBOM, yieldTarget: e.target.value })}
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
                  Save Recipe BOM
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

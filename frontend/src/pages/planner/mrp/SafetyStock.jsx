import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  ShieldCheck,
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Layers,
  ArrowUpRight
} from "lucide-react";

export function SafetyStock() {
  const { mrpCalculations = [] } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const [editingPolicy, setEditingPolicy] = useState(null);
  const [newMinStock, setNewMinStock] = useState(5000);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    addToast(`Safety buffer policy updated for ${editingPolicy.name}!`, "success");
    setEditingPolicy(null);
  };

  const filtered = mrpCalculations.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skuCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Safety Stock Policy & Reorder Buffers
          </h1>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Monitored Raw SKUs"
          value={mrpCalculations.length.toString()}
          unit="Active Materials"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Protected Above Buffer"
          value={mrpCalculations.filter((m) => m.availableInventory >= m.safetyStock).length.toString()}
          unit="Safe Buffers"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Buffer Violations"
          value={mrpCalculations.filter((m) => m.availableInventory < m.safetyStock).length.toString()}
          unit="Below Min Threshold"
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Target Service Level"
          value="99.0%"
          unit="Stockout Probability: 1%"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Table Container */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search material safety buffers by SKU name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "850px" }}>
            <thead>
              <tr>
                <th>BOM Material</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Safety Buffer Min</th>
                <th>Coverage Ratio</th>
                <th>Buffer Status</th>
                <th style={{ textAlign: "right" }}>Configure</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const ratio = Math.round((m.availableInventory / (m.safetyStock || 1)) * 100);
                const isSafe = m.availableInventory >= m.safetyStock;

                return (
                  <tr
                    key={m.skuId}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{m.name}</div>
                      <div style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700, marginTop: "2px" }}>
                        {m.skuCode}
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.category}</span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                        {m.availableInventory.toLocaleString()} {m.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontWeight: 600 }}>
                        {m.safetyStock.toLocaleString()} {m.uom}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: isSafe ? "#059669" : "#DC2626" }}>
                        {ratio}%
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <Badge variant={isSafe ? "emerald" : "rose"}>
                        {isSafe ? "SECURE BUFFER" : "BELOW SAFETY BUFFER"}
                      </Badge>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          setEditingPolicy(m);
                          setNewMinStock(m.safetyStock);
                        }}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EDIT POLICY MODAL */}
      {editingPolicy && (
        <div className="modal-backdrop" onClick={() => setEditingPolicy(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Adjust Safety Buffer Policy
                </h2>
              </div>
              <button onClick={() => setEditingPolicy(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {editingPolicy.name} ({editingPolicy.skuCode})
              </div>

              <div>
                <label className="form-label">Minimum Safety Buffer ({editingPolicy.uom}) *</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Service Level Target (%)</label>
                <select className="form-input" style={{ backgroundColor: "#FFFFFF" }}>
                  <option value="99.5">99.5% (High Reliability Aseptic Line)</option>
                  <option value="99.0">99.0% (Standard Beverage Pack)</option>
                  <option value="95.0">95.0% (Non-Critical Packaging)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingPolicy(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Policy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

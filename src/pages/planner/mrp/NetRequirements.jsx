import React, { useState } from "react";
import { usePlanning } from "../../../context/PlanningContext";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Info
} from "lucide-react";

export function NetRequirements() {
  const { mrpCalculations = [] } = usePlanning();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [requisitionModalSku, setRequisitionModalSku] = useState(null);
  const [reqQty, setReqQty] = useState(10000);

  // KPIs
  const totalMaterials = mrpCalculations.length;
  const criticalItems = mrpCalculations.filter((m) => m.riskLevel === "CRITICAL" || m.riskLevel === "HIGH").length;
  const totalNetShortage = mrpCalculations.reduce((sum, m) => sum + (m.shortage || 0), 0);
  const balancedItems = mrpCalculations.filter((m) => m.shortage === 0).length;

  const filtered = mrpCalculations.filter((m) => {
    const matchesRisk = riskFilter === "ALL" || m.riskLevel === riskFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.skuCode.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);

    return matchesRisk && matchesSearch;
  });

  const handleCreateRequisitionSubmit = (e) => {
    e.preventDefault();
    addToast(
      `Purchase Requisition PR-2026-${Math.floor(1000 + Math.random() * 9000)} generated for ${reqQty.toLocaleString()} ${requisitionModalSku.uom} of ${requisitionModalSku.name}!`,
      "success"
    );
    setRequisitionModalSku(null);
  };

  const handleExportCSV = () => {
    const headers = "SKU Code,Material Name,Category,Gross Req,Safety Stock,Available,Allocated,Inbound,Open Prod,Net Req,Shortage,UOM,Risk Level,Suggested Action\n";
    const rows = filtered
      .map((m) => `"${m.skuCode}","${m.name}","${m.category}",${m.grossRequirement},${m.safetyStock},${m.availableInventory},${m.allocatedInventory},${m.inboundSupply},${m.openProduction},${m.netRequirement},${m.shortage},"${m.uom}","${m.riskLevel}","${m.suggestedAction}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MRP_Net_Requirements_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("MRP Net Requirements exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              MRP Net Material Requirements & Bill of Materials Explosion
            </h1>
            <Badge variant={criticalItems > 0 ? "rose" : "emerald"}>{criticalItems} SHORTAGE RISKS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export MRP Data
          </Button>
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
          title="Tracked BOM Materials"
          value={totalMaterials.toString()}
          unit="Ingredients & Packaging"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Shortage Risk Alerts"
          value={criticalItems.toString()}
          unit="Requires Purchase Action"
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Net Shortage Volume"
          value={totalNetShortage.toLocaleString()}
          unit="Total Deficit Units"
          icon={TrendingDown}
          colorVariant="amber"
        />
        <StatCard
          title="Stock Balance Health"
          value={`${Math.round((balancedItems / (totalMaterials || 1)) * 100)}%`}
          unit="Adequately Buffered"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Formula Explanation Banner */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          backgroundColor: "rgba(200, 149, 71, 0.08)",
          border: "1px solid #C89547",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "12px",
          color: "var(--text-primary)"
        }}
      >
        <Info size={18} color="#B27E33" style={{ flexShrink: 0 }} />
        <div>
          <strong>Deterministic MRP Mathematical Logic:</strong> Net Requirement ={" "}
          <code style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
            Gross Requirement + Safety Stock − [ Available Stock − Reserved Stock + Inbound Supply ]
          </code>
        </div>
      </div>

      {/* Main MRP Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search material SKU, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "CRITICAL", "HIGH", "LOW"].map((rk) => (
              <button
                key={rk}
                onClick={() => setRiskFilter(rk)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  backgroundColor: riskFilter === rk ? "#C89547" : "var(--bg-card-subtle)",
                  color: riskFilter === rk ? "#261603" : "var(--text-secondary)",
                  border: riskFilter === rk ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {rk === "ALL" ? "All Risks" : `${rk} Risk`}
              </button>
            ))}
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1050px" }}>
            <thead>
              <tr>
                <th>BOM Material SKU</th>
                <th>Category</th>
                <th>Gross Req</th>
                <th>Safety Buffer</th>
                <th>On-Hand</th>
                <th>Allocated</th>
                <th>Inbound PO</th>
                <th>Net Required</th>
                <th>Shortage</th>
                <th>Service Risk</th>
                <th>Suggested Action</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
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
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                      {m.grossRequirement.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {m.safetyStock.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                      {m.availableInventory.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#D97706" }}>
                      {m.allocatedInventory.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#059669" }}>
                      +{m.inboundSupply.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: m.netRequirement > 0 ? "#DC2626" : "#059669" }}>
                      {m.netRequirement.toLocaleString()} {m.uom}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    {m.shortage > 0 ? (
                      <span style={{ fontSize: "13px", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#DC2626" }}>
                        ▲ {m.shortage.toLocaleString()} {m.uom}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>✓ Covered</span>
                    )}
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant={m.riskLevel === "CRITICAL" ? "rose" : m.riskLevel === "HIGH" ? "amber" : "emerald"}>
                      {m.riskLevel}
                    </Badge>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>{m.suggestedAction}</span>
                  </td>

                  <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {m.shortage > 0 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Plus}
                        onClick={() => {
                          setRequisitionModalSku(m);
                          setReqQty(m.shortage);
                        }}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        Raise PO
                      </Button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Balanced</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RAISE REQUISITION MODAL */}
      {requisitionModalSku && (
        <div className="modal-backdrop" onClick={() => setRequisitionModalSku(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShoppingBag size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Generate Expedited Purchase Requisition
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateRequisitionSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", border: "1px dashed #DC2626", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                <div style={{ fontWeight: 800, color: "#DC2626" }}>Material Deficit Detected: {requisitionModalSku.name}</div>
                <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                  SKU: {requisitionModalSku.skuCode} • Projected Net Shortage: <strong>{requisitionModalSku.shortage.toLocaleString()} {requisitionModalSku.uom}</strong>
                </div>
              </div>

              <div>
                <label className="form-label">Requisition Order Quantity ({requisitionModalSku.uom}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reqQty}
                  onChange={(e) => setReqQty(Number(e.target.value))}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Procurement Priority & Expedite Mode</label>
                <select className="form-input" style={{ backgroundColor: "#FFFFFF" }}>
                  <option value="Expedite">Air/Express Freight — Critical Line Stoppage Prevention</option>
                  <option value="Standard">Standard Dedicated FTL Delivery</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setRequisitionModalSku(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Issue Purchase Requisition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

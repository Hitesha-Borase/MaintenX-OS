import React, { useState } from "react";
import {
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function BatchesPage() {
  const { batches = [], releaseBatchQA } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const getProductName = (b) => b.productName || b.product || b.recipeId || "Formulation Batch";
  const getTank = (b) => b.tank || b.vessel || "Blending Tank T-01";
  const getVolume = (b) => b.volumeLiters || b.targetQuantity || 10000;

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    const id = (b.id || "").toLowerCase();
    const prod = getProductName(b).toLowerCase();
    const tnk = getTank(b).toLowerCase();

    return id.includes(q) || prod.includes(q) || tnk.includes(q);
  });

  const handleRelease = (batchId) => {
    if (releaseBatchQA) releaseBatchQA(batchId);
    addToast(`Batch ${batchId} released for packaging by QA!`, "success");
  };

  const handleExportCSV = () => {
    const headers = "Batch ID,Product Recipe,Vessel Tank,Volume (L),Brix,pH,Status\n";
    const rows = filteredBatches
      .map((b) => `"${b.id}","${getProductName(b)}","${getTank(b)}",${getVolume(b)},"${b.brix || '10.4°Bx'}","${b.pH || '3.2'}","${b.qaStatus || b.status || 'Active'}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Batches_Formulation_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Batches ledger exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Liquid Formulation Batches & Blending
            </h1>
            <Badge variant="cyan">{batches.length} ACTIVE BATCHES</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/traceability")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Batch 360 Traceability
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
          title="Active Batches"
          value={batches.length.toString()}
          unit="In-Process"
          trend={{ value: "Blending tanks active", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Bulk Liquid Volume"
          value="34,500 L"
          unit="Formulated"
          trend={{ value: "Pasteurization hold verified", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="CCP Conformance"
          value="100%"
          unit="Passed"
          trend={{ value: "Thermal limits in spec", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="QA Hold Queue"
          value="0 Lots"
          unit="Clear"
          trend={{ value: "Zero release bottlenecks", isPositive: true, text: "" }}
          icon={Clock}
          colorVariant="amber"
        />
      </div>

      {/* Batches Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search batch lot #, product recipe, tank..."
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
                <th>Batch Number</th>
                <th>Recipe / Product</th>
                <th>Vessel / Tank</th>
                <th>Volume (Liters)</th>
                <th>Brix / pH Spec</th>
                <th>QA Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No formulation batches match your query.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => {
                  const isReleased = (b.qaStatus || "").toLowerCase().includes("rel") || (b.status || "").toLowerCase().includes("step 4");

                  return (
                    <tr key={b.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getProductName(b)}</div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {b.recipeId || "REC-STD-01"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{getTank(b)}</span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {Number(getVolume(b)).toLocaleString()} L
                      </td>
                      <td>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Brix: <strong style={{ color: "var(--text-primary)" }}>{b.brix || "10.4°Bx"}</strong> • pH: <strong style={{ color: "var(--text-primary)" }}>{b.pH || "3.2"}</strong>
                        </span>
                      </td>
                      <td>
                        <Badge variant={isReleased ? "emerald" : "amber"}>
                          {isReleased ? "Released" : "In Testing"}
                        </Badge>
                      </td>
                      <td>
                        {!isReleased ? (
                          <button
                            onClick={() => handleRelease(b.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                              color: "#261603",
                              border: "1px solid #E8C182",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <ShieldCheck size={12} /> Release Batch
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>● Packaging Approved</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

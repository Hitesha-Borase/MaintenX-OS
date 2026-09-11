import React, { useState, useEffect } from "react";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import planningService from "../../../services/planningService";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import {
  Shuffle,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers,
  Settings,
  Plus,
  RefreshCw,
  Download,
  X
} from "lucide-react";

export function Changeovers() {
  const { skus = [] } = useMasterData();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [matrixRules, setMatrixRules] = useState([
    {
      id: "CHG-001",
      fromSku: "500ml Sparkling Citrus Soda (SKU-5001)",
      toSku: "1L Tonic Water Natural Quinine (SKU-5002)",
      line: "High-Speed Bottling Line 1",
      durationMins: 60,
      protocol: "CIP-04 Hot Sanitization & Quinine Allergen Flush",
      mechanicalChanges: "Starwheel guide swap (500ml → 1L bottle profile)",
      impact: "High Downtime (+1.0 hr)"
    },
    {
      id: "CHG-002",
      fromSku: "1L Tonic Water Natural Quinine (SKU-5002)",
      toSku: "500ml Sparkling Citrus Soda (SKU-5001)",
      line: "High-Speed Bottling Line 1",
      durationMins: 45,
      protocol: "CIP-02 Ambient Caustic Wash Rinse",
      mechanicalChanges: "Filler nozzle height adjust + Guide plate return",
      impact: "Moderate Downtime (+0.75 hr)"
    },
    {
      id: "CHG-003",
      fromSku: "330ml Organic Ginger Beer (SKU-5003)",
      toSku: "330ml Organic Ginger Beer (SKU-5003)",
      line: "Canning & Seaming Line 2",
      durationMins: 0,
      protocol: "Continuous Same-SKU Run (Zero Breakdown)",
      mechanicalChanges: "None",
      impact: "Zero Loss (0 min)"
    }
  ]);

  const [newRule, setNewRule] = useState({
    fromSku: "500ml Sparkling Citrus Soda (SKU-5001)",
    toSku: "330ml Organic Ginger Beer (SKU-5003)",
    line: "High-Speed Bottling Line 1",
    durationMins: 45,
    protocol: "CIP-02 Ambient Sanitization Flush",
    mechanicalChanges: "Guide rails adjustment and labeler feed swap"
  });

  const fetchChangeovers = async () => {
    try {
      setLoading(true);
      const res = await planningService.getChangeovers();
      const data = res?.data || res;
      if (data && Array.isArray(data) && data.length > 0) {
        setMatrixRules(data);
      }
    } catch (err) {
      console.warn("Changeovers API fetch fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangeovers();
  }, []);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSaving(true);
    const item = {
      id: `CHG-${Math.floor(100 + Math.random() * 900)}`,
      ...newRule,
      durationMins: Number(newRule.durationMins),
      impact: `${newRule.durationMins} min downtime`
    };

    setMatrixRules((prev) => [item, ...prev]);

    try {
      const res = await planningService.createChangeover(item);
      const created = res?.data || res;
      if (created?.id) {
        setMatrixRules((prev) => prev.map((r) => (r.id === item.id ? { ...r, ...created } : r)));
      }
      addToast(`Changeover rule ${item.id} registered into SMED matrix!`, "success");
    } catch (err) {
      console.warn("Create changeover fallback:", err.message);
      addToast(`Changeover rule saved locally.`, "success");
    } finally {
      setSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "Rule ID,Previous SKU,Next SKU,Work Center Line,Duration (Mins),Sanitation Protocol,Mechanical Changes\n";
    const rows = filtered
      .map((r) => `"${r.id}","${r.fromSku}","${r.toSku}","${r.line}",${r.durationMins},"${r.protocol}","${r.mechanicalChanges}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Changeover_Matrix_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Changeover matrix exported to CSV.", "success");
  };

  const filtered = matrixRules.filter(
    (r) =>
      r.fromSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.toSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0, paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0 }}>
              APS Changeover Matrix & SMED Standardization
            </h1>
            <span style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: "rgba(200, 149, 71, 0.18)",
              color: "#2B1D11",
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(200, 149, 71, 0.35)"
            }}>
              SMED OPTIMIZATION MATRIX
            </span>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Standardize changeover sequence rules, wash protocols, and SMED changeover duration matrices.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button 
            variant="outline" 
            icon={RefreshCw} 
            onClick={() => {
              fetchChangeovers();
              addToast("Changeover rules refreshed from live backend API", "success");
            }} 
            loading={loading}
            style={{ fontSize: "13px" }}
          >
            Refresh
          </Button>

          <Button 
            variant="outline" 
            icon={Download} 
            onClick={handleExportCSV} 
            style={{ fontSize: "13px" }}
          >
            Export CSV
          </Button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
              color: "#261603",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
            }}
          >
            <Plus size={16} />
            + Add Transition Rule
          </button>
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
          title="CONFIGURED TRANSITION RULES"
          value={matrixRules.length.toString()}
          unit="Product Pairs"
          icon={Shuffle}
          colorVariant="cyan"
        />
        <StatCard
          title="AVG CHANGEOVER DURATION"
          value="35 Mins"
          unit="Across All Lines"
          icon={Clock}
          colorVariant="amber"
        />
        <StatCard
          title="SMED FAST-TRACK TARGET"
          value="< 30 Mins"
          unit="Single-Minute Exchange"
          icon={Zap}
          colorVariant="amber"
        />
        <StatCard
          title="CIP WASHOUT PROTOCOLS"
          value="3 Standards"
          unit="CIP-01, 02, 04 Approved"
          icon={CheckCircle2}
          colorVariant="amber"
        />
      </div>

      {/* Rules Table Container */}
      <Card style={{ padding: "20px", minWidth: 0, width: "100%", boxSizing: "border-box", background: "white", border: "1px solid #E8DDCF", borderRadius: "16px" }}>
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search changeover rules by SKU, work center, or wash protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: "32px", height: "38px", fontSize: "13px", backgroundColor: "#FAF8F5", border: "1px solid #D1C7BA", borderRadius: "8px", outline: "none", width: "100%" }}
          />
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "950px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E8DDCF", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Previous SKU ➔ Next SKU Transition</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Work Center Line</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Standard Duration</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Sanitation & Flush Protocol</th>
                <th style={{ padding: "12px 14px", fontWeight: 700 }}>Mechanical Re-Tooling Steps</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: "1px solid #F0EAE1",
                    transition: "background-color 0.12s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{r.fromSku}</div>
                    <div style={{ fontSize: "12px", color: "#8C5B23", fontWeight: 800, marginTop: "3px" }}>
                      ➔ {r.toSku}
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <Badge variant="cyan">{r.line}</Badge>
                  </td>

                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        fontFamily: "var(--font-mono)",
                        color: r.durationMins === 0 ? "#8B6914" : r.durationMins > 45 ? "#DC2626" : "#8B6914"
                      }}
                    >
                      {r.durationMins === 0 ? "0 Mins (Continuous)" : `${r.durationMins} Mins`}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{r.protocol}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{r.impact}</div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.mechanicalChanges}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD TRANSITION RULE MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #E8DDCF",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            overflow: "hidden"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #E8DDCF", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shuffle size={18} color="#8B6914" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Changeover Transition Rule
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRule} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Origin (From SKU) *</label>
                <input
                  type="text"
                  required
                  value={newRule.fromSku}
                  onChange={(e) => setNewRule({ ...newRule, fromSku: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Target (To SKU) *</label>
                <input
                  type="text"
                  required
                  value={newRule.toSku}
                  onChange={(e) => setNewRule({ ...newRule, toSku: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Work Center Line</label>
                  <input
                    type="text"
                    value={newRule.line}
                    onChange={(e) => setNewRule({ ...newRule, line: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRule.durationMins}
                    onChange={(e) => setNewRule({ ...newRule, durationMins: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>CIP / Sanitization Protocol</label>
                <input
                  type="text"
                  value={newRule.protocol}
                  onChange={(e) => setNewRule({ ...newRule, protocol: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "4px" }}>Mechanical Changes</label>
                <input
                  type="text"
                  value={newRule.mechanicalChanges}
                  onChange={(e) => setNewRule({ ...newRule, mechanicalChanges: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #D1C7BA", outline: "none", backgroundColor: "#FAF8F5" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #E2B670 0%, #C89547 50%, #B27E33 100%)",
                    color: "#261603",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 6px rgba(200, 149, 71, 0.3)"
                  }}
                >
                  {saving ? "Saving..." : "Save Transition Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Changeovers;

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Clock,
  Thermometer,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function SanitationAllergensPage() {
  const { sanitationClasses = [], addSanitationClass, updateSanitationClass, allergenRules = [], addAllergenRule, updateAllergenRule, skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [activeTab, setActiveTab] = useState("sanitation"); // "sanitation" | "allergens"
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSanitation, setEditingSanitation] = useState(null);
  const [editingAllergen, setEditingAllergen] = useState(null);

  const [newSanitation, setNewSanitation] = useState({
    sanitationClass: "",
    description: "",
    durationMin: 45,
    cleaningMethod: "Automated 5-Step Central CIP Skid",
    riskLevel: "Critical / Allergen Elimination",
    applicableProducts: "Tonics, Fruit Sodas, Ginger Extract"
  });

  const [newAllergen, setNewAllergen] = useState({
    allergenName: "",
    skuId: skus[0]?.skuId || "SKU-001",
    riskLevel: "High Regulatory CCP",
    cleaningProtocol: "Class A Full CIP + ATP Swab Validation < 10 RLU",
    changeoverRestriction: "Mandatory QA clearance sign-off before starting non-allergen SKU"
  });

  const filteredSanitation = useMemo(() => {
    return sanitationClasses.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (s.sanitationClass || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.cleaningMethod || "").toLowerCase().includes(q) ||
        (s.applicableProducts || "").toLowerCase().includes(q)
      );
    });
  }, [sanitationClasses, searchQuery]);

  const filteredAllergens = useMemo(() => {
    return allergenRules.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (a.allergenName || "").toLowerCase().includes(q) ||
        (a.skuCode || "").toLowerCase().includes(q) ||
        (a.cleaningProtocol || "").toLowerCase().includes(q) ||
        (a.riskLevel || "").toLowerCase().includes(q)
      );
    });
  }, [allergenRules, searchQuery]);

  const handleAddSanitationSubmit = (e) => {
    e.preventDefault();
    if (!newSanitation.sanitationClass.trim()) {
      addToast("Please provide sanitation class name.", "warning");
      return;
    }

    const created = addSanitationClass(newSanitation);
    addToast(`Sanitation Class "${created.sanitationClass}" registered!`, "success");
    setIsModalOpen(false);
    setNewSanitation({
      sanitationClass: "",
      description: "",
      durationMin: 45,
      cleaningMethod: "Automated 5-Step Central CIP Skid",
      riskLevel: "Critical / Allergen Elimination",
      applicableProducts: "Tonics, Fruit Sodas, Ginger Extract"
    });
  };

  const handleAddAllergenSubmit = (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => s.skuId === newAllergen.skuId);
    const created = addAllergenRule({
      ...newAllergen,
      skuCode: selSku ? selSku.skuCode : "SKU-5001"
    });
    addToast(`Allergen rule "${created.allergenName}" registered!`, "success");
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Sanitation Classes & Allergen Master
            </h1>
            <Badge variant="rose">HACCP ALLERGEN CONTROLS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            {activeTab === "sanitation" ? "+ Add Sanitation Class" : "+ Add Allergen Rule"}
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
          title="Sanitation Classes"
          value={sanitationClasses.length.toString()}
          unit="CIP Programs"
          icon={FlaskConical}
          colorVariant="emerald"
        />
        <StatCard
          title="Monitored Allergens"
          value={allergenRules.length.toString()}
          unit="Active Rules"
          icon={ShieldAlert}
          colorVariant="rose"
        />
        <StatCard
          title="Thermal CIP Benchmark"
          value="85°C"
          unit="Hot Caustic"
          icon={Thermometer}
          colorVariant="amber"
        />
        <StatCard
          title="ATP Swab Threshold"
          value="< 10 RLU"
          unit="Validated"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => { setActiveTab("sanitation"); setSearchQuery(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "sanitation" ? "rgba(200, 149, 71, 0.15)" : "transparent",
            color: activeTab === "sanitation" ? "#8C5B23" : "var(--text-secondary)",
            fontWeight: activeTab === "sanitation" ? 800 : 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <FlaskConical size={15} />
          <span>Sanitation Classes ({sanitationClasses.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab("allergens"); setSearchQuery(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "allergens" ? "rgba(200, 149, 71, 0.15)" : "transparent",
            color: activeTab === "allergens" ? "#8C5B23" : "var(--text-secondary)",
            fontWeight: activeTab === "allergens" ? 800 : 600,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <ShieldAlert size={15} />
          <span>Allergen Control Rules ({allergenRules.length})</span>
        </button>
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
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
          <div style={{ position: "relative", maxWidth: "420px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={activeTab === "sanitation" ? "Search sanitation class, cleaning method..." : "Search allergen, SKU, protocol..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "36px", backgroundColor: "#FFFFFF", fontSize: "12px", width: "100%" }}
            />
          </div>
        </div>

        {activeTab === "sanitation" ? (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sanitation Class</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Cleaning Method & Protocol</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Required Duration</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Risk Level</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Applicable Products</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSanitation.map((s) => (
                  <tr key={s.sanitationId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {s.sanitationClass}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>{s.cleaningMethod}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.description}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706" }}>
                      {s.durationMin} mins
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={s.riskLevel?.includes("Critical") ? "rose" : "emerald"}>{s.riskLevel}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {s.applicableProducts}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{s.status}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => setEditingSanitation({ ...s })}
                        title="Edit Sanitation Class"
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
        ) : (
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Allergen Identifier</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Associated Material / SKU</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Risk Level</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Mandatory Cleaning Protocol</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Changeover Restriction</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllergens.map((a) => (
                  <tr key={a.allergenId} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--text-primary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ShieldAlert size={14} color="#EF4444" />
                        <span>{a.allergenName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>
                      {a.skuCode}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="rose">{a.riskLevel}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)" }}>
                      {a.cleaningProtocol}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {a.changeoverRestriction}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant="emerald">{a.status}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => setEditingAllergen({ ...a })}
                        title="Edit Allergen Rule"
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
        )}
      </Card>

      {/* ADD SANITATION MODAL */}
      {isModalOpen && activeTab === "sanitation" && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FlaskConical size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Sanitation Class Program
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSanitationSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Sanitation Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class A - Full Caustic CIP (85°C)"
                  value={newSanitation.sanitationClass}
                  onChange={(e) => setNewSanitation({ ...newSanitation, sanitationClass: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Required Duration (min) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSanitation.durationMin}
                    onChange={(e) => setNewSanitation({ ...newSanitation, durationMin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Risk Level Classification</label>
                  <input
                    type="text"
                    placeholder="e.g. Critical / Allergen Swap"
                    value={newSanitation.riskLevel}
                    onChange={(e) => setNewSanitation({ ...newSanitation, riskLevel: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Cleaning Method Protocol</label>
                <input
                  type="text"
                  placeholder="e.g. Automated 5-Step Central CIP Skid"
                  value={newSanitation.cleaningMethod}
                  onChange={(e) => setNewSanitation({ ...newSanitation, cleaningMethod: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Protocol Detailed Description</label>
                <textarea
                  rows={2}
                  value={newSanitation.description}
                  onChange={(e) => setNewSanitation({ ...newSanitation, description: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Sanitation Class
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ALLERGEN MODAL */}
      {isModalOpen && activeTab === "allergens" && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={18} color="#EF4444" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Allergen Governance Rule
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAllergenSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Allergen Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ginger Extract Botanical"
                    value={newAllergen.allergenName}
                    onChange={(e) => setNewAllergen({ ...newAllergen, allergenName: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Associated Material SKU *</label>
                  <select
                    value={newAllergen.skuId}
                    onChange={(e) => setNewAllergen({ ...newAllergen, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {skus.map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Cleaning & Validation Protocol</label>
                <input
                  type="text"
                  placeholder="e.g. Class A Full CIP + ATP Swab < 10 RLU"
                  value={newAllergen.cleaningProtocol}
                  onChange={(e) => setNewAllergen({ ...newAllergen, cleaningProtocol: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Changeover Restriction</label>
                <textarea
                  rows={2}
                  placeholder="Mandatory QA clearance sign-off..."
                  value={newAllergen.changeoverRestriction}
                  onChange={(e) => setNewAllergen({ ...newAllergen, changeoverRestriction: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Allergen Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

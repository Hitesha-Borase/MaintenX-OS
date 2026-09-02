import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Activity,
  Percent,
  Sliders,
  FlaskConical,
  Eye,
  History,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { RevisionHistoryModal } from "../../../components/common/RevisionHistoryModal";
import { ApprovalWorkflowModal } from "../../../components/common/ApprovalWorkflowModal";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function QualitySpecsPage() {
  const { qualitySpecs = [], addQualitySpec, updateQualitySpec, approveQualitySpec, rejectQualitySpec, skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [skuFilter, setSkuFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [viewingSpec, setViewingSpec] = useState(null);
  const [revisionModalSpec, setRevisionModalSpec] = useState(null);
  const [approvalModalSpec, setApprovalModalSpec] = useState(null);

  const [newSpec, setNewSpec] = useState({
    skuId: "SKU-001",
    specificationTitle: "",
    parameter: "Soluble Solids (Brix)",
    target: "10.5",
    min: "10.3",
    max: "10.7",
    uom: "°Bx",
    criticality: "Critical CCP (HACCP-1)",
    testMethod: "Digital Refractometer"
  });

  const filteredSpecs = useMemo(() => {
    return qualitySpecs.filter((s) => {
      const matchesSku = skuFilter === "ALL" || s.skuId === skuFilter;
      const matchesApproval = approvalFilter === "ALL" || s.approvalStatus === approvalFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.parameter?.toLowerCase().includes(q) ||
        s.specId?.toLowerCase().includes(q) ||
        s.skuCode?.toLowerCase().includes(q) ||
        s.specificationTitle?.toLowerCase().includes(q) ||
        s.criticality?.toLowerCase().includes(q);

      return matchesSku && matchesApproval && matchesSearch;
    });
  }, [qualitySpecs, skuFilter, approvalFilter, searchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSpec.parameter.trim()) {
      addToast("Please provide quality parameter name.", "warning");
      return;
    }
    if (Number(newSpec.min) > Number(newSpec.max)) {
      addToast("Minimum tolerance cannot be greater than Maximum tolerance!", "warning");
      return;
    }

    const created = addQualitySpec(newSpec);
    addToast(`Specification ${created.specId} (${created.parameter}) registered!`, "success");
    setIsAddModalOpen(false);
    setNewSpec({
      skuId: "SKU-001",
      specificationTitle: "",
      parameter: "Soluble Solids (Brix)",
      target: "10.5",
      min: "10.3",
      max: "10.7",
      uom: "°Bx",
      criticality: "Critical CCP (HACCP-1)",
      testMethod: "Digital Refractometer"
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingSpec.parameter.trim()) return;
    updateQualitySpec(editingSpec.specId, editingSpec);
    addToast(`Specification ${editingSpec.specId} updated!`, "success");
    setEditingSpec(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Quality Specification & Parameter Master
            </h1>
            <Badge variant="cyan">{qualitySpecs.length} SPECIFICATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Quality Spec
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
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
          title="Active Approved Specs"
          value={qualitySpecs.filter((s) => s.approvalStatus === "Approved").length.toString()}
          unit="Certified"
          trend={{ value: "HACCP & food safety locked", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Critical CCP Parameters"
          value={qualitySpecs.filter((s) => s.criticality?.includes("CCP")).length.toString()}
          unit="Critical Limits"
          trend={{ value: "Automated alert triggers", isPositive: true, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Toleranced Products"
          value={skus.filter((s) => s.category === "Finished Goods").length.toString()}
          unit="SKUs Covered"
          trend={{ value: "100% finished product QA scope", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Trail Versioning"
          value="100%"
          unit="Part 11 Validated"
          trend={{ value: "Dual revision verification", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "180px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Linked SKUs</option>
              {skus.filter((s) => s.category === "Finished Goods").map((s) => (
                <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name.split(" ")[0]}</option>
              ))}
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "150px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredSpecs.length}</strong> of {qualitySpecs.length} Quality Specifications
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Spec ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Finished SKU</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Parameter Tested</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Value</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Tolerances [Min - Max]</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>UOM</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rev</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Criticality</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Approval</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.length > 0 ? (
                filteredSpecs.map((spec) => {
                  return (
                    <tr
                      key={spec.specId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {spec.specId}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {spec.skuName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {spec.skuCode}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>
                          {spec.parameter}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {spec.testMethod}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                          {spec.target} {spec.uom}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                          [{spec.min} - {spec.max} {spec.uom}]
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {spec.uom}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", padding: "2px 6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px" }}>
                          {spec.revision}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={spec.criticality?.includes("CCP") ? "rose" : "cyan"}>
                          {spec.criticality}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => setApprovalModalSpec(spec)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                          title="Click to view approval workflow"
                        >
                          <Badge variant={spec.approvalStatus === "Approved" ? "emerald" : "amber"}>
                            {spec.approvalStatus} ↗
                          </Badge>
                        </button>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={History}
                            onClick={() => setRevisionModalSpec(spec)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            title="View Revisions & Tolerances"
                          >
                            Revisions
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingSpec(spec)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                            title="Edit Specification"
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No quality parameter specifications match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE NEW QUALITY SPEC MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "620px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Define Quality Parameter Specification
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Finished Product SKU *</label>
                <select
                  value={newSpec.skuId}
                  onChange={(e) => setNewSpec({ ...newSpec, skuId: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {skus.filter((s) => s.category === "Finished Goods").map((s) => (
                    <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Parameter Tested *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moisture Content / Brix"
                    value={newSpec.parameter}
                    onChange={(e) => setNewSpec({ ...newSpec, parameter: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>UOM *</label>
                  <input
                    type="text"
                    placeholder="e.g. %, °Bx, pH, mL"
                    value={newSpec.uom}
                    onChange={(e) => setNewSpec({ ...newSpec, uom: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Target & Tolerances */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8C5B23", textTransform: "uppercase" }}>Target Value</label>
                  <input
                    type="text"
                    required
                    placeholder="5.0"
                    value={newSpec.target}
                    onChange={(e) => setNewSpec({ ...newSpec, target: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Minimum (LCL)</label>
                  <input
                    type="text"
                    required
                    placeholder="4.0"
                    value={newSpec.min}
                    onChange={(e) => setNewSpec({ ...newSpec, min: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Maximum (UCL)</label>
                  <input
                    type="text"
                    required
                    placeholder="6.0"
                    value={newSpec.max}
                    onChange={(e) => setNewSpec({ ...newSpec, max: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Category</label>
                  <select
                    value={newSpec.criticality}
                    onChange={(e) => setNewSpec({ ...newSpec, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Critical CCP (HACCP-1)">Critical CCP (HACCP-1)</option>
                    <option value="Quality Spec">Quality Spec (Sensory/Physical)</option>
                    <option value="Legal Metrology / Legal">Legal Metrology / Legal</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Test Method / Device</label>
                  <input
                    type="text"
                    placeholder="Digital Refractometer / pH Probe"
                    value={newSpec.testMethod}
                    onChange={(e) => setNewSpec({ ...newSpec, testMethod: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save & Lock Specification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {revisionModalSpec && (
        <RevisionHistoryModal
          isOpen={!!revisionModalSpec}
          onClose={() => setRevisionModalSpec(null)}
          entityCode={revisionModalSpec.specId}
          entityTitle={`Quality Parameter: ${revisionModalSpec.parameter} (${revisionModalSpec.skuName})`}
          revisions={revisionModalSpec.revisionHistory || []}
        />
      )}

      {/* APPROVAL WORKFLOW MODAL */}
      {approvalModalSpec && (
        <ApprovalWorkflowModal
          isOpen={!!approvalModalSpec}
          onClose={() => setApprovalModalSpec(null)}
          entityCode={approvalModalSpec.specId}
          entityTitle={`Quality Spec: ${approvalModalSpec.parameter}`}
          currentStatus={approvalModalSpec.approvalStatus}
          onSubmitForApproval={() => {
            updateQualitySpec(approvalModalSpec.specId, { approvalStatus: "Under Review" });
            addToast(`Spec ${approvalModalSpec.specId} submitted for Quality Review!`, "info");
          }}
          onApprove={() => {
            approveQualitySpec(approvalModalSpec.specId);
            addToast(`Spec ${approvalModalSpec.specId} approved!`, "success");
          }}
          onReject={(reason) => {
            rejectQualitySpec(approvalModalSpec.specId, reason);
            addToast(`Spec ${approvalModalSpec.specId} rejected!`, "error");
          }}
        />
      )}
    </div>
  );
}

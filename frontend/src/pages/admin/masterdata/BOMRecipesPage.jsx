import React, { useState, useMemo } from "react";
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
  ShieldCheck,
  Eye,
  History,
  Trash2,
  ArrowRight,
  FileCheck,
  AlertOctagon,
  RotateCcw
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { RevisionHistoryModal } from "../../../components/common/RevisionHistoryModal";
import { ApprovalWorkflowModal } from "../../../components/common/ApprovalWorkflowModal";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

export function BOMRecipesPage() {
  const { boms = [], addBOM, updateBOM, submitBOMForApproval, approveBOM, rejectBOM, skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState(null);
  const [revisionModalBOM, setRevisionModalBOM] = useState(null);
  const [approvalModalBOM, setApprovalModalBOM] = useState(null);

  // Form State for new BOM
  const [newBOM, setNewBOM] = useState({
    bomNumber: "",
    finishedSkuId: "SKU-001",
    batchSize: "10,000 Liters",
    yieldTarget: "99.2%",
    components: [
      { id: "c1", skuId: "SKU-101", skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx", quantity: 800, uom: "Liters" }
    ]
  });

  const filteredBOMs = useMemo(() => {
    return boms.filter((b) => {
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.bomNumber?.toLowerCase().includes(q) ||
        b.finishedSkuName?.toLowerCase().includes(q) ||
        b.revision?.toLowerCase().includes(q) ||
        b.createdBy?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [boms, statusFilter, searchQuery]);

  const handleAddComponent = () => {
    const defaultSku = skus.find((s) => s.category !== "Finished Goods") || skus[0];
    setNewBOM((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        {
          id: `c_${Date.now()}`,
          skuId: defaultSku?.skuId || "SKU-101",
          skuCode: defaultSku?.skuCode || "ING-1001",
          name: defaultSku?.name || "Liquid Cane Sugar",
          quantity: 100,
          uom: defaultSku?.uom || "Kg"
        }
      ]
    }));
  };

  const handleRemoveComponent = (compIdx) => {
    setNewBOM((prev) => ({
      ...prev,
      components: prev.components.filter((_, idx) => idx !== compIdx)
    }));
  };

  const handleCreateSubmit = (status = "Draft") => {
    const selectedSku = skus.find((s) => s.skuId === newBOM.finishedSkuId);
    if (!newBOM.components.length) {
      addToast("Please add at least one ingredient component to the recipe BOM.", "warning");
      return;
    }

    const created = addBOM({
      bomNumber: newBOM.bomNumber,
      finishedSkuId: newBOM.finishedSkuId,
      finishedSkuName: selectedSku?.name || "Finished Beverage",
      batchSize: newBOM.batchSize,
      yieldTarget: newBOM.yieldTarget,
      components: newBOM.components
    });

    if (status === "Submitted") {
      submitBOMForApproval(created.bomId);
      addToast(`BOM ${created.bomNumber} created & submitted for Quality Approval!`, "success");
    } else {
      addToast(`BOM ${created.bomNumber} saved as Draft!`, "success");
    }

    setIsAddModalOpen(false);
  };

  const handleEditAddComponent = () => {
    if (!editingBOM) return;
    const defaultSku = skus.find((s) => s.category !== "Finished Goods") || skus[0];
    setEditingBOM((prev) => ({
      ...prev,
      components: [
        ...(prev.components || []),
        {
          id: `c_${Date.now()}`,
          skuId: defaultSku?.skuId || "SKU-101",
          skuCode: defaultSku?.skuCode || "ING-1001",
          name: defaultSku?.name || "Liquid Cane Sugar",
          quantity: 100,
          uom: defaultSku?.uom || "Kg"
        }
      ]
    }));
  };

  const handleEditRemoveComponent = (compIdx) => {
    if (!editingBOM) return;
    setEditingBOM((prev) => ({
      ...prev,
      components: (prev.components || []).filter((_, idx) => idx !== compIdx)
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingBOM) return;
    if (!editingBOM.components?.length) {
      addToast("Please add at least one ingredient component to the recipe BOM.", "warning");
      return;
    }
    const selectedSku = skus.find((s) => s.skuId === editingBOM.finishedSkuId);
    updateBOM(editingBOM.bomId, {
      finishedSkuId: editingBOM.finishedSkuId,
      finishedSkuName: selectedSku?.name || editingBOM.finishedSkuName,
      batchSize: editingBOM.batchSize,
      yieldTarget: editingBOM.yieldTarget,
      components: editingBOM.components
    });
    addToast(`Recipe BOM ${editingBOM.bomNumber} updated successfully!`, "success");
    setEditingBOM(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Bill of Materials (BOM) & Recipe Management
            </h1>
            <Badge variant="emerald">{boms.length} CONTROLLED FORMULAS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create Recipe Formula
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
          title="Active Formulations"
          value={boms.filter((b) => b.status === "Active").length.toString()}
          unit="Approved"
          trend={{ value: "Production ready recipes", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="emerald"
        />
        <StatCard
          title="Under Review / Draft"
          value={boms.filter((b) => b.status !== "Active").length.toString()}
          unit="Formulas"
          trend={{ value: "Pending quality approval", isPositive: true, text: "" }}
          icon={FileText}
          colorVariant="amber"
        />
        <StatCard
          title="Target Formulation Yield"
          value="99.3%"
          unit="Average"
          trend={{ value: "Material scrap factor < 0.8%", isPositive: true, text: "" }}
          icon={Percent}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Traceability"
          value="100%"
          unit="21 CFR P11"
          trend={{ value: "Revision comparison enabled", isPositive: true, text: "" }}
          icon={ShieldCheck}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "160px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredBOMs.length}</strong> of {boms.length} Formulas
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>BOM Number</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Finished Product / SKU</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Revision</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Batch Size</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Ingredients</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Approval Flow</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Last Updated</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBOMs.length > 0 ? (
                filteredBOMs.map((bom) => {
                  return (
                    <tr
                      key={bom.bomId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {bom.bomNumber}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {bom.finishedSkuName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          SKU ID: {bom.finishedSkuId}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", padding: "2px 6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px" }}>
                          {bom.revision}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {bom.batchSize}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{bom.components?.length || 0} Components</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={bom.status === "Active" ? "emerald" : bom.status === "Under Review" ? "cyan" : "amber"}>
                          {bom.status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => setApprovalModalBOM(bom)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                          title="Click to view/advance approval workflow"
                        >
                          <Badge variant={bom.approvalStatus === "Approved" ? "emerald" : "rose"}>
                            {bom.approvalStatus} ↗
                          </Badge>
                        </button>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          {bom.lastUpdated}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          by {bom.createdBy}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingBOM({ ...bom })}
                            style={{ padding: "6px 8px" }}
                            title="Edit BOM Recipe"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={History}
                            onClick={() => setRevisionModalBOM(bom)}
                            style={{ padding: "6px 8px" }}
                            title="View Revision History & Diff"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={FileCheck}
                            onClick={() => setApprovalModalBOM(bom)}
                            style={{ padding: "6px 8px" }}
                            title="Approval Workflow"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No BOM & Recipe records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE NEW BOM MODAL */}
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
              maxWidth: "750px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FlaskConical size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Create New BOM / Recipe Formulation
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>BOM Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BOM-5004"
                    value={newBOM.bomNumber}
                    onChange={(e) => setNewBOM({ ...newBOM, bomNumber: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Finished Target SKU *</label>
                  <select
                    value={newBOM.finishedSkuId}
                    onChange={(e) => setNewBOM({ ...newBOM, finishedSkuId: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {skus.filter((s) => s.category === "Finished Goods").map((s) => (
                      <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Standard Batch Volume</label>
                  <input
                    type="text"
                    value={newBOM.batchSize}
                    onChange={(e) => setNewBOM({ ...newBOM, batchSize: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Yield %</label>
                  <input
                    type="text"
                    value={newBOM.yieldTarget}
                    onChange={(e) => setNewBOM({ ...newBOM, yieldTarget: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Component Ingredients Builder */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Ingredients & Components ({newBOM.components.length})
                  </label>
                  <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddComponent} style={{ fontSize: "11px", padding: "3px 8px" }}>
                    Add Ingredient
                  </Button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {newBOM.components.map((comp, idx) => (
                    <div
                      key={comp.id || idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 36px",
                        gap: "8px",
                        alignItems: "center",
                        backgroundColor: "var(--bg-card-subtle)",
                        padding: "8px 10px",
                        borderRadius: "8px"
                      }}
                    >
                      <select
                        value={comp.skuId}
                        onChange={(e) => {
                          const picked = skus.find((s) => s.skuId === e.target.value);
                          const updated = [...newBOM.components];
                          updated[idx] = {
                            ...comp,
                            skuId: picked?.skuId,
                            skuCode: picked?.skuCode,
                            name: picked?.name,
                            uom: picked?.uom
                          };
                          setNewBOM({ ...newBOM, components: updated });
                        }}
                        className="form-input"
                        style={{ height: "32px", fontSize: "12px" }}
                      >
                        {skus.map((s) => (
                          <option key={s.skuId} value={s.skuId}>{s.skuCode} ({s.name})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        placeholder="Qty"
                        value={comp.quantity}
                        onChange={(e) => {
                          const updated = [...newBOM.components];
                          updated[idx] = { ...comp, quantity: Number(e.target.value) };
                          setNewBOM({ ...newBOM, components: updated });
                        }}
                        className="form-input"
                        style={{ height: "32px", fontSize: "12px" }}
                      />

                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        {comp.uom}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#DC2626" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                Cancel
              </Button>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" onClick={() => handleCreateSubmit("Draft")} style={{ fontSize: "12px" }}>
                  Save as Draft
                </Button>
                <Button variant="primary" icon={ArrowRight} onClick={() => handleCreateSubmit("Submitted")} style={{ fontSize: "12px" }}>
                  Submit for Approval
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {revisionModalBOM && (
        <RevisionHistoryModal
          isOpen={!!revisionModalBOM}
          onClose={() => setRevisionModalBOM(null)}
          entityCode={revisionModalBOM.bomNumber}
          entityTitle={`Formula for ${revisionModalBOM.finishedSkuName}`}
          revisions={revisionModalBOM.revisionHistory || []}
        />
      )}

      {/* APPROVAL WORKFLOW MODAL */}
      {approvalModalBOM && (
        <ApprovalWorkflowModal
          isOpen={!!approvalModalBOM}
          onClose={() => setApprovalModalBOM(null)}
          entityCode={approvalModalBOM.bomNumber}
          entityTitle={`BOM Formula: ${approvalModalBOM.finishedSkuName}`}
          currentStatus={approvalModalBOM.status}
          onSubmitForApproval={() => submitBOMForApproval(approvalModalBOM.bomId)}
          onApprove={() => approveBOM(approvalModalBOM.bomId, "Sarah Jenkins")}
          onReject={(reason) => rejectBOM(approvalModalBOM.bomId, reason)}
          onRequestChanges={(note) => {
            rejectBOM(approvalModalBOM.bomId, note);
            addToast(`Change request registered for ${approvalModalBOM.bomNumber}!`, "info");
          }}
        />
      )}

      {/* EDIT BOM MODAL */}
      {editingBOM && (
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
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setEditingBOM(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid var(--border-subtle)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Recipe Formula — {editingBOM.bomNumber}
                </h2>
              </div>
              <button
                onClick={() => setEditingBOM(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                      Target Finished SKU
                    </label>
                    <select
                      value={editingBOM.finishedSkuId}
                      onChange={(e) => {
                        const s = skus.find((item) => item.skuId === e.target.value);
                        setEditingBOM({ ...editingBOM, finishedSkuId: e.target.value, finishedSkuName: s?.name || editingBOM.finishedSkuName });
                      }}
                      className="form-input"
                    >
                      {skus.map((s) => (
                        <option key={s.skuId} value={s.skuId}>
                          {s.skuCode} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                      Standard Batch Size
                    </label>
                    <input
                      type="text"
                      value={editingBOM.batchSize}
                      onChange={(e) => setEditingBOM({ ...editingBOM, batchSize: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                    Expected Yield Target (%)
                  </label>
                  <input
                    type="text"
                    value={editingBOM.yieldTarget}
                    onChange={(e) => setEditingBOM({ ...editingBOM, yieldTarget: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                      Recipe Ingredients / BOM Components ({editingBOM.components?.length || 0})
                    </label>
                    <Button variant="secondary" size="sm" icon={Plus} type="button" onClick={handleEditAddComponent} style={{ fontSize: "11px", padding: "3px 8px" }}>
                      Add Ingredient
                    </Button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(editingBOM.components || []).map((comp, idx) => (
                      <div
                        key={comp.id || idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr 36px",
                          gap: "8px",
                          alignItems: "center",
                          backgroundColor: "var(--bg-card-subtle)",
                          padding: "8px 10px",
                          borderRadius: "8px"
                        }}
                      >
                        <select
                          value={comp.skuId}
                          onChange={(e) => {
                            const picked = skus.find((s) => s.skuId === e.target.value);
                            const updated = [...editingBOM.components];
                            updated[idx] = {
                              ...comp,
                              skuId: picked?.skuId,
                              skuCode: picked?.skuCode,
                              name: picked?.name,
                              uom: picked?.uom
                            };
                            setEditingBOM({ ...editingBOM, components: updated });
                          }}
                          className="form-input"
                          style={{ height: "32px", fontSize: "12px" }}
                        >
                          {skus.map((s) => (
                            <option key={s.skuId} value={s.skuId}>{s.skuCode} ({s.name})</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          placeholder="Qty"
                          value={comp.quantity}
                          onChange={(e) => {
                            const updated = [...editingBOM.components];
                            updated[idx] = { ...comp, quantity: Number(e.target.value) };
                            setEditingBOM({ ...editingBOM, components: updated });
                          }}
                          className="form-input"
                          style={{ height: "32px", fontSize: "12px" }}
                        />

                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {comp.uom}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEditRemoveComponent(idx)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#DC2626" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "8px", backgroundColor: "var(--bg-card-subtle)" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingBOM(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

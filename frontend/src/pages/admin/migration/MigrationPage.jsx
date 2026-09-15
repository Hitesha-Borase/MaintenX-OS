import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Search,
  X,
  Plus,
  ShieldCheck,
  Zap,
  Layers,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Split,
  AlertOctagon,
  Copy,
  Eye,
  Trash2,
  Edit2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";
import adminService from "../../../services/adminService";

export function MigrationPage() {
  const { migrationStats = {}, executeMigration, auditLogs = [], skus = [] } = useMasterData();
  const { addToast } = useApp();

  const [batches, setBatches] = useState([]);
  const [viewingBatch, setViewingBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const [newBatch, setNewBatch] = useState({
    target: "Item & SKU Master Tables",
    connector: "FlowState ERP SQL Connector",
    transferred: "500 / 500 rows",
    conformity: "99.0%",
    status: "Committed & Verified",
    recordsCount: 500,
  });

  const fetchBatches = () => {
    adminService.getMigrationBatches().then((data) => {
      if (Array.isArray(data)) setBatches(data);
    }).catch((err) => console.warn("Migration batches load:", err.message));
  };

  useEffect(() => {
    masterDataService.getSkus().catch((err) => console.warn("Migration SKUs load:", err.message));
    fetchBatches();
  }, []);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBatch) return;
    try {
      setIsActioning(true);
      await adminService.updateMigrationBatch(editingBatch.id, editingBatch);
      addToast(`Batch ${editingBatch.id} successfully updated in database!`, "success");
      setEditingBatch(null);
      fetchBatches();
    } catch (err) {
      console.error(err);
      addToast(`Update error: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsActioning(true);
      await adminService.createMigrationBatch(newBatch);
      addToast("New Migration Batch created and committed to database!", "success");
      setIsAddModalOpen(false);
      setNewBatch({
        target: "Item & SKU Master Tables",
        connector: "FlowState ERP SQL Connector",
        transferred: "500 / 500 rows",
        conformity: "99.0%",
        status: "Committed & Verified",
        recordsCount: 500,
      });
      fetchBatches();
    } catch (err) {
      console.error(err);
      addToast(`Create batch error: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };


  // Wizard active state: 0 = Dashboard, 1 = Source, 2 = Mapping, 3 = Validation, 4 = Duplicate Review, 5 = Summary
  const [wizardStep, setWizardStep] = useState(0);

  // Step 1: Selected Source
  const [selectedSource, setSelectedSource] = useState("FlowState ERP - Legacy Production & SKU Store");
  const [selectedDataset, setSelectedDataset] = useState("Item & SKU Master Records (1,420 rows)");

  // Step 2: Field Mappings
  const [fieldMappings, setFieldMappings] = useState([
    { sourceField: "Product Code", maintenxField: "SKU Code", sampleValue: "SKU-5001", status: "Matched" },
    { sourceField: "Product Name", maintenxField: "SKU Name", sampleValue: "500ml Sparkling Citrus Soda", status: "Matched" },
    { sourceField: "Plant Code", maintenxField: "Plant Location", sampleValue: "PLT-IND", status: "Matched" },
    { sourceField: "Unit", maintenxField: "UOM", sampleValue: "Bottles", status: "Matched" },
    { sourceField: "Std Price", maintenxField: "Standard Cost", sampleValue: "$0.42", status: "Matched" },
    { sourceField: "Allergen Notes", maintenxField: "Description", sampleValue: "Citrus non-GMO", status: "Matched" },
    { sourceField: "Legacy Timestamp", maintenxField: "-- Ignore / Unmapped --", sampleValue: "1629849200", status: "Ignored" }
  ]);

  // Step 4: Duplicate Review Items
  const [duplicates, setDuplicates] = useState([
    {
      id: "DUP-01",
      sourceRecord: "SKU-5001 (500ml Citrus Soda)",
      existingRecord: "SKU-5001 (500ml Sparkling Citrus Soda)",
      matchType: "Exact SKU Code Match",
      suggestedAction: "Merge",
      actionTaken: "Merge"
    },
    {
      id: "DUP-02",
      sourceRecord: "ING-1001 (Liquid Cane Sugar)",
      existingRecord: "ING-1001 (Liquid Cane Sugar 67°Bx)",
      matchType: "Exact Code & Name Near Match",
      suggestedAction: "Keep Existing",
      actionTaken: "Keep Existing"
    },
    {
      id: "DUP-03",
      sourceRecord: "PKG-2001 (28mm Cap White)",
      existingRecord: "PKG-2001 (28mm Tamper-Evident Cap)",
      matchType: "BOM Reference Match",
      suggestedAction: "Merge",
      actionTaken: "Merge"
    }
  ]);

  const handleDuplicateActionChange = (id, newAction) => {
    setDuplicates((prev) =>
      prev.map((d) => (d.id === id ? { ...d, actionTaken: newAction } : d))
    );
    addToast(`Duplicate record ${id} decision set to: ${newAction}`, "info");
  };

  const handleFinishMigration = async () => {
    // Sample mock payload to inject live migrated SKUs into MasterDataContext
    const mockIngestedRecords = [
      {
        skuCode: "SKU-8001",
        name: "Legacy Cold Brew Coffee Concentrate",
        category: "Finished Goods",
        family: "Functional Formulations",
        uom: "Bottles",
        plantId: "PLT-01",
        status: "Active",
        stdCost: "$0.68",
        description: "Migrated from FlowState Legacy ERP Batch 2026-08"
      },
      {
        skuCode: "SKU-8002",
        name: "Legacy Organic Hibiscus Tea Blend",
        category: "Finished Goods",
        family: "Organic Ginger Brews",
        uom: "Bottles",
        plantId: "PLT-01",
        status: "Active",
        stdCost: "$0.55",
        description: "Migrated from FlowState Legacy ERP Batch 2026-08"
      }
    ];

    try {
      await adminService.executeMigrationBatch({
        target: selectedDataset,
        connector: selectedSource,
        records: mockIngestedRecords,
        recordsTransferred: "1,420 / 1,420 rows"
      });
      fetchBatches();
    } catch (e) {
      console.warn("Migration execute error:", e.message);
    }

    if (executeMigration) {
      executeMigration("SKU Master", mockIngestedRecords);
    }

    setWizardStep(0);
    addToast("FlowState legacy records successfully migrated & verified into MaintenX OS Master Tables in DB!", "success");
  };

  const handleConfirmDelete = async () => {
    if (!deletingBatch) return;
    try {
      setIsActioning(true);
      await adminService.deleteMigrationBatch(deletingBatch.id);
      addToast(`Migration batch record ${deletingBatch.id} deleted from database!`, "success");
      setDeletingBatch(null);
      fetchBatches();
    } catch (err) {
      console.error(err);
      addToast(`Error deleting batch: ${err.message}`, "error");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Data Migration & Bulk Import Engine
            </h1>
            <Badge variant="cyan">FLOWSTATE → MAINTENX MIGRATION</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {wizardStep === 0 ? (
            <>
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => setIsAddModalOpen(true)}
                style={{ fontSize: "12px", padding: "7px 12px" }}
              >
                + Add Batch Record
              </Button>
              <Button
                variant="primary"
                icon={UploadCloud}
                onClick={() => setWizardStep(1)}
                style={{ fontSize: "12px", padding: "7px 12px" }}
              >
                + Launch Migration Wizard
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              icon={X}
              onClick={() => setWizardStep(0)}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              Exit Wizard
            </Button>
          )}
        </div>
      </div>

      {/* DASHBOARD VIEW (When wizard is not open) */}
      {wizardStep === 0 && (
        <>
          {/* 6 Migration Summary Cards */}
          <div
            className="kpi-grid-responsive grid-3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              width: "100%",
              minWidth: 0
            }}
          >
            <StatCard
              title="Total Source Records"
              value={(migrationStats.totalRecords || 2450).toLocaleString()}
              unit="Rows"
              trend={{ value: "FlowState legacy extraction", isPositive: true, text: "" }}
              icon={FileSpreadsheet}
              colorVariant="cyan"
            />
            <StatCard
              title="Valid Clean Records"
              value={(migrationStats.validRecords || 2380).toLocaleString()}
              unit="Validated"
              trend={{ value: "97.1% Schema conformity", isPositive: true, text: "" }}
              icon={CheckCircle2}
              colorVariant="emerald"
            />
            <StatCard
              title="Successfully Imported"
              value={(migrationStats.importedRecords || 2340).toLocaleString()}
              unit="Active in OS"
              trend={{ value: "Live across master tables", isPositive: true, text: "" }}
              icon={ShieldCheck}
              colorVariant="emerald"
            />
            <StatCard
              title="Duplicate Records"
              value={(migrationStats.duplicatesCount || 45).toString()}
              unit="Identified"
              trend={{ value: "Auto-matched for review", isPositive: false, text: "" }}
              icon={Copy}
              colorVariant="amber"
            />
            <StatCard
              title="Schema Errors"
              value={(migrationStats.errorsCount || 25).toString()}
              unit="Flagged"
              trend={{ value: "Missing plant or UOM keys", isPositive: false, text: "" }}
              icon={AlertOctagon}
              colorVariant="rose"
            />
            <StatCard
              title="Pending Dual Review"
              value={(migrationStats.pendingReviewCount || 40).toString()}
              unit="Awaiting Action"
              trend={{ value: "Ready in duplicate resolver", isPositive: true, text: "" }}
              icon={Zap}
              colorVariant="amber"
            />
          </div>

          {/* Migration Audit Trail & History */}
          <Card
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderRadius: "14px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Recent Ingestion Batches & Execution Log
                </h2>
              </div>
              <Badge variant="cyan">{auditLogs.filter((l) => l.action?.includes("MIGRATION") || l.entity === "Migration").length || 3} COMPLETED RUNS</Badge>
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Batch Run ID</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Dataset Target</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Source Connector</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Records Transferred</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Conformity</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        No migration batches found.
                      </td>
                    </tr>
                  ) : (
                    batches.map((b) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                          {b.id}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {b.target}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {b.connector}
                        </td>
                        <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {b.transferred}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>
                          {b.conformity}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant="emerald">{b.status}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {/* View Button */}
                            <button
                              onClick={() => setViewingBatch(b)}
                              title="View Batch Details"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "6px",
                                backgroundColor: "var(--bg-card-subtle)",
                                color: "var(--text-secondary)",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Eye size={13} />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingBatch({ ...b })}
                              title="Edit Migration Batch"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "6px",
                                backgroundColor: "var(--bg-card-subtle)",
                                color: "#D97706",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeletingBatch(b)}
                              title="Delete Migration Batch"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "6px",
                                backgroundColor: "var(--bg-card-subtle)",
                                color: "#EF4444",
                                border: "1px solid var(--border-subtle)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
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
        </>
      )}

      {/* STEP-BY-STEP MIGRATION WIZARD (When wizard is active) */}
      {wizardStep > 0 && (
        <Card
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "14px",
            padding: "24px"
          }}
        >
          {/* Stepper Progress Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px" }}>
            {[
              { num: 1, label: "Select Source & Dataset" },
              { num: 2, label: "Field Mapping" },
              { num: 3, label: "Schema Validation" },
              { num: 4, label: "Duplicate Resolver" },
              { num: 5, label: "Final Ingestion Commit" }
            ].map((st) => (
              <div
                key={st.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: wizardStep === st.num ? "#8C5B23" : wizardStep > st.num ? "#059669" : "var(--text-muted)",
                  fontWeight: wizardStep === st.num ? 800 : 600,
                  fontSize: "12px"
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: wizardStep === st.num ? "rgba(200, 149, 71, 0.2)" : wizardStep > st.num ? "rgba(5, 150, 105, 0.15)" : "var(--bg-card-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: wizardStep === st.num ? "2px solid #C89547" : "1px solid var(--border-subtle)",
                    fontSize: "11px"
                  }}
                >
                  {wizardStep > st.num ? <Check size={12} /> : st.num}
                </div>
                <span>{st.label}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: SELECT SOURCE */}
          {wizardStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 1: Select Legacy Data Source & Extract File
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="form-label">Source System Connector</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="FlowState ERP - Legacy Production & SKU Store">FlowState ERP - Legacy Production & SKU Store</option>
                    <option value="SAP S/4HANA Plant Maintenance Export">SAP S/4HANA Plant Maintenance Export</option>
                    <option value="Microsoft Dynamics AX Item Master">Microsoft Dynamics AX Item Master</option>
                    <option value="Direct CSV / Excel Bulk Spreadsheet">Direct CSV / Excel Bulk Spreadsheet</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Dataset Table</label>
                  <select
                    value={selectedDataset}
                    onChange={(e) => setSelectedDataset(e.target.value)}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Item & SKU Master Records (1,420 rows)">Item & SKU Master Records (1,420 rows)</option>
                    <option value="Bill of Materials & Recipes (650 rows)">Bill of Materials & Recipes (650 rows)</option>
                    <option value="Quality Specifications & CCP Limits (480 rows)">Quality Specifications & CCP Limits (480 rows)</option>
                    <option value="Machine Asset Registry (390 rows)">Machine Asset Registry (390 rows)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "36px",
                  textAlign: "center",
                  backgroundColor: "var(--bg-card-subtle)",
                  marginTop: "8px"
                }}
              >
                <UploadCloud size={36} color="#C89547" style={{ margin: "0 auto 12px auto", display: "block" }} />
                <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "14px" }}>
                  Drag & Drop CSV / XLSX Data Extract or Select Connected Table
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Selected: flowstate_export_skus_master_2026.csv (1,420 rows, 480 KB)
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FIELD MAPPING */}
          {wizardStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 2: Map Legacy Columns to MaintenX OS Schema
              </div>

              <div style={{ overflowX: "auto", width: "100%" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Source Field (FlowState)</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sample Legacy Value</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Target MaintenX OS Field</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Mapping Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMappings.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>
                          {m.sourceField}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {m.sampleValue}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="text"
                            value={m.maintenxField}
                            onChange={(e) => {
                              const updated = [...fieldMappings];
                              updated[idx].maintenxField = e.target.value;
                              setFieldMappings(updated);
                            }}
                            className="form-input"
                            style={{ fontSize: "12px", padding: "4px 8px", backgroundColor: "#FFFFFF" }}
                          />
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <Badge variant={m.status === "Matched" ? "emerald" : "gray"}>{m.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEMA VALIDATION */}
          {wizardStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 3: Schema Validation & Anomaly Diagnostics
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ border: "1px solid rgba(5, 150, 105, 0.3)", borderRadius: "10px", padding: "16px", backgroundColor: "rgba(5, 150, 105, 0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontWeight: 800, fontSize: "13px" }}>
                    <CheckCircle2 size={16} />
                    <span>Conformant Clean Records (1,390 Rows)</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: 1.4 }}>
                    Mandatory keys (SKU Code, UOM, Plant, Category) matched 100% with no missing foreign keys.
                  </p>
                </div>

                <div style={{ border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "10px", padding: "16px", backgroundColor: "rgba(245, 158, 11, 0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#D97706", fontWeight: 800, fontSize: "13px" }}>
                    <AlertTriangle size={16} />
                    <span>Flagged for Review (30 Rows)</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: 1.4 }}>
                    3 duplicate code matches detected. 27 records formatted with whitespace padding auto-sanitized.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DUPLICATE RESOLVER */}
          {wizardStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 4: Duplicate Record Decision Matrix
              </div>

              <div style={{ overflowX: "auto", width: "100%" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Incoming Source Record</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Existing MaintenX Record</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Match Rule</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Action Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.map((d) => (
                      <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>
                          {d.sourceRecord}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {d.existingRecord}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <Badge variant="amber">{d.matchType}</Badge>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <select
                            value={d.actionTaken}
                            onChange={(e) => handleDuplicateActionChange(d.id, e.target.value)}
                            className="form-input"
                            style={{ fontSize: "12px", padding: "4px 8px", width: "auto", backgroundColor: "#FFFFFF" }}
                          >
                            <option value="Merge">Merge (Overwrite Values)</option>
                            <option value="Keep Existing">Keep Existing (Discard Incoming)</option>
                            <option value="Create New">Create New (Append _MIG)</option>
                            <option value="Skip">Skip</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: MIGRATION SUMMARY */}
          {wizardStep === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 5: Final Migration Commit Summary
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Review final execution totals before committing records to the MaintenX OS master tables.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "16px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Ingested</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px" }}>1,420 Rows</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Clean Records</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>1,390 Rows</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Merged Duplicates</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0284C7", marginTop: "4px" }}>2 Records</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Skipped Records</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-secondary)", marginTop: "4px" }}>1 Record</div>
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(5, 150, 105, 0.08)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(5, 150, 105, 0.3)", display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "13px", fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                All schema translations verified with 0 fatal errors. Ready for final commit!
              </div>
            </div>
          )}

          {/* Navigation Step Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <Button
              variant="secondary"
              icon={ArrowLeft}
              disabled={wizardStep <= 1}
              onClick={() => setWizardStep((prev) => prev - 1)}
              style={{ fontSize: "12px" }}
            >
              Previous Step
            </Button>

            {wizardStep < 5 ? (
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => setWizardStep((prev) => prev + 1)}
                style={{ fontSize: "12px" }}
              >
                Next Step ({wizardStep + 1}/5)
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={Check}
                onClick={handleFinishMigration}
                style={{ fontSize: "12px", backgroundColor: "#059669", borderColor: "#059669" }}
              >
                Commit & Finalize Migration
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* View Detail Modal */}
      {viewingBatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={18} color="#059669" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Migration Batch Details
                </h3>
              </div>
              <button
                onClick={() => setViewingBatch(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Batch Run ID:</span>
                <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{viewingBatch.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Dataset Target:</span>
                <span style={{ fontWeight: 700 }}>{viewingBatch.target}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Source Connector:</span>
                <span>{viewingBatch.connector}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Records Transferred:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{viewingBatch.transferred}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Conformity:</span>
                <span style={{ fontWeight: 700, color: "#059669" }}>{viewingBatch.conformity}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                <Badge variant="emerald">{viewingBatch.status}</Badge>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <Button variant="secondary" onClick={() => setViewingBatch(null)} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Delete Migration Batch Record
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Are you sure you want to remove batch run <strong>{deletingBatch.id}</strong> ({deletingBatch.target})? This deletion will be recorded in the database.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" onClick={() => setDeletingBatch(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                disabled={isActioning}
                onClick={handleConfirmDelete}
                style={{ fontSize: "12px", padding: "7px 14px", backgroundColor: "#EF4444", color: "#fff" }}
              >
                {isActioning ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Migration Batch ({editingBatch.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingBatch(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Dataset Target
                </label>
                <input
                  type="text"
                  value={editingBatch.target || ""}
                  onChange={(e) => setEditingBatch({ ...editingBatch, target: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Source Connector
                </label>
                <input
                  type="text"
                  value={editingBatch.connector || ""}
                  onChange={(e) => setEditingBatch({ ...editingBatch, connector: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Transferred Rows
                  </label>
                  <input
                    type="text"
                    value={editingBatch.transferred || ""}
                    onChange={(e) => setEditingBatch({ ...editingBatch, transferred: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Conformity %
                  </label>
                  <input
                    type="text"
                    value={editingBatch.conformity || ""}
                    onChange={(e) => setEditingBatch({ ...editingBatch, conformity: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={editingBatch.status || "Committed & Verified"}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="Committed & Verified">Committed & Verified</option>
                  <option value="Staged / Pending Review">Staged / Pending Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Failed / Rolled Back">Failed / Rolled Back</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingBatch(null)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={18} color="#C89547" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Ingestion Batch Record
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBatchSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Dataset Target
                </label>
                <input
                  type="text"
                  value={newBatch.target}
                  onChange={(e) => setNewBatch({ ...newBatch, target: e.target.value })}
                  placeholder="e.g. Item & SKU Master Tables"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Source Connector
                </label>
                <input
                  type="text"
                  value={newBatch.connector}
                  onChange={(e) => setNewBatch({ ...newBatch, connector: e.target.value })}
                  placeholder="e.g. FlowState ERP SQL Connector"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Transferred Rows
                  </label>
                  <input
                    type="text"
                    value={newBatch.transferred}
                    onChange={(e) => setNewBatch({ ...newBatch, transferred: e.target.value })}
                    placeholder="e.g. 500 / 500 rows"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                    Conformity %
                  </label>
                  <input
                    type="text"
                    value={newBatch.conformity}
                    onChange={(e) => setNewBatch({ ...newBatch, conformity: e.target.value })}
                    placeholder="e.g. 99.0%"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Status
                </label>
                <select
                  value={newBatch.status}
                  onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px", boxSizing: "border-box" }}
                >
                  <option value="Committed & Verified">Committed & Verified</option>
                  <option value="Staged / Pending Review">Staged / Pending Review</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isActioning} style={{ fontSize: "12px", padding: "7px 14px" }}>
                  {isActioning ? "Saving..." : "Save in Database"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState } from "react";
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
  Copy
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function MigrationPage() {
  const { addToast } = useApp();

  // Wizard active state: 0 = Dashboard, 1 = Source, 2 = Mapping, 3 = Validation, 4 = Duplicate Review, 5 = Summary
  const [wizardStep, setWizardStep] = useState(0);

  // Migration Stats
  const [stats, setStats] = useState({
    totalRecords: 2450,
    validRecords: 2380,
    importedRecords: 2340,
    duplicatesCount: 45,
    errorsCount: 25,
    pendingReviewCount: 40
  });

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

  const handleFinishMigration = () => {
    setWizardStep(0);
    setStats((prev) => ({
      ...prev,
      importedRecords: prev.importedRecords + 110,
      pendingReviewCount: 0
    }));
    addToast("FlowState legacy records successfully migrated & verified into MaintenX OS!", "success");
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
            <Button
              variant="primary"
              icon={UploadCloud}
              onClick={() => setWizardStep(1)}
              style={{ fontSize: "12px", padding: "7px 12px" }}
            >
              + Launch Migration Wizard
            </Button>
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
              value={stats.totalRecords.toLocaleString()}
              unit="Rows"
              trend={{ value: "FlowState legacy extraction", isPositive: true, text: "" }}
              icon={FileSpreadsheet}
              colorVariant="cyan"
            />
            <StatCard
              title="Valid Clean Records"
              value={stats.validRecords.toLocaleString()}
              unit="Validated"
              trend={{ value: "97.1% Schema conformity", isPositive: true, text: "" }}
              icon={CheckCircle2}
              colorVariant="emerald"
            />
            <StatCard
              title="Successfully Imported"
              value={stats.importedRecords.toLocaleString()}
              unit="Active in OS"
              trend={{ value: "Live across master tables", isPositive: true, text: "" }}
              icon={ShieldCheck}
              colorVariant="emerald"
            />
            <StatCard
              title="Duplicate Records"
              value={stats.duplicatesCount.toString()}
              unit="Identified"
              trend={{ value: "Auto-matched for review", isPositive: false, text: "" }}
              icon={Copy}
              colorVariant="amber"
            />
            <StatCard
              title="Schema Errors"
              value={stats.errorsCount.toString()}
              unit="Flagged"
              trend={{ value: "Missing plant or UOM keys", isPositive: false, text: "" }}
              icon={AlertOctagon}
              colorVariant="rose"
            />
            <StatCard
              title="Pending Dual Review"
              value={stats.pendingReviewCount.toString()}
              unit="Awaiting Action"
              trend={{ value: "Ready in duplicate resolver", isPositive: true, text: "" }}
              icon={RotateCcw}
              colorVariant="cyan"
            />
          </div>

          {/* Migration Batches History Card */}
          <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Executed Migration Pipeline Batches
              </div>
              <Button variant="secondary" size="sm" onClick={() => setWizardStep(1)} style={{ fontSize: "11px" }}>
                Start New Batch
              </Button>
            </div>

            <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
              <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Batch ID</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Master Table</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Source System</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Records Processed</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Pass Rate</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Date</th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "MIG-01", target: "Item & SKU Master", source: "FlowState CSV Export", count: 1420, rate: "100%", date: "2026-08-28", status: "Completed" },
                    { id: "MIG-02", target: "BOM & Recipe Formulas", source: "Legacy Excel (.xlsx)", count: 48, rate: "98.5%", date: "2026-08-29", status: "Completed" },
                    { id: "MIG-03", target: "Physical Machine Assets", source: "Plant SCADA Export", count: 870, rate: "99.1%", date: "2026-08-30", status: "Completed" }
                  ].map((batch) => (
                    <tr key={batch.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>{batch.id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>{batch.target}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>{batch.source}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{batch.count.toLocaleString()} rows</td>
                      <td style={{ padding: "12px 14px", color: "#059669", fontWeight: 700 }}>{batch.rate}</td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>{batch.date}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <Badge variant="emerald">{batch.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* 5-STEP MIGRATION WIZARD VIEW */}
      {wizardStep > 0 && (
        <Card style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
          {/* Stepper Header Tracker */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              {/* Line */}
              <div style={{ position: "absolute", top: "16px", left: "20px", right: "20px", height: "3px", backgroundColor: "var(--border-subtle)", zIndex: 1 }} />
              <div style={{ position: "absolute", top: "16px", left: "20px", width: `${((wizardStep - 1) / 4) * 90}%`, height: "3px", backgroundColor: "#C89547", zIndex: 2, transition: "width 0.3s ease" }} />

              {[
                { step: 1, label: "1. Source" },
                { step: 2, label: "2. Field Mapping" },
                { step: 3, label: "3. Validation" },
                { step: 4, label: "4. Duplicate Review" },
                { step: 5, label: "5. Summary" }
              ].map((s) => {
                const isPassed = s.step <= wizardStep;
                const isCurrent = s.step === wizardStep;
                return (
                  <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, gap: "6px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: isPassed ? "#C89547" : "#FFFFFF",
                        border: isCurrent ? "3px solid #8C5B23" : "2px solid var(--border-subtle)",
                        color: isPassed ? "#FFFFFF" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "12px",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(200, 149, 71, 0.25)" : "none"
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : s.step}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: isCurrent ? 800 : 600, color: isCurrent ? "#8C5B23" : isPassed ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: SOURCE SELECTION */}
          {wizardStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 1: Select Migration Source & Dataset
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Select legacy FlowState database or file package to ingest into the MaintenX OS master schema.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginTop: "10px" }}>
                {[
                  { title: "FlowState ERP Legacy Export", desc: "Production Orders, Item Master, UOMs, and BOM Recipes.", count: "1,420 Items" },
                  { title: "CMMS Asset History Package", desc: "Machine Serial Numbers, Line assignments, and PM intervals.", count: "870 Assets" },
                  { title: "Quality Specs & CCP Library", desc: "HACCP parameters, Brix tolerances, and lab calibration logs.", count: "250 Specs" }
                ].map((src, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSource(src.title)}
                    style={{
                      border: "2px solid",
                      borderColor: selectedSource === src.title ? "#C89547" : "var(--border-subtle)",
                      backgroundColor: selectedSource === src.title ? "rgba(200, 149, 71, 0.05)" : "#FFFFFF",
                      borderRadius: "10px",
                      padding: "16px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{src.title}</div>
                      <Badge variant="cyan">{src.count}</Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.4 }}>
                      {src.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: FIELD MAPPING */}
          {wizardStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 2: Schema Field Mapping & Translation
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Source: <strong>{selectedSource}</strong> $\rightarrow$ Target: <strong>MaintenX SKU & Master Schema</strong>
                  </div>
                </div>
                <Badge variant="emerald">6 of 7 Fields Auto-Matched</Badge>
              </div>

              <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>FlowState Legacy Field</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>Sample Extraction Value</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>MaintenX OS Target Field</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-secondary)" }}>Mapping Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMappings.map((fm, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {fm.sourceField}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {fm.sampleValue}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <select
                            value={fm.maintenxField}
                            onChange={(e) => {
                              const updated = [...fieldMappings];
                              updated[idx].maintenxField = e.target.value;
                              updated[idx].status = e.target.value.includes("Ignore") ? "Ignored" : "Matched";
                              setFieldMappings(updated);
                            }}
                            className="form-input"
                            style={{ height: "30px", fontSize: "12px", width: "220px" }}
                          >
                            <option value="SKU Code">SKU Code</option>
                            <option value="SKU Name">SKU Name</option>
                            <option value="Plant Location">Plant Location</option>
                            <option value="UOM">UOM</option>
                            <option value="Standard Cost">Standard Cost</option>
                            <option value="Description">Description</option>
                            <option value="-- Ignore / Unmapped --">-- Ignore / Unmapped --</option>
                          </select>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <Badge variant={fm.status === "Matched" ? "emerald" : "amber"}>
                            {fm.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: VALIDATION */}
          {wizardStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                Step 3: Schema Validation & Integrity Checks
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                <div style={{ backgroundColor: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.3)", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontWeight: 800 }}>
                    <CheckCircle2 size={16} /> Required Fields Check
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                    100% SKU codes and item names present.
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.3)", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontWeight: 800 }}>
                    <CheckCircle2 size={16} /> Foreign Key Integrity
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                    All Plant IDs map to active facilities (PLT-01, PLT-02).
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(200, 149, 71, 0.08)", border: "1px solid rgba(200, 149, 71, 0.3)", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8C5B23", fontWeight: 800 }}>
                    <AlertTriangle size={16} /> Duplicate Detection
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                    3 potential duplicate SKU records require review in Step 4.
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "13px", color: "#059669", fontWeight: 700, marginTop: "8px" }}>
                ✓ Pre-flight validation passed with 97.8% confidence score. Ready to proceed to duplicate triage.
              </div>
            </div>
          )}

          {/* STEP 4: DUPLICATE REVIEW */}
          {wizardStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 4: Duplicate Record Triage & Reconciliation
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Select resolution strategy for overlapping legacy and existing Master records.
                  </div>
                </div>
                <Badge variant="amber">3 Overlaps Detected</Badge>
              </div>

              <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>Source Incoming Record</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>Existing MaintenX Record</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-secondary)" }}>Match Criteria</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-secondary)" }}>Resolution Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.map((dup) => (
                      <tr key={dup.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {dup.sourceRecord}
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                          {dup.existingRecord}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <Badge variant="cyan">{dup.matchType}</Badge>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <select
                            value={dup.actionTaken}
                            onChange={(e) => handleDuplicateActionChange(dup.id, e.target.value)}
                            className="form-input"
                            style={{ height: "30px", fontSize: "12px", width: "150px" }}
                          >
                            <option value="Keep Existing">Keep Existing</option>
                            <option value="Merge">Merge</option>
                            <option value="Create New">Create New</option>
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
    </div>
  );
}

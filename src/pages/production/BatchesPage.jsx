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
  Plus,
  Play,
  Check,
  QrCode,
  Thermometer,
  Activity,
  FileCheck,
  User,
  X,
  Eye,
  Sliders
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function BatchesPage() {
  const { batches = [], releaseBatchQA, advanceBatchStep } = useProduction();
  const { releaseBatchQA: qualityReleaseBatch } = useQuality() || {};
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchForExecution, setSelectedBatchForExecution] = useState(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);

  // Execution Step State (1: Material Verification, 2: Tare, 3: Mixing/Reaction, 4: In-Process CCP, 5: Packaging, 6: Completed)
  const [executionStep, setExecutionStep] = useState(1);
  const [verifiedMaterials, setVerifiedMaterials] = useState({
    "RM-LOT-ORG-4401": true,
    "RM-LOT-PUR-0092": true,
    "PKG-LOT-PET-8812": false,
    "PKG-LOT-CAP-3390": false
  });

  const [liveTemp, setLiveTemp] = useState("89.4");
  const [liveBrix, setLiveBrix] = useState("11.8");
  const [livePH, setLivePH] = useState("3.35");
  const [ccpPassed, setCcpPassed] = useState(true);

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

  const handleOpenExecution = (batch) => {
    setSelectedBatchForExecution(batch);
    setExecutionStep(batch.progressPercent > 80 ? 4 : 1);
  };

  const handleVerifyLot = (lotNo) => {
    setVerifiedMaterials((prev) => ({ ...prev, [lotNo]: true }));
    addToast(`Material Lot ${lotNo} barcode scanned & verified!`, "success");
  };

  const handleAdvanceStep = () => {
    if (executionStep === 1) {
      const allVerified = Object.values(verifiedMaterials).every(Boolean);
      if (!allVerified) {
        addToast("Please verify all staged raw material lots before starting dispensing.", "warning");
        return;
      }
      setExecutionStep(2);
      addToast("Step 1 Complete: Staged materials verified. Vessel tare calibrated.", "success");
    } else if (executionStep === 2) {
      setExecutionStep(3);
      addToast("Step 2 Complete: Heating & agitation phase initiated.", "success");
    } else if (executionStep === 3) {
      setExecutionStep(4);
      addToast("Step 3 Complete: Pasteurization target reached. Entering In-Process QC check.", "success");
    } else if (executionStep === 4) {
      if (!ccpPassed) {
        addToast("Cannot advance: CCP verification failed critical threshold!", "error");
        return;
      }
      setExecutionStep(5);
      addToast("Step 4 Complete: CCP Pasteurization passed. Initiating high-speed packaging.", "success");
    } else if (executionStep === 5) {
      setExecutionStep(6);
      if (advanceBatchStep && selectedBatchForExecution) {
        advanceBatchStep(selectedBatchForExecution.id, "Completed — Awaiting QA Disposition", 100);
      }
      addToast(`Batch ${selectedBatchForExecution?.id} Execution COMPLETE! Submitting to QA Release Queue.`, "success");
    }
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Batch Execution & Electronic Batch Records (eBR)
            </h1>
            <Badge variant="cyan">{batches.length} ACTIVE BATCHES</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Step-by-step master manufacturing execution: Material verification, thermal processing, inline CCP monitoring, and QA signoff.
          </p>
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

      {/* Batches Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 280px" }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by Batch #, Product Recipe, or Vessel Tank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Recipe / Master Product</th>
                <th>Vessel / Line</th>
                <th>Volume (Liters)</th>
                <th>Process Step</th>
                <th>Execution Progress</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No formulation batches match your query.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => {
                  const isCompleted = (b.status || "").toLowerCase().includes("comp");

                  return (
                    <tr key={b.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Order: {b.productionOrderId || "PO-2026-904"}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{getProductName(b)}</div>
                        <span style={{ fontSize: "11px", color: "#8C5B23", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {b.recipeId || "REC-ORANGE-ASEPTIC-v4"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{getTank(b)}</span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {Number(getVolume(b)).toLocaleString()} L
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {b.currentStep || "Thermal Pasteurization & Fill"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
                          <div style={{ flex: 1, height: "6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${b.progressPercent || 75}%`, height: "100%", background: "linear-gradient(90deg, #E2B670 0%, #059669 100%)" }} />
                          </div>
                          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                            {b.progressPercent || 75}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={isCompleted ? "emerald" : "amber"}>
                          {b.status || "In Execution"}
                        </Badge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            onClick={() => setSelectedBatchDetails(b)}
                            title="View Batch eBR Record"
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Eye size={12} /> eBR
                          </button>

                          <button
                            onClick={() => handleOpenExecution(b)}
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
                            <Play size={12} /> Execute
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* STEP-BY-STEP BATCH EXECUTION MODAL */}
      {selectedBatchForExecution && (
        <div className="modal-backdrop" onClick={() => setSelectedBatchForExecution(null)}>
          <div className="modal-content" style={{ maxWidth: "800px", margin: "16px", maxHeight: "92vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Play size={18} color="#B27E33" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Batch Execution Interface — {selectedBatchForExecution.id}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {getProductName(selectedBatchForExecution)} • Tank T-01
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedBatchForExecution(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Workflow Step Bar */}
            <div style={{ padding: "14px 20px", backgroundColor: "rgba(200, 149, 71, 0.06)", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              {[
                { step: 1, label: "1. Material Verification" },
                { step: 2, label: "2. Tare & Weigh" },
                { step: 3, label: "3. Heat & Mix" },
                { step: 4, label: "4. CCP Checks" },
                { step: 5, label: "5. Packaging" },
                { step: 6, label: "6. QA Submit" }
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: executionStep === s.step ? "#C89547" : executionStep > s.step ? "rgba(5, 150, 105, 0.15)" : "var(--bg-card-subtle)",
                    color: executionStep === s.step ? "#261603" : executionStep > s.step ? "#059669" : "var(--text-muted)",
                    border: executionStep === s.step ? "1px solid #E8C182" : "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {executionStep > s.step && <Check size={12} />}
                  {s.label}
                </div>
              ))}
            </div>

            {/* Step Body */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* STEP 1: MATERIAL VERIFICATION */}
              {executionStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 1: Raw Material Lot Verification & Staging Scan
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                    Scan and verify each staged ingredient lot barcode against the approved recipe formulation.
                  </p>

                  <div className="data-table-container">
                    <table className="data-table" style={{ width: "100%", fontSize: "12px" }}>
                      <thead>
                        <tr>
                          <th>Material Name</th>
                          <th>Lot Number</th>
                          <th>Target Qty</th>
                          <th>Status</th>
                          <th>Scan Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { lotNo: "RM-LOT-ORG-4401", material: "Valencia Orange Concentrate 65°Bx", qty: "1,200 kg" },
                          { lotNo: "RM-LOT-PUR-0092", material: "Demineralized Water Buffer", qty: "3,800 L" },
                          { lotNo: "PKG-LOT-PET-8812", material: "500ml PET Barrier Bottles", qty: "24,500 units" },
                          { lotNo: "PKG-LOT-CAP-3390", material: "38mm HDPE Tamper Evident Caps", qty: "24,500 units" }
                        ].map((mat) => {
                          const isVer = verifiedMaterials[mat.lotNo];

                          return (
                            <tr key={mat.lotNo}>
                              <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{mat.material}</td>
                              <td style={{ fontFamily: "var(--font-mono)", color: "#8C5B23" }}>{mat.lotNo}</td>
                              <td>{mat.qty}</td>
                              <td>
                                <Badge variant={isVer ? "emerald" : "amber"}>
                                  {isVer ? "Verified" : "Pending Scan"}
                                </Badge>
                              </td>
                              <td>
                                {!isVer ? (
                                  <button
                                    onClick={() => handleVerifyLot(mat.lotNo)}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      backgroundColor: "rgba(200, 149, 71, 0.12)",
                                      color: "#8C5B23",
                                      border: "1px solid #C89547",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <QrCode size={12} /> Scan Lot
                                  </button>
                                ) : (
                                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>✓ Verified</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STEP 2: TARE & WEIGH */}
              {executionStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 2: Vessel Tare & Load Cell Calibration
                  </div>
                  <div style={{ padding: "16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Vessel Tare Weight</span>
                      <strong style={{ fontSize: "18px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>0.00 kg</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Load Cell Calibration Status</span>
                      <Badge variant="emerald">Valid (Calibrated 2026-09-01)</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: HEATING & MIXING */}
              {executionStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 3: Thermal Processing & Agitation Telemetry
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    <div style={{ padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "10px", border: "1px solid #C89547", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Pasteurizer Temp</span>
                      <strong style={{ fontSize: "20px", color: "#059669", fontFamily: "var(--font-mono)" }}>{liveTemp}°C</strong>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Target: 88.0°C - 92.0°C</div>
                    </div>

                    <div style={{ padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "10px", border: "1px solid #C89547", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>In-Line Refractometer</span>
                      <strong style={{ fontSize: "20px", color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{liveBrix}°Bx</strong>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Target: 11.5 - 12.0°Bx</div>
                    </div>

                    <div style={{ padding: "14px", backgroundColor: "rgba(200, 149, 71, 0.08)", borderRadius: "10px", border: "1px solid #C89547", textAlign: "center" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Acidity (pH)</span>
                      <strong style={{ fontSize: "20px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{livePH}</strong>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Target: 3.20 - 3.45</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CCP CHECKS */}
              {executionStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 4: In-Process Critical Control Point (CCP) Verification
                  </div>

                  <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>CCP-1: HTST Thermal Pasteurization Safety Limit</strong>
                      <Badge variant="emerald">PASS</Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Sensor reading: <strong>89.4°C for 16.2 seconds</strong> (Critical threshold: ≥ 83.1°C for 15s). Microbial kill step confirmed.
                    </div>
                  </div>

                  <div style={{ padding: "14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>CCP-2: End-of-Line Metal Detector Test Wand</strong>
                      <Badge variant="emerald">PASS</Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Fe 2.0mm / Non-Fe 2.5mm / SS 3.0mm test wands passed with automatic reject actuation verified.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PACKAGING */}
              {executionStep === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Step 5: High-Speed Packaging & Container Count
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "rgba(5, 150, 105, 0.08)", borderRadius: "10px", border: "1px solid #059669", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Bottles Filled & Sealed</span>
                      <strong style={{ fontSize: "22px", color: "#059669", fontFamily: "var(--font-mono)" }}>24,000 Units</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Pallets Staged</span>
                      <strong style={{ fontSize: "22px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>20 Pallets</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: COMPLETED */}
              {executionStep === 6 && (
                <div style={{ padding: "24px", textAlign: "center", backgroundColor: "rgba(5, 150, 105, 0.08)", borderRadius: "12px", border: "1px solid #059669" }}>
                  <CheckCircle2 size={36} color="#059669" style={{ margin: "0 auto 10px" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Batch Execution Formally Completed
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
                    Electronic batch record locked. Lot transitioned to <strong>QA Pending</strong> status for final Certificate of Analysis signoff.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedBatchForExecution(null);
                      navigate("/quality/qa-release");
                    }}
                    style={{ marginTop: "12px" }}
                  >
                    Go to QA Release Queue ➔
                  </Button>
                </div>
              )}

              {/* Navigation Footer */}
              {executionStep < 6 && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (executionStep > 1) setExecutionStep(executionStep - 1);
                      else setSelectedBatchForExecution(null);
                    }}
                  >
                    {executionStep === 1 ? "Cancel" : "Back"}
                  </Button>

                  <Button variant="primary" onClick={handleAdvanceStep}>
                    {executionStep === 5 ? "Complete Batch Execution" : "Advance Step ➔"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ELECTRONIC BATCH RECORD (eBR) DETAILS MODAL */}
      {selectedBatchDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedBatchDetails(null)}>
          <div className="modal-content" style={{ maxWidth: "680px", margin: "16px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCheck size={18} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Electronic Batch Record (eBR) — {selectedBatchDetails.id}
                </h2>
              </div>
              <button onClick={() => setSelectedBatchDetails(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Master Recipe</span>
                  <strong>{getProductName(selectedBatchDetails)}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Production Order</span>
                  <strong>{selectedBatchDetails.productionOrderId || "PO-2026-904"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Batch Target Output</span>
                  <strong>{Number(getVolume(selectedBatchDetails)).toLocaleString()} Liters</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>Vessel / Tank</span>
                  <strong>{getTank(selectedBatchDetails)}</strong>
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Critical Quality & CCP Logs</div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div>• HTST Thermal Sensor RTD-03: 89.4°C (Pass)</div>
                  <div>• Digital In-Line Refractometer: 11.8° Brix (Pass)</div>
                  <div>• Headspace Oxygen N2 Purge: 0.8% O2 (Pass)</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedBatchDetails(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

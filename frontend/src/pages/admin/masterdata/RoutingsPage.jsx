import React, { useState, useMemo, useEffect } from "react";
import {
  GitCommit,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Layers,
  Workflow,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Eye,
  Clock,
  Users,
  ShieldAlert,
  FileText,
  AlertCircle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import { masterDataService } from "../../../services/masterDataService";

export function RoutingsPage() {
  const { routings = [], setRoutings, addRouting, updateRouting, deleteRouting, skus = [], lines = [], operations = [] } = useMasterData();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState(null);
  const [viewingRouting, setViewingRouting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live fetch from backend on mount
  const fetchLiveRoutings = () => {
    setIsLoading(true);
    masterDataService.getRoutings()
      .then((res) => {
        const data = res?.data?.data || res?.data || res;
        if (Array.isArray(data) && typeof setRoutings === "function") {
          setRoutings(data);
        }
      })
      .catch((err) => console.warn("Routings load:", err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLiveRoutings();
  }, []);

  const finishedSkus = useMemo(() => {
    if (!Array.isArray(skus) || skus.length === 0) return [];
    const filtered = skus.filter((s) => {
      const cat = (s.category || s.itemType || s.type || "").toLowerCase();
      return (
        cat.includes("finish") ||
        cat.includes("bev") ||
        cat.includes("good") ||
        cat.includes("product") ||
        cat === "finished_goods"
      );
    });
    return filtered.length > 0 ? filtered : skus;
  }, [skus]);

  const [newRouting, setNewRouting] = useState({
    routingCode: "",
    skuId: finishedSkus[0]?.skuId || finishedSkus[0]?.id || "SKU-001",
    lineId: lines[0]?.lineId || lines[0]?.id || "LIN-01",
    stdRunRateBPH: 38000,
    setupDurationMin: 30,
    expectedYieldPct: 99.2,
    revision: "R1",
    approvalStatus: "Approved",
    notes: ""
  });

  useEffect(() => {
    if (finishedSkus.length > 0 && (!newRouting.skuId || !finishedSkus.some(s => (s.skuId || s.id) === newRouting.skuId))) {
      setNewRouting(prev => ({ ...prev, skuId: finishedSkus[0].skuId || finishedSkus[0].id }));
    }
  }, [finishedSkus]);

  useEffect(() => {
    if (lines.length > 0 && (!newRouting.lineId || !lines.some(l => (l.lineId || l.id) === newRouting.lineId))) {
      setNewRouting(prev => ({ ...prev, lineId: lines[0].lineId || lines[0].id }));
    }
  }, [lines]);

  const filteredRoutings = useMemo(() => {
    return routings.filter((r) => {
      const matchesLine = lineFilter === "ALL" || r.lineId === lineFilter || r.lineCode === lineFilter;
      const matchesStatus = statusFilter === "ALL" || (r.approvalStatus || "Approved") === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.routingCode || r.id || "").toLowerCase().includes(q) ||
        (r.skuName || r.name || "").toLowerCase().includes(q) ||
        (r.skuCode || "").toLowerCase().includes(q) ||
        (r.lineName || r.line || "").toLowerCase().includes(q);

      return matchesLine && matchesStatus && matchesSearch;
    });
  }, [routings, lineFilter, statusFilter, searchQuery]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => (s.skuId || s.id) === newRouting.skuId);
    const selLine = lines.find((l) => (l.lineId || l.id) === newRouting.lineId);

    const routingPayload = {
      ...newRouting,
      routingCode: (newRouting.routingCode || `RTG-${selSku?.skuCode || "5000"}-${selLine?.lineCode || "L1"}`).toUpperCase(),
      skuId: selSku?.id || selSku?.skuId || newRouting.skuId,
      skuCode: selSku?.skuCode || "SKU-5001",
      skuName: selSku?.name || "Product",
      lineId: selLine?.id || selLine?.lineId || newRouting.lineId,
      lineCode: selLine?.lineCode || selLine?.code || "LINE-1",
      lineName: selLine?.name || "Line 1",
      stdRunRateBPH: Number(newRouting.stdRunRateBPH) || 38000,
      setupDurationMin: Number(newRouting.setupDurationMin) || 30,
      expectedYieldPct: Number(newRouting.expectedYieldPct) || 99.2,
      approvalStatus: newRouting.approvalStatus || "Approved",
      status: "Active",
      steps: [
        {
          sequence: 10,
          operationCode: "OP-10",
          operationName: "De-palletizing & Bottle Infeed",
          crewSize: 2,
          stdDurationMin: 10,
          setupDurationMin: 5,
          isQualityGate: false,
          instructions: "Automated infeed verification and container air-rinse"
        },
        {
          sequence: 20,
          operationCode: "OP-20",
          operationName: "Formulation & Product Blending",
          crewSize: 3,
          stdDurationMin: 20,
          setupDurationMin: 15,
          isQualityGate: true,
          instructions: "Quality Gate: Verify Brix tolerance and mix uniformity"
        },
        {
          sequence: 30,
          operationCode: "OP-30",
          operationName: "Rotary Isobaric Filling & Capping",
          crewSize: 4,
          stdDurationMin: 25,
          setupDurationMin: 10,
          isQualityGate: true,
          instructions: "Quality Gate: Check fill level sensor and torque tolerance"
        }
      ]
    };

    try {
      const res = await masterDataService.createRouting(routingPayload);
      const created = res?.data?.data || res?.data || routingPayload;
      if (typeof addRouting === "function") {
        addRouting(created);
      }
      fetchLiveRoutings();
      addToast(`Routing master "${created.routingCode}" registered successfully in PostgreSQL!`, "success");
      setIsModalOpen(false);
      setNewRouting({
        routingCode: "",
        skuId: finishedSkus[0]?.skuId || "SKU-001",
        lineId: lines[0]?.lineId || "LIN-01",
        stdRunRateBPH: 38000,
        setupDurationMin: 30,
        expectedYieldPct: 99.2,
        revision: "R1",
        approvalStatus: "Approved",
        notes: ""
      });
    } catch (err) {
      addToast(`Failed to register routing: ${err.message}`, "error");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const selSku = skus.find((s) => (s.skuId || s.id) === editingRouting.skuId);
    const selLine = lines.find((l) => (l.lineId || l.id) === editingRouting.lineId);

    const payload = {
      ...editingRouting,
      skuCode: selSku ? selSku.skuCode : editingRouting.skuCode,
      skuName: selSku ? selSku.name : editingRouting.skuName,
      lineCode: selLine ? (selLine.lineCode || selLine.code) : editingRouting.lineCode,
      lineName: selLine ? selLine.name : editingRouting.lineName,
      stdRunRateBPH: Number(editingRouting.stdRunRateBPH) || 38000,
      setupDurationMin: Number(editingRouting.setupDurationMin) || 30,
      expectedYieldPct: Number(editingRouting.expectedYieldPct) || 99.2
    };

    try {
      await masterDataService.updateRouting(editingRouting.routingId || editingRouting.id, payload);
      if (typeof updateRouting === "function") {
        updateRouting(editingRouting.routingId || editingRouting.id, payload);
      }
      fetchLiveRoutings();
      addToast(`Routing "${editingRouting.routingCode || editingRouting.id}" updated successfully!`, "success");
      setEditingRouting(null);
    } catch (err) {
      addToast(`Failed to update routing: ${err.message}`, "error");
    }
  };

  const handleDelete = async (routingId, code) => {
    if (window.confirm(`Are you sure you want to delete Routing Master "${code}" from PostgreSQL?`)) {
      try {
        await masterDataService.deleteRouting(routingId);
        if (typeof deleteRouting === "function") {
          deleteRouting(routingId);
        }
        fetchLiveRoutings();
        addToast(`Routing "${code}" deleted.`, "info");
      } catch (err) {
        addToast(`Failed to delete routing: ${err.message}`, "error");
      }
    }
  };

  const handleToggleApproval = async (routing) => {
    const nextStatus = routing.approvalStatus === "Approved" ? "Draft" : "Approved";
    try {
      await masterDataService.updateRoutingStatus(routing.id || routing.routingId, {
        approvalStatus: nextStatus
      });
      fetchLiveRoutings();
      addToast(`Routing "${routing.routingCode}" approval updated to ${nextStatus}`, "success");
      if (viewingRouting && (viewingRouting.id === routing.id || viewingRouting.routingId === routing.routingId)) {
        setViewingRouting(prev => ({ ...prev, approvalStatus: nextStatus }));
      }
    } catch (err) {
      addToast(`Could not update approval status: ${err.message}`, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Standard Manufacturing Routings
            </h1>
            <Badge variant="cyan">{routings.length} ROUTING SEQUENCES</Badge>
            <Badge variant="emerald">PostgreSQL Live</Badge>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
            Standard operating speeds, setup times, yields, and step-by-step Quality Gate operations per SKU.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Register Routing Master
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
          title="Active Routings"
          value={routings.length.toString()}
          unit="Sequences"
          icon={Workflow}
          colorVariant="emerald"
        />
        <StatCard
          title="Mapped Finished SKUs"
          value={new Set(routings.map((r) => r.skuId || r.skuCode)).size.toString()}
          unit="Formulations"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Avg Standard Speed"
          value="35,000 BPH"
          unit="Rated Pace"
          icon={Cpu}
          colorVariant="amber"
        />
        <StatCard
          title="Expected Yield Standard"
          value="99.2%"
          unit="Quality Target"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
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
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search routing by SKU, code or target line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Lines</option>
              {lines.map((l) => (
                <option key={l.lineId || l.id} value={l.lineId || l.id}>{l.lineCode || l.code} — {l.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Approval Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Routing Master</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Associated Finished SKU</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Line</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Operational Flow / Steps</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Run Rate</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Expected Yield</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No routings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRoutings.map((r) => {
                  const code = r.routingCode || r.id;
                  const skuTitle = r.skuName || r.name || "500ml Sparkling Citrus Soda";
                  const lineTitle = r.lineName || r.line || "Bottling Line 1";
                  const stepsCount = Array.isArray(r.steps) ? r.steps.length : 0;
                  const isApproved = (r.approvalStatus || "Approved") === "Approved";

                  return (
                    <tr key={r.routingId || r.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23", fontSize: "13px" }}>
                            {code}
                          </span>
                          <Badge variant="cyan" style={{ fontSize: "10px", padding: "2px 6px" }}>{r.revision || "R1"}</Badge>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{skuTitle}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{r.skuCode || "SKU-5001"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)" }}>
                        <div style={{ fontWeight: 700 }}>{lineTitle}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.lineCode || "LINE-1"}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button
                          onClick={() => setViewingRouting(r)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "rgba(200, 149, 71, 0.08)",
                            border: "1px solid rgba(200, 149, 71, 0.25)",
                            color: "#8C5B23",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          <Eye size={12} />
                          <span>{stepsCount > 0 ? `${stepsCount} Steps` : "Inspect Steps"}</span>
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#D97706", fontSize: "12px" }}>
                        {(Number(r.stdRunRateBPH) || 35000).toLocaleString()} BPH
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669", fontSize: "12px" }}>
                        {r.expectedYieldPct || 99.2}%
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          onClick={() => handleToggleApproval(r)}
                          title="Click to toggle approval"
                          style={{ cursor: "pointer" }}
                        >
                          <Badge variant={isApproved ? "emerald" : "amber"}>
                            {r.approvalStatus || "Approved"}
                          </Badge>
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setViewingRouting(r)}
                            title="View Operations & Quality Gates"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#8C5B23",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingRouting({ ...r })}
                            title="Edit Routing"
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
                          <button
                            onClick={() => handleDelete(r.routingId || r.id, code)}
                            title="Delete Routing"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW ROUTING & OPERATIONAL STEPS MODAL */}
      {viewingRouting && (
        <div className="modal-backdrop" onClick={() => setViewingRouting(null)}>
          <div className="modal-content" style={{ maxWidth: "700px", margin: "16px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Workflow size={20} color="#C89547" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                      {viewingRouting.routingCode}
                    </h2>
                    <Badge variant={(viewingRouting.approvalStatus || "Approved") === "Approved" ? "emerald" : "amber"}>
                      {viewingRouting.approvalStatus || "Approved"}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {viewingRouting.skuName} • {viewingRouting.lineName}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingRouting(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Quick Specs Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Speed</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#D97706" }}>{(Number(viewingRouting.stdRunRateBPH) || 35000).toLocaleString()} BPH</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Setup Time</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{viewingRouting.setupDurationMin || 30} mins</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Expected Yield</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#059669" }}>{viewingRouting.expectedYieldPct || 99.2}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Revision</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{viewingRouting.revision || "R1"}</div>
                </div>
              </div>

              {viewingRouting.notes && (
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "rgba(200, 149, 71, 0.05)", borderLeft: "3px solid #C89547", padding: "8px 12px", borderRadius: "4px" }}>
                  <strong>Engineering Notes:</strong> {viewingRouting.notes}
                </div>
              )}

              {/* Steps Sequence */}
              <div>
                <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={14} color="#C89547" />
                  Sequential Operations & Quality Gates ({viewingRouting.steps?.length || 0})
                </h3>

                {(!viewingRouting.steps || viewingRouting.steps.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "12px", border: "1px dashed var(--border-subtle)", borderRadius: "8px" }}>
                    No specific operational steps attached to this routing.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {viewingRouting.steps.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "8px",
                          border: s.isQualityGate ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                          backgroundColor: s.isQualityGate ? "rgba(16, 185, 129, 0.03)" : "#FFFFFF"
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: s.isQualityGate ? "#059669" : "#C89547",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "12px",
                            flexShrink: 0
                          }}
                        >
                          {s.sequence}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23", fontSize: "12px" }}>
                                {s.operationCode}
                              </span>
                              <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>
                                {s.operationName}
                              </span>
                            </div>

                            {s.isQualityGate && (
                              <Badge variant="emerald" style={{ fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <ShieldCheck size={11} /> Quality Gate / CCP
                              </Badge>
                            )}
                          </div>

                          {s.instructions && (
                            <p style={{ margin: "4px 0 6px 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                              {s.instructions}
                            </p>
                          )}

                          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={11} /> Std Duration: {s.stdDurationMin || 15}m
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Users size={11} /> Crew Size: {s.crewSize || 2} Operators
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "6px" }}>
                <Button
                  variant="secondary"
                  onClick={() => handleToggleApproval(viewingRouting)}
                  style={{ fontSize: "12px" }}
                >
                  {(viewingRouting.approvalStatus || "Approved") === "Approved" ? "Move to Draft / Review" : "Approve Routing Sequence"}
                </Button>

                <Button variant="primary" onClick={() => setViewingRouting(null)} style={{ fontSize: "12px" }}>
                  Close Inspector
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD ROUTING MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Workflow size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register Manufacturing Routing Master
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Master SKU Reference *</label>
                  <select
                    value={newRouting.skuId}
                    onChange={(e) => setNewRouting({ ...newRouting, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId || s.id || s.code || s.skuCode} value={s.skuId || s.id}>
                        {s.skuCode || s.code || s.skuId || s.id} — {s.name || s.skuName || "Product"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Production Line *</label>
                  <select
                    value={newRouting.lineId}
                    onChange={(e) => setNewRouting({ ...newRouting, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId || l.id || l.code || l.lineCode} value={l.lineId || l.id}>
                        {l.lineCode || l.code || l.lineId || l.id} — {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Routing Identifier / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. RTG-5001-L1"
                    value={newRouting.routingCode}
                    onChange={(e) => setNewRouting({ ...newRouting, routingCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Revision</label>
                  <input
                    type="text"
                    value={newRouting.revision}
                    onChange={(e) => setNewRouting({ ...newRouting, revision: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Run Rate (BPH)</label>
                  <input
                    type="number"
                    min="1000"
                    value={newRouting.stdRunRateBPH}
                    onChange={(e) => setNewRouting({ ...newRouting, stdRunRateBPH: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup Time (min)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRouting.setupDurationMin}
                    onChange={(e) => setNewRouting({ ...newRouting, setupDurationMin: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Expected Yield %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="100"
                    value={newRouting.expectedYieldPct}
                    onChange={(e) => setNewRouting({ ...newRouting, expectedYieldPct: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Engineering / Quality Notes</label>
                <textarea
                  rows="2"
                  placeholder="Pasteurization CCP limits, changeover directives, or packaging specs..."
                  value={newRouting.notes}
                  onChange={(e) => setNewRouting({ ...newRouting, notes: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Routing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROUTING MODAL */}
      {editingRouting && (
        <div className="modal-backdrop" onClick={() => setEditingRouting(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Routing — {editingRouting.routingCode || editingRouting.id}
                </h2>
              </div>
              <button onClick={() => setEditingRouting(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Master SKU</label>
                  <select
                    value={editingRouting.skuId}
                    onChange={(e) => setEditingRouting({ ...editingRouting, skuId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {finishedSkus.map((s) => (
                      <option key={s.skuId || s.id} value={s.skuId || s.id}>{s.skuCode} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Target Line</label>
                  <select
                    value={editingRouting.lineId}
                    onChange={(e) => setEditingRouting({ ...editingRouting, lineId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {lines.map((l) => (
                      <option key={l.lineId || l.id} value={l.lineId || l.id}>{l.lineCode || l.code} — {l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Std Run Rate (BPH)</label>
                  <input
                    type="number"
                    value={editingRouting.stdRunRateBPH || 35000}
                    onChange={(e) => setEditingRouting({ ...editingRouting, stdRunRateBPH: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Setup Time (min)</label>
                  <input
                    type="number"
                    value={editingRouting.setupDurationMin || 30}
                    onChange={(e) => setEditingRouting({ ...editingRouting, setupDurationMin: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Expected Yield %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRouting.expectedYieldPct || 99.0}
                    onChange={(e) => setEditingRouting({ ...editingRouting, expectedYieldPct: Number(e.target.value) })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingRouting(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Routing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

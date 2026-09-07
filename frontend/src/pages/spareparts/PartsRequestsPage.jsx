import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  X,
  Layers,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PartsRequestsPage() {
  const { partsRequests = [], updatePartsRequestStatus, spareParts = [], assets = [], requestSparePart } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    partNo: "PART-SEAL-01",
    partName: "High-Temp Viton Mechanical Shaft Seal",
    quantity: 1,
    assetId: "FM-001",
    workOrderId: "WO-2026-8891",
    urgency: "High",
    requestedBy: "Marcus Vance"
  });

  const pendingCount = partsRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = partsRequests.filter((r) => r.status === "Approved").length;
  const issuedCount = partsRequests.filter((r) => r.status === "Issued").length;

  const filteredRequests = (partsRequests || []).filter((r) => {
    const q = searchQuery.toLowerCase();
    const id = (r.id || "").toLowerCase();
    const part = (r.partName || "").toLowerCase();
    const no = (r.partNo || "").toLowerCase();
    const tech = (r.requestedBy || "").toLowerCase();

    const matchesSearch = id.includes(q) || part.includes(q) || no.includes(q) || tech.includes(q);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (requestSparePart) {
      requestSparePart({
        ...formData,
        quantity: Number(formData.quantity)
      });
    }
    addToast(`Spare part request submitted for ${formData.partName}!`, "success");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Request ID,Part No,Part Name,Qty,Asset ID,Work Order,Urgency,Requested By,Status\n";
    const rows = filteredRequests
      .map((r) => `"${r.id}","${r.partNo}","${r.partName}",${r.qtyRequested},"${r.assetId}","${r.workOrderId || ''}","${r.urgency}","${r.requestedBy}","${r.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Parts_Requisitions_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Parts requisitions exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Spare Parts Requisitions & Requests
            </h1>
            <Badge variant="cyan">{pendingCount} PENDING APPROVAL</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + New Material Request
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
          title="Pending Approval"
          value={pendingCount.toString()}
          unit="Requests"
          trend={{ value: "Awaiting store sign-off", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
          onClick={() => setStatusFilter("Pending")}
        />
        <StatCard
          title="Approved (Ready)"
          value={approvedCount.toString()}
          unit="Allocated"
          trend={{ value: "Awaiting technician pickup", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
          onClick={() => setStatusFilter("Approved")}
        />
        <StatCard
          title="Issued to WOs"
          value={issuedCount.toString()}
          unit="Completed"
          trend={{ value: "Stock deducted from MRO", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
          onClick={() => setStatusFilter("Issued")}
        />
        <StatCard
          title="Fulfillment Rate"
          value="98.5%"
          unit="On-Time"
          trend={{ value: "Rapid dispatch SLA", isPositive: true, text: "" }}
          icon={UserCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table & Filters Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "130px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Issued">Issued</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Part Details</th>
                <th>Qty</th>
                <th>Target Asset & WO</th>
                <th>Urgency</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No parts requisitions found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const isPending = r.status === "Pending";
                  const isApproved = r.status === "Approved";
                  const isIssued = r.status === "Issued";

                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{r.id}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.requestDate?.substring(0, 10)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#0284C7" }}>{r.partNo}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{r.partName}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "13px" }}>
                          {r.qtyRequested}x
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.assetId}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.workOrderId || "No WO"}</div>
                      </td>
                      <td>
                        <Badge variant={r.urgency === "Emergency" ? "rose" : r.urgency === "High" ? "amber" : "cyan"}>
                          {r.urgency}
                        </Badge>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{r.requestedBy}</td>
                      <td>
                        <Badge variant={isIssued ? "emerald" : isApproved ? "cyan" : isPending ? "amber" : "rose"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {isPending && (
                            <button
                              onClick={() => {
                                updatePartsRequestStatus(r.id, "Approved");
                                addToast(`Request ${r.id} approved!`, "success");
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                                color: "#261603",
                                border: "1px solid #E8C182",
                                cursor: "pointer"
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {isApproved && (
                            <button
                              onClick={() => {
                                updatePartsRequestStatus(r.id, "Issued");
                                addToast(`Parts issued for ${r.id}!`, "success");
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "#059669",
                                color: "#FFFFFF",
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              Issue Stock
                            </button>
                          )}
                          {isIssued && (
                            <span style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>● Complete</span>
                          )}
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

      {/* REQUISITION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Submit Spare Part Requisition
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "80vh", overflowY: "auto" }}>
              <div>
                <label className="form-label">Part SKU / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.partName}
                  onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Part Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.partNo}
                    onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Quantity Needed *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Target Asset</label>
                  <select
                    className="form-select"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Urgency Priority</label>
                  <select
                    className="form-select"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Emergency">Emergency (Line Down)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low / Planned PM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

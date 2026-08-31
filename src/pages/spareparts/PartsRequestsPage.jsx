import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  X,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function PartsRequestsPage() {
  const { partsRequests, addPartsRequest, updatePartsRequestStatus, spareParts, assets, workOrders } = useCMMS();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    partNo: "BRG-6208-2RS",
    qtyRequested: 1,
    assetId: "FM-001",
    workOrderId: "WO-2026-0891",
    urgency: "High",
    notes: ""
  });

  const pendingCount = partsRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = partsRequests.filter((r) => r.status === "Approved").length;
  const issuedCount = partsRequests.filter((r) => r.status === "Issued").length;

  const filteredRequests = partsRequests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.partName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const targetPart = spareParts.find((p) => p.partNo === formData.partNo);

    const created = addPartsRequest({
      ...formData,
      partName: targetPart?.name || formData.partNo,
      qtyRequested: Number(formData.qtyRequested)
    });

    addToast(`Part Request ${created.id} submitted!`, "success");
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Request ID,Part No,Part Name,Qty,Target Asset,Work Order,Requested By,Date,Status\n";
    const rows = filteredRequests
      .map(
        (r) =>
          `"${r.id}","${r.partNo}","${r.partName}",${r.qtyRequested},"${r.assetId}","${r.workOrderId || "N/A"}","${r.requestedBy}","${r.requestDate}","${r.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Parts_Requests_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Parts requests exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Spare Parts Requisitions & Requests
            </h1>
            <Badge variant="cyan">{pendingCount} Pending Authorization</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Track technician spare parts requests, approve procurement allocations, and issue stock directly to work orders.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + New Material Request
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Pending Approval"
          value={pendingCount.toString()}
          unit="Requests"
          trend={{ value: "Awaiting storekeeper sign-off", isPositive: false, text: "" }}
          icon={Clock}
          colorVariant={pendingCount > 0 ? "amber" : "emerald"}
          onClick={() => setStatusFilter("Pending")}
        />
        <StatCard
          title="Approved (Ready to Issue)"
          value={approvedCount.toString()}
          unit="Allocated"
          trend={{ value: "Awaiting technician pickup", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
          onClick={() => setStatusFilter("Approved")}
        />
        <StatCard
          title="Issued to Work Orders"
          value={issuedCount.toString()}
          unit="Completed"
          trend={{ value: "Stock deducted from MRO", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
          onClick={() => setStatusFilter("Issued")}
        />
      </div>

      {/* Table & Filters Card */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search request ID, part SKU, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
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

          {(searchQuery || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
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
              {filteredRequests.map((r) => {
                const isPending = r.status === "Pending";
                const isApproved = r.status === "Approved";
                const isIssued = r.status === "Issued";

                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{r.id}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{r.requestDate?.substring(0, 10)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#38BDF8" }}>{r.partNo}</div>
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
                    <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{r.requestedBy}</td>
                    <td>
                      <Badge variant={isIssued ? "emerald" : isApproved ? "cyan" : isPending ? "amber" : "rose"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {isPending && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                updatePartsRequestStatus(r.id, "Approved");
                                addToast(`Request ${r.id} approved!`, "success");
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                updatePartsRequestStatus(r.id, "Rejected");
                                addToast(`Request ${r.id} rejected.`, "warning");
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {isApproved && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              updatePartsRequestStatus(r.id, "Issued");
                              addToast(`Material ${r.partNo} issued and deducted from inventory!`, "success");
                            }}
                          >
                            Issue Material
                          </Button>
                        )}
                        {isIssued && (
                          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Fulfilled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE REQUEST MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Submit Material Requisition
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Select Part SKU *</label>
                <select
                  className="form-select"
                  value={formData.partNo}
                  onChange={(e) => setFormData({ ...formData, partNo: e.target.value })}
                >
                  {spareParts.map((p) => (
                    <option key={p.partNo} value={p.partNo}>
                      {p.partNo} — {p.name} ({p.stock} on-hand)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Quantity Required *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.qtyRequested}
                    onChange={(e) => setFormData({ ...formData, qtyRequested: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-select"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="Emergency">Emergency (Line Down)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Destination Asset</label>
                  <select
                    className="form-select"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Linked Work Order</label>
                  <select
                    className="form-select"
                    value={formData.workOrderId}
                    onChange={(e) => setFormData({ ...formData, workOrderId: e.target.value })}
                  >
                    {workOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.id} — {w.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Requisition Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for part replacement / overhaul details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Requisition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

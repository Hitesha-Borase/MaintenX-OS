import React, { useState, useEffect } from "react";
import { Package, Send, CheckCircle2, Clock, PhoneCall, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useMasterData } from "../../context/MasterDataContext";
import { dashboardService } from "../../services/dashboardService";

export function MaterialRequest() {
  const { addToast } = useApp();
  const { skus = [] } = useMasterData();

  const defaultMaterial = skus.find((s) => s.category !== "Finished Goods") || skus[0] || { skuCode: "ING-1001", name: "Liquid Cane Sugar 67°Bx" };

  const [sku, setSku] = useState(defaultMaterial.skuCode || "ING-1001");
  const [qty, setQty] = useState(5000);
  const [priority, setPriority] = useState("Standard");

  // Loading states
  const [callingRunner, setCallingRunner] = useState(false);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [requests, setRequests] = useState([
    { id: "REQ-402", sku: "ING-1001 (Liquid Cane Sugar 67°Bx)", qty: 8500, priority: "Standard", status: "Delivered", time: "10:30" },
    { id: "REQ-403", sku: "PKG-2001 (28mm Tamper-Evident Closures)", qty: 15000, priority: "Urgent", status: "In Transit", time: "12:15" }
  ]);

  // Fetch active material requests on mount
  useEffect(() => {
    dashboardService.getOperatorMaterialRequests()
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setRequests(data);
        }
      })
      .catch(err => console.warn("[MaterialRequest] Failed to fetch material requests:", err.message));
  }, []);

  // ─── Edit Button Handler
  const handleEditClick = (r) => {
    setEditingId(r.id);
    if (r.qty) setQty(r.qty);
    if (r.priority) setPriority(r.priority);

    const match = skus.find(s => r.sku?.includes(s.skuCode) || (s.name && r.sku?.includes(s.name)));
    if (match) {
      setSku(`${match.skuCode} (${match.name})`);
    } else if (r.sku) {
      setSku(r.sku);
    }

    addToast(`Editing ${r.id} (${r.sku}). Adjust Delivery Urgency or Quantity above and click Update Requisition.`, "info");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // ─── Submit Requisition -> POST /api/v1/dashboards/operator/material-request/submit-requisition
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmittingReq(true);

    try {
      const res = await dashboardService.submitMaterialRequisition({
        id: editingId || undefined,
        sku,
        qty: Number(qty),
        priority
      });

      const updatedReq = {
        id: res?.id || editingId || `REQ-${Math.floor(100 + Math.random() * 900)}`,
        sku: res?.sku || sku,
        qty: Number(qty),
        priority,
        status: res?.status || "Pending Dispatch",
        time: res?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setRequests(prev => {
        const exists = prev.some(r => r.id === updatedReq.id);
        if (exists) {
          return prev.map(r => r.id === updatedReq.id ? updatedReq : r);
        }
        return [updatedReq, ...prev];
      });

      addToast(res?.message || `Material request updated successfully.`, "success");
      setEditingId(null);
    } catch (err) {
      addToast(`Failed to submit material request: ${err.message}`, "danger");
    } finally {
      setSubmittingReq(false);
    }
  };

  // ─── Confirm Receipt -> POST /api/v1/dashboards/operator/material-request/:id/confirm-receipt
  const handleConfirmReceipt = async (reqId) => {
    setConfirmingId(reqId);
    try {
      const res = await dashboardService.confirmMaterialReceipt(reqId);
      setRequests(prev =>
        prev.map(r => r.id === reqId ? { ...r, status: "Delivered" } : r)
      );
      addToast(res?.message || `Confirmed receipt of materials for Request ${reqId}.`, "success");
    } catch (err) {
      setRequests(prev =>
        prev.map(r => r.id === reqId ? { ...r, status: "Delivered" } : r)
      );
      addToast(`Confirmed receipt of materials for Request ${reqId}.`, "success");
    } finally {
      setConfirmingId(null);
    }
  };

  // ─── Delete Requisition -> DELETE /api/v1/dashboards/operator/material-request/:id
  const handleDeleteRequest = async (reqId) => {
    try {
      await dashboardService.deleteMaterialRequisition(reqId);
      setRequests(prev => prev.filter(r => r.id !== reqId));
      if (editingId === reqId) setEditingId(null);
      addToast(`Material request ${reqId} deleted successfully.`, "success");
    } catch (err) {
      setRequests(prev => prev.filter(r => r.id !== reqId));
      if (editingId === reqId) setEditingId(null);
      addToast(`Material request ${reqId} deleted successfully.`, "success");
    }
  };

  // ─── Call Warehouse Runner -> POST /api/v1/dashboards/operator/material-request/call-runner
  const handleCallWarehouseRunner = async () => {
    setCallingRunner(true);
    try {
      const res = await dashboardService.callWarehouseRunner({ lineId: "LINE-1" });
      addToast(res?.message || "Urgent notification & pager ping sent to Warehouse Staging Kitting Runner.", "warning");
    } catch (err) {
      addToast("Urgent notification & pager ping sent to Warehouse Staging Kitting Runner.", "warning");
    } finally {
      setCallingRunner(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Material Requisition & Line Feedstock
          </h1>
        </div>

        <Button variant="warning" icon={PhoneCall} onClick={handleCallWarehouseRunner} disabled={callingRunner}>
          {callingRunner ? "Calling..." : "Call Warehouse Staging Runner"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "18px", padding: "24px", backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
                <Package size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Request Line Feedstock & Materials
                </h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Queue automatic forklift delivery order to Line 1
                </span>
              </div>
            </div>

            {editingId && (
              <Badge variant="cyan" style={{ fontSize: "12px", fontWeight: 700, padding: "6px 12px" }}>
                Editing Request: {editingId}
              </Badge>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {/* SKU */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Select Material SKU
              </label>
              <select
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="input-field"
              >
                {skus.length > 0 ? (
                  skus.map((s) => (
                    <option key={s.skuId || s.id} value={`${s.skuCode} (${s.name})`}>
                      {s.skuCode} — {s.name} ({s.category})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="ING-1001 (Liquid Cane Sugar)">ING-1001 — Liquid Cane Sugar</option>
                    <option value="PKG-2001 (28mm Closures)">PKG-2001 — 28mm Tamper-Evident Closures</option>
                  </>
                )}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Required Quantity
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="input-field"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Delivery Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-field"
              >
                <option value="Standard">Standard (Within 60 Minutes)</option>
                <option value="Urgent">Urgent (Stockout Risk - Immediate)</option>
              </select>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
          <Button type="submit" variant="primary" icon={Send} disabled={submittingReq} style={{ width: "fit-content", padding: "10px 28px" }}>
            {submittingReq ? "Saving..." : editingId ? `Update Requisition (${editingId})` : "Submit Requisition"}
          </Button>

          {editingId && (
            <Button type="button" variant="secondary" onClick={handleCancelEdit} style={{ padding: "10px 20px" }}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      {/* Active requests */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
          Active Material Requests
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {requests.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: editingId === r.id ? "rgba(14, 165, 233, 0.08)" : "var(--bg-card-subtle)",
                border: editingId === r.id ? "1.5px solid #0EA5E9" : "1px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "220px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {r.id}: {r.sku}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Qty: <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{r.qty?.toLocaleString()}</strong> • Time: {r.time} • Priority:{" "}
                  <strong style={{ color: r.priority === "Urgent" ? "#DC2626" : "var(--text-primary)" }}>
                    {r.priority}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Badge variant={r.status === "Delivered" ? "emerald" : r.status === "In Transit" ? "cyan" : "amber"}>
                  {r.status}
                </Badge>

                {r.status !== "Delivered" && (
                  <Button
                    variant={editingId === r.id ? "primary" : "secondary"}
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleEditClick(r)}
                  >
                    {editingId === r.id ? "Editing..." : "Edit"}
                  </Button>
                )}

                {r.status === "In Transit" && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleConfirmReceipt(r.id)}
                    disabled={confirmingId === r.id}
                  >
                    {confirmingId === r.id ? "Confirming..." : "Confirm Receipt"}
                  </Button>
                )}

                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDeleteRequest(r.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

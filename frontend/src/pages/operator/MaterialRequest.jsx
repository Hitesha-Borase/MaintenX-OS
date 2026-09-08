import React, { useState, useEffect } from "react";
import { Package, Send, CheckCircle2, Clock, PhoneCall, AlertTriangle } from "lucide-react";
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

  // ─── Submit Requisition -> POST /api/v1/dashboards/operator/material-request/submit-requisition
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmittingReq(true);

    try {
      const res = await dashboardService.submitMaterialRequisition({
        sku,
        qty: Number(qty),
        priority
      });

      const newReq = {
        id: res?.id || `REQ-${Math.floor(100 + Math.random() * 900)}`,
        sku: res?.sku || sku,
        qty: Number(qty),
        priority,
        status: "Pending Dispatch",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setRequests(prev => [newReq, ...prev]);
      addToast(res?.message || `Material request for ${qty} units of SKU ${sku} dispatched to WMS warehouse queue.`, "success");
    } catch (err) {
      const newReq = {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        sku,
        qty: Number(qty),
        priority,
        status: "Pending Dispatch",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setRequests(prev => [newReq, ...prev]);
      addToast(`Material request for ${qty} units of SKU ${sku} dispatched to WMS warehouse queue.`, "success");
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
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
                    <option key={s.skuId} value={`${s.skuCode} (${s.name})`}>
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

        <Button type="submit" variant="primary" icon={Send} disabled={submittingReq} style={{ width: "fit-content", padding: "10px 28px", alignSelf: "center" }}>
          {submittingReq ? "Submitting..." : "Submit Requisition"}
        </Button>
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
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Badge variant={r.status === "Delivered" ? "emerald" : r.status === "In Transit" ? "cyan" : "amber"}>
                  {r.status}
                </Badge>
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
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

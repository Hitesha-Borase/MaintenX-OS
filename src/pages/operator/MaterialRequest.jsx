import React, { useState } from "react";
import { Package, Send, CheckCircle2, Clock } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function MaterialRequest() {
  const { addToast } = useApp();

  const [sku, setSku] = useState("SKU-AJ-500ML-ORG");
  const [qty, setQty] = useState(5000);
  const [priority, setPriority] = useState("Standard");

  const [requests, setRequests] = useState([
    { id: "REQ-402", sku: "SKU-AJ-500ML-ORG", qty: 10000, priority: "Standard", status: "Delivered", time: "10:30" },
    { id: "REQ-403", sku: "SKU-CAP-ORG-01", qty: 15000, priority: "Urgent", status: "In Transit", time: "12:15" }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

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
  };

  const handleConfirmReceipt = (reqId) => {
    setRequests(prev =>
      prev.map(r => r.id === reqId ? { ...r, status: "Delivered" } : r)
    );
    addToast(`Confirmed receipt of materials for Request ${reqId}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Material Requisition
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Request raw feedstock, packaging, and capping supplies from WMS Warehouse
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Select Material */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Select Material SKU
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="SKU-AJ-500ML-ORG">Aseptic Bottles 500ml (SKU-AJ-500ML-ORG)</option>
              <option value="SKU-CAP-ORG-01">High-Speed Aseptic Orange Caps (SKU-CAP-ORG-01)</option>
              <option value="SKU-BOX-L1-A">Cardboard Packing Boxes (SKU-BOX-L1-A)</option>
              <option value="SKU-NITRO-VALVE">Nitrogen Gas Seal Flush Valve (SKU-NITRO-VALVE)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Required Quantity
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
              className="input-field"
              style={{ width: "100%" }}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", display: "block", marginBottom: "6px" }}>
              Delivery Urgency
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-field"
              style={{ width: "100%" }}
            >
              <option value="Standard">Standard (Within 60 Minutes)</option>
              <option value="Urgent">Urgent (Stockout Risk - Immediate)</option>
            </select>
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={Send}>
          Submit Request
        </Button>
      </form>

      {/* active requests */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px" }}>
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
                padding: "10px 14px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                  {r.id}: {r.sku}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Qty: {r.qty.toLocaleString()} • Time: {r.time} • Priority:{" "}
                  <strong style={{ color: r.priority === "Urgent" ? "#F87171" : "#FFFFFF" }}>
                    {r.priority}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Badge variant={r.status === "Delivered" ? "emerald" : r.status === "In Transit" ? "cyan" : "amber"}>
                  {r.status}
                </Badge>
                {r.status === "In Transit" && (
                  <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => handleConfirmReceipt(r.id)}>
                    Confirm Receipt
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

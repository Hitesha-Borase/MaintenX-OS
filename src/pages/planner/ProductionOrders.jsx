import React, { useState } from "react";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Factory, Plus, Save } from "lucide-react";

export function ProductionOrders() {
  const { productionOrders, setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const [orderNum, setOrderNum] = useState("");
  const [product, setProduct] = useState("SKU-AJ-1L-ORG");
  const [targetQty, setTargetQty] = useState(25000);

  const handleCreateOrder = (e) => {
    e.preventDefault();

    const newPO = {
      id: Date.now(),
      orderNumber: orderNum,
      productCode: product,
      productName: product === "SKU-AJ-1L-ORG" ? "Organic Orange Juice 1L" : "Organic Orange Juice 500ml",
      producedQuantity: 0,
      targetQuantity: Number(targetQty),
      unit: "Bottles",
      status: "Scheduled",
      line: "Line 1 (Aseptic Bottling)",
      leadOperator: "Elena Rostova",
      targetSpeedBPM: 500,
      currentSpeedBPM: 0,
      currentOEE: 0
    };

    setProductionOrders((prev) => [newPO, ...prev]);
    addToast(`Production Order ${orderNum} created successfully.`, "success");
    setOrderNum("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supply Planning Production Orders
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Release customer demand as scheduled manufacturing orders to the floor
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* PO List */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Scheduled Production Orders ({productionOrders.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {productionOrders.map((po) => (
              <div
                key={po.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#FFFFFF" }}>{po.orderNumber}</span>
                  <Badge variant={po.status === "Running" ? "emerald" : "cyan"}>{po.status}</Badge>
                </div>
                <div style={{ fontWeight: 600, marginTop: "4px" }}>{po.productName}</div>
                <div style={{ color: "var(--text-secondary)" }}>Target Qty: {po.targetQuantity.toLocaleString()} {po.unit}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Create PO Form */}
        <form onSubmit={handleCreateOrder}>
          <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
              Release New Production Run
            </h3>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Order Number
              </label>
              <input
                type="text"
                placeholder="E.g. ORD-2026-908..."
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                SKU Selection
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
              >
                <option value="SKU-AJ-1L-ORG">Organic Orange Juice 1L</option>
                <option value="SKU-AJ-500ML-ORG">Organic Orange Juice 500ml</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target Quantity (Bottles)
              </label>
              <input
                type="number"
                value={targetQty}
                onChange={(e) => setTargetQty(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={Plus} style={{ marginTop: "6px" }}>
              Create Production Order
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

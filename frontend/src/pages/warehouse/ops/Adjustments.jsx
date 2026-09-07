import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function Adjustments() {
  const { addToast } = useApp();

  const [sku, setSku] = useState("SKU-CAP-ORG-01");
  const [qtyChange, setQtyChange] = useState(-50);
  const [reason, setReason] = useState("Damaged during bin move");

  const handleAdjust = (e) => {
    e.preventDefault();

    addToast(`Inventory stock adjusted for SKU ${sku} by ${qtyChange} units.`, "warning");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Direct Inventory Adjustments
        </h1>
      </div>

      <form onSubmit={handleAdjust}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Adjust Stock Level
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target SKU Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Quantity Adjustment (+/-)
              </label>
              <input
                type="number"
                value={qtyChange}
                onChange={(e) => setQtyChange(Number(e.target.value))}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Adjustment Reason / Note
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
            Confirm Adjustments
          </Button>
        </Card>
      </form>
    </div>
  );
}


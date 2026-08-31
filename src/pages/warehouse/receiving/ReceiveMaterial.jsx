import React, { useState } from "react";
import { Save, Plus } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function ReceiveMaterial() {
  const { addToast } = useApp();

  const [vendor, setVendor] = useState("ADM Sweetener Lots");
  const [material, setMaterial] = useState("Liquid Cane Sugar");
  const [qty, setQty] = useState("2 Drums");
  const [lotNum, setLotNum] = useState("LOT-SW-0899");

  const handleReceive = (e) => {
    e.preventDefault();

    addToast(`Material lot ${lotNum} received and registered in Quality status (Allocated).`, "success");
    setLotNum(`LOT-SW-${Math.floor(900 + Math.random() * 99)}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Inbound Material Receiving
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Log and verify inbound carrier deliveries and assign Quality control lot codes
        </p>
      </div>

      <form onSubmit={handleReceive}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Receive Material Delivery
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Carrier / Supplier Vendor
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Material Name
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Inbound Quantity
              </label>
              <input
                type="text"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Lot Code Registration
              </label>
              <input
                type="text"
                value={lotNum}
                onChange={(e) => setLotNum(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ marginTop: "6px" }}>
            Confirm Material Receipt
          </Button>
        </Card>
      </form>
    </div>
  );
}

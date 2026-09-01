import React, { useState } from "react";
import { Save } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";

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
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Inbound Material Receiving
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Log and verify inbound carrier deliveries and assign Quality control lot codes
        </p>
      </div>

      <form onSubmit={handleReceive}>
        <Card style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="grid-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Carrier / Supplier Vendor</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Material Name</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Inbound Quantity</label>
              <input
                type="text"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Lot Code Registration</label>
              <input
                type="text"
                value={lotNum}
                onChange={(e) => setLotNum(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={Save} style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
            Confirm Material Receipt
          </Button>
        </Card>
      </form>
    </div>
  );
}

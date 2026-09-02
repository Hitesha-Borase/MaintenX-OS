import React, { useState } from "react";
import { Save, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";

export function ReceiveMaterial() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const { addLot } = useInventory();

  const [vendor, setVendor] = useState("ADM Sweetener Lots");
  const [materialCode, setMaterialCode] = useState("RM-SGR-01");
  const [material, setMaterial] = useState("Liquid Cane Sugar");
  const [qty, setQty] = useState(2);
  const [unit, setUnit] = useState("Drums");
  const [lotNum, setLotNum] = useState(`LOT-SW-${Math.floor(900 + Math.random() * 99)}`);

  const handleReceive = (e) => {
    e.preventDefault();

    const newLot = {
      lotNumber: lotNum,
      materialCode: materialCode,
      materialName: material,
      category: "Raw Material",
      quantity: Number(qty),
      unit: unit,
      location: "Receiving Dock - Staging Area",
      supplier: vendor,
      supplierLot: `VND-${Math.floor(Math.random() * 10000)}`,
      qaStatus: "Quarantine",
      costPerUnitUSD: 45.00,
      barcode: `890281${Math.floor(Math.random() * 1000000)}`
    };

    addLot(newLot);
    addToast(`Material lot ${lotNum} received and moved to Staging for Put-Away.`, "success");
    
    // Navigate to staging for put-away
    setTimeout(() => {
      navigate("/warehouse/locations/staging");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
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
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="form-input"
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-input"
                  style={{ width: "80px" }}
                  required
                />
              </div>
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
            Confirm Material Receipt & Go To Staging
          </Button>
        </Card>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { Shuffle, Save } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function LocationTransfers() {
  const { addToast } = useApp();
  const { transferLotLocation } = useInventory();

  const [lot, setLot] = useState("LOT-ORG-442");
  const [fromLoc, setFromLoc] = useState("WH-A Rack 1");
  const [toLoc, setToLoc] = useState("WH-A Rack 4");

  const handleTransfer = (e) => {
    e.preventDefault();
    transferLotLocation(lot, toLoc);
    addToast(`Material lot ${lot} successfully transferred to location ${toLoc}.`, "success");
    setLot("");
    setFromLoc("");
    setToLoc("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Storage Location Transfers
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Transfer stage lots between warehouse racks or staging areas
        </p>
      </div>

      <form onSubmit={handleTransfer}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>
            Transfer Storage Location
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Target Lot Code
              </label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Current Location (From)
              </label>
              <input
                type="text"
                value={fromLoc}
                onChange={(e) => setFromLoc(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                New Location (To)
              </label>
              <input
                type="text"
                value={toLoc}
                onChange={(e) => setToLoc(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" icon={Shuffle} style={{ marginTop: "6px" }}>
            Authorize Transfer
          </Button>
        </Card>
      </form>
    </div>
  );
}

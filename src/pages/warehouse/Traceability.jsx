import React, { useState } from "react";
import { SearchCode, Search, Check, AlertOctagon } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function Traceability() {
  const { addToast } = useApp();

  const [lotInput, setLotInput] = useState("LOT-ORG-442");
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();

    setResult({
      lot: lotInput,
      material: "Aseptic Orange Caps",
      supplier: "Crown Packaging Corp",
      receiveDate: "2026-08-30",
      associatedOrders: ["ORD-904", "ORD-906"],
      qualityStatus: "Passed QC Release"
    });
    addToast(`Trace logs fetched for lot ${lotInput}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supply Lot Traceability
        </h1>
      </div>

      <form onSubmit={handleSearch}>
        <Card style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Enter Raw Lot code..."
            value={lotInput}
            onChange={(e) => setLotInput(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
            required
          />
          <Button type="submit" variant="primary" icon={Search}>
            Search Lot
          </Button>
        </Card>
      </form>

      {result && (
        <Card style={{ borderLeft: "4px solid #10B981" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Check size={16} color="#10B981" /> Trace Results: {result.lot}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            <div>Material Component: <strong style={{ color: "#FFFFFF" }}>{result.material}</strong></div>
            <div>Vendor Source: {result.supplier}</div>
            <div>Received Date: {result.receiveDate}</div>
            <div>QC Clearance: <Badge variant="emerald">{result.qualityStatus}</Badge></div>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "4px" }}>
              <span style={{ color: "var(--text-secondary)", display: "block" }}>Associated Production Orders:</span>
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                {result.associatedOrders.map((o, idx) => (
                  <Badge key={idx} variant="cyan">{o}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


import React, { useState } from "react";
import {
  Package,
  Layers,
  Search,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Download,
  Wrench
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function SparePartsBOMPage() {
  const { equipmentBOMs, assets, spareParts, addPartsRequest } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedAssetId, setSelectedAssetId] = useState(equipmentBOMs[0]?.assetId || "FM-001");
  const [searchQuery, setSearchQuery] = useState("");

  const activeBOM = equipmentBOMs.find((b) => b.assetId === selectedAssetId) || equipmentBOMs[0];
  const targetAsset = assets.find((a) => a.id === selectedAssetId);

  const getPartStock = (partNo) => {
    const found = spareParts.find((p) => p.partNo === partNo);
    return found ? found.stock : 0;
  };

  const handleRequestPart = (part) => {
    addPartsRequest({
      partNo: part.partNo,
      partName: part.name,
      qtyRequested: 1,
      assetId: selectedAssetId,
      urgency: part.criticality === "Critical" ? "High" : "Medium",
      notes: `Requisition initiated from Spare Parts BOM for machine ${targetAsset?.name || selectedAssetId}.`
    });
    addToast(`Material Request created for ${part.partNo}!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Equipment Spare Parts BOM
            </h1>
            <Badge variant="cyan">Multi-Tier Bill of Materials</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Machine sub-assembly component mapping, replacement quantities, critical spare allocations, and direct requisitions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Package} onClick={() => navigate("/spare-parts/requests")}>
            Parts Requisitions Queue
          </Button>
          <Button variant="primary" icon={ExternalLink} onClick={() => navigate(`/assets/360?id=${selectedAssetId}`)}>
            View Asset 360
          </Button>
        </div>
      </div>

      {/* Equipment Selector Bar */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={18} color="#38BDF8" />
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Select Equipment Machine:</span>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#FFFFFF" }}>
                {targetAsset?.name} ({selectedAssetId})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <select
              className="form-select"
              style={{ height: "38px", minWidth: "260px", fontWeight: 700 }}
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>

            <div style={{ position: "relative", width: "220px" }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Filter parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "30px", height: "38px", fontSize: "12px" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* BOM Subsystems Structure */}
      {activeBOM && activeBOM.subsystems ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeBOM.subsystems.map((sub, idx) => {
            const filteredSubParts = sub.parts.filter(
              (p) =>
                p.partNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredSubParts.length === 0 && searchQuery) return null;

            return (
              <Card key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8", fontWeight: 700, fontSize: "12px" }}>
                      {idx + 1}
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                      Subsystem: {sub.subsystem}
                    </h3>
                  </div>
                  <Badge variant="cyan">{filteredSubParts.length} Registered Components</Badge>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Part Number</th>
                        <th>Component Description</th>
                        <th>Qty / Machine</th>
                        <th>Criticality</th>
                        <th>Store Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubParts.map((part) => {
                        const stock = getPartStock(part.partNo);
                        const isLow = stock <= 2;

                        return (
                          <tr key={part.partNo}>
                            <td>
                              <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>
                                {part.partNo}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{part.name}</div>
                            </td>
                            <td>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                                {part.qtyPerAsset}x
                              </span>
                            </td>
                            <td>
                              <Badge variant={part.criticality === "Critical" ? "rose" : part.criticality === "High" ? "amber" : "cyan"}>
                                {part.criticality}
                              </Badge>
                            </td>
                            <td>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isLow ? "#EF4444" : "#10B981" }}>
                                {stock} on-hand
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRequestPart(part)}
                              >
                                Request Part
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No bill of materials mapped for this machine yet. You can register new components in the Parts Inventory.
          </div>
        </Card>
      )}
    </div>
  );
}

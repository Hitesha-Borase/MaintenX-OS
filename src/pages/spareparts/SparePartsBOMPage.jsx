import React, { useState } from "react";
import {
  Layers,
  Search,
  Package,
  ExternalLink,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function SparePartsBOMPage() {
  const { assets = [], spareParts = [], partsBOM = [], requestSparePart } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || "FM-001");
  const [searchQuery, setSearchQuery] = useState("");

  const activeBOM = partsBOM.find((b) => b.assetId === selectedAssetId) || partsBOM[0];
  const targetAsset = assets.find((a) => a.id === selectedAssetId);

  const getPartStock = (partNo) => {
    const part = spareParts.find((p) => p.partNumber === partNo);
    return part ? part.stock : 4;
  };

  const handleRequestPart = (part) => {
    if (requestSparePart) {
      requestSparePart({
        partNo: part.partNo,
        partName: part.name,
        quantity: 1,
        assetId: selectedAssetId,
        requestedBy: "Marcus Vance"
      });
    }
    addToast(`Requisition order submitted for ${part.name} (${part.partNo})!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Equipment Spare Parts BOM
            </h1>
            <Badge variant="cyan">MULTI-TIER BOM</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Package} onClick={() => navigate("/spare-parts/requests")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Parts Requisitions Queue
          </Button>
          <Button variant="primary" icon={ExternalLink} onClick={() => navigate(`/assets/360?id=${selectedAssetId}`)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            View Asset 360
          </Button>
        </div>
      </div>

      {/* Equipment Selector Bar */}
      <Card style={{ padding: "16px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px" }}>
            <Layers size={18} color="#8C5B23" />
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>SELECT MACHINE:</span>
              <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>
                {targetAsset?.name || "Asset"} ({selectedAssetId})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "220px", fontWeight: 700, fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name}
                </option>
              ))}
            </select>

            <div style={{ position: "relative", minWidth: "180px" }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Filter parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "30px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
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
              <Card key={idx} style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "rgba(140, 91, 35, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8C5B23", fontWeight: 800, fontSize: "12px" }}>
                      {idx + 1}
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
                      Subsystem: {sub.subsystem}
                    </h3>
                  </div>
                  <Badge variant="cyan">{filteredSubParts.length} COMPONENTS</Badge>
                </div>

                <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
                  <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
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
                              <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                                {part.partNo}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{part.name}</div>
                            </td>
                            <td>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                                {part.qtyPerAsset}x
                              </span>
                            </td>
                            <td>
                              <Badge variant={part.criticality === "Critical" ? "rose" : part.criticality === "High" ? "amber" : "cyan"}>
                                {part.criticality}
                              </Badge>
                            </td>
                            <td>
                              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isLow ? "#DC2626" : "#059669" }}>
                                {stock} on-hand
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleRequestPart(part)}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  background: "linear-gradient(180deg, #E2B670 0%, #C89547 100%)",
                                  color: "#261603",
                                  border: "1px solid #E8C182",
                                  cursor: "pointer"
                                }}
                              >
                                Request Part
                              </button>
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
        <Card style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
          No bill of materials mapped for this machine yet. You can register new components in the Parts Inventory.
        </Card>
      )}
    </div>
  );
}

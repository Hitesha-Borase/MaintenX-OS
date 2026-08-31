import React, { useState } from "react";
import {
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function BatchesPage() {
  const { batches, releaseBatchQA } = useProduction();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredBatches = batches.filter((b) => {
    return (
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tank.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleRelease = (batchId) => {
    if (releaseBatchQA) releaseBatchQA(batchId);
    addToast(`Batch ${batchId} released for packaging by QA!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Liquid Formulation Batches & Blending
            </h1>
            <Badge variant="cyan">{batches.length} Active Batches</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Bulk liquid syrup blending, pasteurization hold times, Brix/pH verification, and batch release workflows.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => navigate("/traceability")}>
            Batch 360 Traceability
          </Button>
        </div>
      </div>

      {/* Batches Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search batch lot #, product recipe, tank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px" }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Recipe / Product</th>
                <th>Vessel / Tank</th>
                <th>Volume (Liters)</th>
                <th>Brix / pH Spec</th>
                <th>QA Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{b.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{b.product}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{b.tank}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {b.volumeLiters?.toLocaleString() || "10,000"} L
                  </td>
                  <td>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Brix: <strong style={{ color: "#FFFFFF" }}>{b.brix || "10.4°Bx"}</strong> • pH: <strong style={{ color: "#FFFFFF" }}>{b.pH || "3.2"}</strong>
                    </span>
                  </td>
                  <td>
                    <Badge variant={b.qaStatus === "Released" ? "emerald" : "amber"}>
                      {b.qaStatus || "In Testing"}
                    </Badge>
                  </td>
                  <td>
                    {b.qaStatus !== "Released" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ShieldCheck}
                        onClick={() => handleRelease(b.id)}
                      >
                        Release Batch
                      </Button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Packaging Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import {
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  Filter,
  Search,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function AssetHealthPage() {
  const { assets } = useCMMS();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = assets.filter((a) => {
    return (
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.line?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Plant Asset Health & Condition Monitoring
            </h1>
            <Badge variant="cyan">{assets.length} Tracked Machines</Badge>
          </div>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Fleet Health Index"
          value="94.2%"
          unit="Aggregate"
          trend={{ value: "All critical lines nominal", isPositive: true, text: "" }}
          icon={Activity}
          colorVariant="emerald"
        />
        <StatCard
          title="Operational Uptime"
          value={`${assets.filter((a) => a.status === "Operational").length} / ${assets.length}`}
          unit="Active"
          trend={{ value: "1 In Repair (Pasteurizer)", isPositive: false, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="Degraded Health Alert"
          value="1"
          unit="Unit"
          trend={{ value: "FM-001 bearing vibration", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
      </div>

      {/* Assets Grid */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder=""
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
                <th>Asset ID</th>
                <th>Equipment Name</th>
                <th>Line / Area</th>
                <th>Health Score</th>
                <th>Criticality</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((a) => {
                const isOp = a.status === "Operational";
                const isDeg = a.status === "Degraded";

                return (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{a.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{a.category}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{a.line}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, color: a.health >= 90 ? "#10B981" : a.health >= 75 ? "#F59E0B" : "#EF4444" }}>
                          {a.health}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={a.criticality === "Critical (A)" ? "rose" : "amber"}>
                        {a.criticality}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={isOp ? "emerald" : isDeg ? "amber" : "rose"} dot={!isOp}>
                        {a.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ExternalLink}
                        onClick={() => navigate(`/maintenance/work-orders?asset=${a.id}`)}
                      >
                        WOs
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


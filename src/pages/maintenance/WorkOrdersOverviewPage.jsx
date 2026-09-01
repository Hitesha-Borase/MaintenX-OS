import React, { useState } from "react";
import {
  Wrench,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  Filter,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";

export function WorkOrdersOverviewPage() {
  const { workOrders, updateWorkOrderStatus, addWorkOrder, assets } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filteredWOs = workOrders.filter((w) => {
    const matchesSearch =
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.assetName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === "ALL" || w.priority.includes(priorityFilter);
    return matchesSearch && matchesPriority;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Maintenance Work Orders Overview
            </h1>
            <Badge variant="cyan">{workOrders.length} Total Orders</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Executive visibility into corrective, preventive, and emergency work order execution across all lines.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Active Work Orders"
          value={workOrders.filter((w) => w.status !== "Closed" && w.status !== "Completed").length.toString()}
          unit="In Progress"
          trend={{ value: "Dispatched to technicians", isPositive: true, text: "" }}
          icon={Wrench}
          colorVariant="blue"
        />
        <StatCard
          title="Critical P1 Emergencies"
          value={workOrders.filter((w) => w.priority.includes("P1")).length.toString()}
          unit="Critical"
          trend={{ value: "Immediate priority queue", isPositive: false, text: "" }}
          icon={AlertOctagon}
          colorVariant="rose"
        />
        <StatCard
          title="Completed (MTD)"
          value={workOrders.filter((w) => w.status === "Completed" || w.status === "Closed").length.toString()}
          unit="Completed"
          trend={{ value: "100% QA sign-off", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Table Card */}
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px", justifyContent: "space-between" }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Priority:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "140px", fontSize: "12px" }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
            </select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>WO ID</th>
                <th>Work Order Title</th>
                <th>Target Asset</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Assigned Tech</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWOs.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{w.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{w.title}</div>
                  </td>
                  <td>
                    <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{w.assetName || w.assetId}</span>
                  </td>
                  <td>
                    <Badge variant="cyan">{w.type}</Badge>
                  </td>
                  <td>
                    <Badge variant={w.priority.includes("P1") ? "rose" : w.priority.includes("P2") ? "amber" : "cyan"}>
                      {w.priority}
                    </Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-primary)" }}>{w.assignedTechnician}</td>
                  <td>
                    <Badge variant={w.status === "Completed" ? "emerald" : w.status === "In Progress" ? "cyan" : "amber"}>
                      {w.status}
                    </Badge>
                  </td>
                  <td>
                    {w.status !== "Completed" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          updateWorkOrderStatus(w.id, "Completed");
                          addToast(`Work order ${w.id} marked as completed!`, "success");
                        }}
                      >
                        Complete
                      </Button>
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

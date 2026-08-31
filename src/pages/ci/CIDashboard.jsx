import React from "react";
import { useNavigate } from "react-router-dom";
import { SearchCode, CheckCircle, LineChart, Briefcase, DollarSign, ShieldCheck, FileCheck, Activity } from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function CIDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          CI / Engineering Control Center
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Monitor RCA investigations, CAPA effectiveness, total loss analysis, and active CI project savings
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid-4">
        <StatCard
          title="Open RCA Investigations"
          value="2 Active"
          description="CCP excursion + Cap thread NCR"
          icon={SearchCode}
          color="#EF4444"
        />
        <StatCard
          title="CAPA Actions Due"
          value="3 Overdue"
          description="Corrective actions past target"
          icon={CheckCircle}
          color="#F59E0B"
        />
        <StatCard
          title="Total OEE Loss (Week)"
          value="12.4%"
          description="Downtime + Quality + Speed"
          icon={LineChart}
          color="#A855F7"
        />
        <StatCard
          title="CI Savings YTD"
          value="$148,200"
          description="Verified project savings"
          icon={DollarSign}
          color="#10B981"
        />
      </div>

      {/* Operational Modules */}
      <div className="grid-3">
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Active RCA Investigations
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>INV-802 (CCP Excursion):</span>
              <Badge variant="danger">Active</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>INV-803 (Cap NCR):</span>
              <Badge variant="warning">Evidence Phase</Badge>
            </div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/ci/rca/investigations")}>
            View All RCAs
          </Button>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Loss Analysis Summary
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Downtime Loss: <strong style={{ color: "#EF4444" }}>6.2%</strong></div>
            <div>Quality Loss: <strong style={{ color: "#F59E0B" }}>3.1%</strong></div>
            <div>Yield Loss: <strong style={{ color: "#A855F7" }}>3.1%</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/ci/loss/downtime")}>
            Full Loss Waterfall
          </Button>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            CI Projects & Savings
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Active Projects: <strong style={{ color: "#FFFFFF" }}>4</strong></div>
            <div>Verified Savings: <strong style={{ color: "#10B981" }}>$148,200</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/ci/projects/list")}>
            View CI Projects
          </Button>
        </Card>
      </div>
    </div>
  );
}

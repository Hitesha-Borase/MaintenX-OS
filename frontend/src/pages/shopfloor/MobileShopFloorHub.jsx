import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  AlertOctagon,
  Clock,
  Play,
  FileText,
  Smartphone,
  Factory,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";
import { useProduction } from "../../context/ProductionContext";
import { useExceptions } from "../../context/ExceptionContext";

export function MobileShopFloorHub() {
  const navigate = useNavigate();
  const { openQrModal, setIsQuickActionOpen, addToast } = useApp();
  const { assets, pmSchedules } = useCMMS();
  const { productionOrders } = useProduction();
  const { exceptions } = useExceptions();

  // A. Current Machine / Line Context
  // Simulate assigned line
  const assignedLine = "Line 1 Aseptic";
  const assignedAsset = assets.find(a => a.id === "FM-001") || assets[0];

  // B. Current Production
  const currentOrder = productionOrders.find(o => o.status === "In Progress" && o.line === assignedLine) || productionOrders[0];

  // C. PM Checklists (Due/Assigned)
  const duePMs = pmSchedules.filter(pm => pm.status === "Due" || pm.status === "Overdue");

  // D. Alerts / Exceptions (affecting this line)
  const lineAlerts = exceptions.filter(e => e.status !== "Resolved" && (e.location === assignedLine || e.location === assignedAsset?.name));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px", margin: "0 auto", width: "100%" }}>
      {/* Mobile Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Smartphone size={20} color="#34D399" />
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
              Shopfloor HMI
            </h1>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Operator Control Terminal
          </p>
        </div>
        <Badge variant="emerald" dot>
          Shift A Active
        </Badge>
      </div>

      {/* A. Current Machine / Line Context */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Factory size={18} color="#38BDF8" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              {assignedLine}
            </h3>
          </div>
          <Badge variant={assignedAsset?.status === "Operational" ? "emerald" : "amber"}>{assignedAsset?.status}</Badge>
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Active Equipment: <strong>{assignedAsset?.id} - {assignedAsset?.name}</strong>
        </div>
      </Card>

      {/* B. Current Production & Task Area */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Activity size={18} color="#A855F7" />
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Current Production
          </h3>
        </div>
        
        {currentOrder ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{currentOrder.product}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Order: {currentOrder.id}</div>
              </div>
              <Badge variant="blue">{currentOrder.status}</Badge>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Target: {currentOrder.target} {currentOrder.uom}</span>
                <span style={{ color: "#34D399", fontWeight: 600 }}>Actual: {currentOrder.actual} {currentOrder.uom}</span>
              </div>
              <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-base)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${(currentOrder.actual / currentOrder.target) * 100}%`, height: "100%", backgroundColor: "#34D399" }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No active production orders for this line.</div>
        )}

        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <ClipboardList size={16} color="#F59E0B" />
            <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>My Tasks</h4>
          </div>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px dashed rgba(245, 158, 11, 0.3)", fontSize: "12px", color: "#F59E0B", textAlign: "center" }}>
            [UI Placeholder] Task data pending backend integration.
          </div>
        </div>
      </Card>

      {/* C. PM Checklist Area */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <CheckCircle2 size={18} color="#10B981" />
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
            Assigned PM Checklists
          </h3>
        </div>

        {duePMs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {duePMs.map(pm => (
              <div key={pm.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>{pm.task}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pm.asset} • {pm.type}</div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate(`/maintenance/checklists/${pm.id}`)}
                >
                  Execute
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No pending PM checklists for this shift.</div>
        )}
      </Card>

      {/* D. Alert / Exception Area */}
      {lineAlerts.length > 0 && (
        <Card style={{ borderColor: "#EF4444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <AlertTriangle size={18} color="#EF4444" />
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>
              Active Line Alerts
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lineAlerts.map(e => (
              <div key={e.id} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "13px", color: "#F87171" }}>
                <strong>{e.type}</strong>: {e.description}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* E. Quick Action Area */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <button
            onClick={() => openQrModal("Shop-Floor Asset Scanner", "FM-001", { name: "High-Speed Rotary Filler 12-Head", location: "Line 1" })}
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#131B2E",
              border: "1px solid #38BDF8",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.2)"
            }}
          >
            <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.2)", color: "#38BDF8" }}>
              <QrCode size={24} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Scan QR</span>
          </button>

          <button
            onClick={() => { addToast("Maintenance Escalation Flow Initiated", "error"); setIsQuickActionOpen(true); }}
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#131B2E",
              border: "1px solid #EF4444",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
            }}
          >
            <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#EF4444" }}>
              <AlertOctagon size={24} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Escalate Issue</span>
          </button>

          <button
            onClick={() => addToast("[UI Placeholder] Quality Defect Form opens here", "info")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#131B2E",
              border: "1px solid #F59E0B",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)"
            }}
          >
            <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#F59E0B" }}>
              <AlertTriangle size={24} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Log Defect</span>
          </button>
          
          <button
            onClick={() => addToast("[UI Placeholder] Start/Stop Line Workflow", "info")}
            style={{
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#131B2E",
              border: "1px solid #10B981",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
            }}
          >
            <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10B981" }}>
              <Play size={24} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Start / Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}

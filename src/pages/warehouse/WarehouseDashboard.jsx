import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Boxes,
  Truck,
  Layers,
  MapPin,
  Clipboard,
  Send,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function WarehouseDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Warehouse Operations Hub
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track receiving, stage packaging, oversee finished shipments, and verify lot traceability
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid-4">
        <StatCard
          title="Incoming Shipments"
          value="4 Deliveries"
          description="Due today"
          icon={Truck}
          color="#38BDF8"
        />
        <StatCard
          title="Active Pick Lists"
          value="2 Lists"
          description="Line staging required"
          icon={Clipboard}
          color="#A855F7"
        />
        <StatCard
          title="Finished Goods pallets"
          value="32 Pallets"
          description="Ready for dispatch"
          icon={Boxes}
          color="#10B981"
        />
        <StatCard
          title="Active Lot Holds"
          value="0 Holds"
          description="All lot controls OK"
          icon={Package}
          color="#10B981"
        />
      </div>

      {/* Operational Sections */}
      <div className="grid-3">
        {/* Receiving Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Receiving & Staging
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Active Stage: <strong style={{ color: "#FFFFFF" }}>STG-L1-IN</strong></div>
            <div style={{ color: "#F59E0B" }}>Sweetener stages: Staging requested</div>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
            <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => navigate("/warehouse/receiving/receive")}>
              Receive
            </Button>
            <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => navigate("/warehouse/receiving/scan")}>
              Scan Barcode
            </Button>
          </div>
        </Card>

        {/* Inventory Status Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Inventory Levels
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Raw Materials: <strong style={{ color: "#FFFFFF" }}>14 SKUs</strong></div>
            <div>Packaging: <strong style={{ color: "#FFFFFF" }}>8 SKUs</strong></div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/warehouse/inventory/status")}>
            Check Inventory Status
          </Button>
        </Card>

        {/* Dispatch Shipping Card */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Outbound Dispatch
          </h3>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Shipment Orders: <strong style={{ color: "#FFFFFF" }}>2 Orders</strong></div>
            <div style={{ color: "#10B981" }}>Freight: Carrier allocated</div>
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: "auto" }} onClick={() => navigate("/warehouse/shipping/dispatch")}>
            Inspect Dispatch
          </Button>
        </Card>
      </div>
    </div>
  );
}

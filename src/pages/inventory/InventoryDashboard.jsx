import React, { useState } from "react";
import {
  Package,
  Plus,
  ArrowRightLeft,
  QrCode,
  Truck,
  Layers,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { DataTable } from "../../components/tables/DataTable";
import { Modal } from "../../components/common/Modal";
import { useInventory } from "../../context/InventoryContext";
import { useApp } from "../../context/AppContext";

export function InventoryDashboard() {
  const { lots, zones, addLot, transferLotLocation } = useInventory();
  const { openQrModal, addToast } = useApp();

  const [transferModalLot, setTransferModalLot] = useState(null);
  const [newTargetLocation, setNewTargetLocation] = useState("Ambient Storage Bay 2 - Bin G-12");

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [recMaterialName, setRecMaterialName] = useState("");
  const [recMaterialCode, setRecMaterialCode] = useState("RM-NEW-ING");
  const [recQty, setRecQty] = useState(1000);
  const [recUnit, setRecUnit] = useState("kg");
  const [recSupplier, setRecSupplier] = useState("Citrus Valley Farms");

  const totalLots = lots.length;
  const rawLots = lots.filter((l) => l.category === "Raw Material").length;
  const fgLots = lots.filter((l) => l.category === "Finished Goods").length;

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferModalLot) return;
    transferLotLocation(transferModalLot.lotNumber, newTargetLocation);
    addToast(`Lot ${transferModalLot.lotNumber} transferred to ${newTargetLocation}`);
    setTransferModalLot(null);
  };

  const handleReceive = (e) => {
    e.preventDefault();
    if (!recMaterialName.trim()) return;
    const newL = addLot({
      materialCode: recMaterialCode,
      materialName: recMaterialName,
      category: "Raw Material",
      quantity: recQty,
      unit: recUnit,
      location: "Receiving Quarantine Bay 1",
      supplier: recSupplier,
      supplierLot: `SUP-LOT-${Math.floor(1000 + Math.random() * 9000)}`,
      costPerUnitUSD: 5.50
    });
    addToast(`GRN Created: Lot ${newL.lotNumber} received into quarantine!`);
    setIsReceiveModalOpen(false);
    setRecMaterialName("");
  };

  const columns = [
    {
      header: "Lot Number & Barcode",
      accessor: "lotNumber",
      render: (val, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ padding: "8px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
            <Package size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{val}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Barcode: {row.barcode || "8902810044018"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Material / SKU Name",
      accessor: "materialName",
      render: (val, row) => (
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{val}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.materialCode} • {row.category}</div>
        </div>
      )
    },
    {
      header: "Quantity on Hand",
      accessor: "quantity",
      render: (val, row) => (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#FFFFFF" }}>
          {val.toLocaleString()} {row.unit}
        </span>
      )
    },
    {
      header: "Warehouse Bin Location",
      accessor: "location",
      render: (val) => <span style={{ fontSize: "12px", color: "#38BDF8" }}>{val}</span>
    },
    {
      header: "QA Status",
      accessor: "qaStatus",
      render: (val) => {
        const variant = val.includes("Approved") || val.includes("Released") ? "emerald" : val === "Quarantine" ? "amber" : "rose";
        return <Badge variant={variant} dot>{val}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      sortable: false,
      render: (_, row) => (
        <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={QrCode}
            onClick={() => openQrModal(`Material Lot 2D Matrix: ${row.lotNumber}`, row.lotNumber, { name: row.materialName, location: row.location })}
            title="Show 2D DataMatrix"
          />
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => setTransferModalLot(row)}
          >
            Transfer Bin
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              WMS Warehouse & Material Inventory
            </h1>
            <Badge variant="cyan">GS1-128 Traceable</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Receiving goods inspection, raw ingredient lots, cold storage bin maps, and finished goods staging.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsReceiveModalOpen(true)}>
            + Receive Goods Receipt (GRN)
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-4">
        <StatCard
          title="Total Active Lots"
          value={totalLots.toString()}
          unit="lots"
          trend={{ value: "100% Tracked", isPositive: true, text: "chain-of-custody" }}
          icon={Boxes}
          colorVariant="blue"
        />
        <StatCard
          title="Raw Ingredients"
          value={rawLots.toString()}
          unit="lots"
          trend={{ value: "Cold & Ambient", isPositive: true, text: "storage zones" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Finished Goods Pallets"
          value={fgLots.toString()}
          unit="lots"
          trend={{ value: "20 Pallets Outbound", isPositive: true, text: "staging dock" }}
          icon={Truck}
          colorVariant="emerald"
        />
        <StatCard
          title="Inventory Record Accuracy"
          value="99.4%"
          unit=""
          trend={{ value: "+0.4%", isPositive: true, text: "cycle count accuracy" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Warehouse Zones & Cold Chain Map */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Facility Storage Zones & Temperature Telemetry
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Capacity occupancy and environmental conditions across plant warehouses
            </p>
          </div>
          <Badge variant="emerald">Cold Chain Integrity 100%</Badge>
        </div>

        <div className="grid-3">
          {zones.map((zone) => {
            const occupancyRate = Math.round((zone.occupied / zone.capacity) * 100);

            return (
              <div
                key={zone.id}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {zone.name}
                  </span>
                  <Badge variant="cyan">{zone.temp}</Badge>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                  <span>Occupancy: {zone.occupied} / {zone.capacity} Pallet Positions</span>
                  <span style={{ fontWeight: 700, color: occupancyRate > 85 ? "#F59E0B" : "#10B981" }}>{occupancyRate}%</span>
                </div>

                <div style={{ width: "100%", height: "6px", backgroundColor: "#1E293B", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${occupancyRate}%`, height: "100%", backgroundColor: occupancyRate > 85 ? "#F59E0B" : "#38BDF8", borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Material Lots Table */}
      <Card>
        <DataTable
          title="Material Lots & Finished Goods Registry"
          columns={columns}
          data={lots}
          searchPlaceholder="Search lot number, material, supplier, location..."
          exportFilename="flowstate_inventory_lots.csv"
        />
      </Card>

      {/* Transfer Location Modal */}
      <Modal
        isOpen={!!transferModalLot}
        onClose={() => setTransferModalLot(null)}
        title="Transfer Material Lot Location"
        subtitle={`Relocate lot ${transferModalLot?.lotNumber}`}
      >
        <form onSubmit={handleTransfer} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{transferModalLot?.lotNumber} - {transferModalLot?.materialName}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Current Location: <strong style={{ color: "#38BDF8" }}>{transferModalLot?.location}</strong></div>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Bin / Location</label>
            <select className="form-select" value={newTargetLocation} onChange={(e) => setNewTargetLocation(e.target.value)}>
              <option value="Cold Storage Zone A - Rack R01-A1">Cold Storage Zone A - Rack R01-A1</option>
              <option value="Cold Storage Zone A - Rack R04-B2">Cold Storage Zone A - Rack R04-B2</option>
              <option value="Ambient Storage Bay 2 - Bin G-12">Ambient Storage Bay 2 - Bin G-12</option>
              <option value="Packaging High-Bay - Bay 3 P02">Packaging High-Bay - Bay 3 P02</option>
              <option value="Finished Goods High-Bay Warehouse - Bin FG-44">Finished Goods High-Bay - Bin FG-44</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setTransferModalLot(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={ArrowRightLeft}>
              Confirm Bin Move
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receive Goods Receipt Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Goods Receipt (GRN) Inward Scan"
        subtitle="Receive incoming raw material delivery into quarantine storage"
      >
        <form onSubmit={handleReceive} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Material Description *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Valencia Organic Orange Concentrate 65° Brix"
              value={recMaterialName}
              onChange={(e) => setRecMaterialName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Received Quantity</label>
              <input
                type="number"
                className="form-input"
                value={recQty}
                onChange={(e) => setRecQty(parseInt(e.target.value) || 100)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select className="form-select" value={recUnit} onChange={(e) => setRecUnit(e.target.value)}>
                <option value="kg">kg (Kilograms)</option>
                <option value="L">L (Liters)</option>
                <option value="units">units</option>
                <option value="cases">cases</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Supplier Name</label>
            <input
              type="text"
              className="form-input"
              value={recSupplier}
              onChange={(e) => setRecSupplier(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <Button variant="secondary" onClick={() => setIsReceiveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Plus}>
              Receive & Print Barcode
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

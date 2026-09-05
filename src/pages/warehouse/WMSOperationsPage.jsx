import React, { useState } from "react";
import {
  Truck,
  ArrowDownToLine,
  ArrowRightLeft,
  Share2,
  CheckSquare,
  Box,
  Send,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Barcode,
  X,
  MapPin,
  Download
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { useApp } from "../../context/AppContext";

export function WMSOperationsPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState("receiving"); // receiving, putaway, movement, transfer, picking, staging, dispatch

  // Modal State for Dock Check-In
  const [isDockCheckInModalOpen, setIsDockCheckInModalOpen] = useState(false);
  const [dockForm, setDockForm] = useState({
    poNumber: "PO-SUP-2026-445",
    supplier: "Citrus Valley Farms Co.",
    item: "Valencia Orange Concentrate",
    qty: "4,500 kg (6 Plts)",
    dock: "Dock Bay 01",
    carrier: "Titan Freight Lines",
    trailerNo: "TR-9420",
    tempCheck: "3.2°C",
    bolNumber: "BOL-88491",
    status: "Dock Arrived"
  });

  const pendingPOs = [
    { po: "PO-SUP-2026-445", supplier: "Citrus Valley Farms Co.", item: "Valencia Orange Concentrate", defaultQty: "4,500 kg (6 Plts)", dock: "Dock Bay 01", temp: "3.2°C" },
    { po: "PO-SUP-2026-446", supplier: "Amcor Rigid Packaging", item: "500ml PET Preforms", defaultQty: "120,000 units", dock: "Dock Bay 04", temp: "Ambient" },
    { po: "PO-SUP-2026-447", supplier: "Dominion Cane Sugars", item: "Organic Liquid Cane Sugar", defaultQty: "6,000 L (5 Drums)", dock: "Dock Bay 02", temp: "Ambient" },
    { po: "PO-SUP-2026-448", supplier: "Crown Packaging Canada", item: "330ml Aluminum Cans + Ends", defaultQty: "150,000 cans (15 Plts)", dock: "Dock Bay 03", temp: "Ambient" },
    { po: "PO-SUP-2026-449", supplier: "Krones OEM Spare Parts", item: "Filling Valve Seal Overhaul Kit", defaultQty: "8 kits", dock: "Dock Bay 03", temp: "Ambient" }
  ];

  // Tab 1: Receiving Data
  const [receivingTasks, setReceivingTasks] = useState([
    { id: "RCV-2026-901", poNumber: "PO-SUP-2026-441", supplier: "Citrus Valley Farms Co.", item: "Valencia Orange Concentrate", qty: "6,000 kg", dock: "Dock Bay 01", status: "Dock Arrived", tempCheck: "3.4°C" },
    { id: "RCV-2026-902", poNumber: "PO-SUP-2026-438", supplier: "Alfa Laval Parts Global", item: "High-Temp Gasket Pack", qty: "5 packs", dock: "Dock Bay 03", status: "Inspected", tempCheck: "Ambient" },
    { id: "RCV-2026-903", poNumber: "PO-SUP-2026-429", supplier: "Amcor Rigid Packaging", item: "500ml PET Bottles", qty: "100,000 units", dock: "Dock Bay 04", status: "Pending Arrival", tempCheck: "Dry Clean" }
  ]);

  // Tab 2: Put Away Data
  const [putAwayTasks, setPutAwayTasks] = useState([
    { id: "PTA-441", lot: "LOT-RM-ORG-4402", material: "Valencia Organic Orange Concentrate", qty: "3,800 kg (5 Plts)", source: "Dock STG-01", targetBin: "Cold Zone A - Rack R04-B2", priority: "High", status: "Ready for Put-Away" },
    { id: "PTA-442", lot: "LOT-PKG-CAN-9140", material: "330ml Aluminum Cans", qty: "120,000 cans (12 Plts)", source: "Dock STG-03", targetBin: "Packaging Bay 3 - Racks P01-P06", priority: "Standard", status: "In Progress" },
    { id: "PTA-443", lot: "LOT-RM-SGR-1108", material: "Non-GMO Liquid Cane Sugar", qty: "4,800 L (4 Drums)", source: "Dock STG-02", targetBin: "Ambient Bay 2 - Bin G-12", priority: "Standard", status: "Ready for Put-Away" }
  ]);

  // Tab 3: Stock Movement Data
  const [movementLogs, setMovementLogs] = useState([
    { id: "MOV-8801", lot: "LOT-RM-GNG-0092", material: "Organic Ginger Root Extract", qty: "60 kg", fromBin: "Ambient Bay 2 - Bin G-12", toBin: "Weighing Station Aisle 1", operator: "J. Henderson", time: "10:15 AM", reason: "Batch Kitting" },
    { id: "MOV-8802", lot: "LOT-PKG-BX-5520", material: "24-Pack Master Cartons", qty: "500 trays", fromBin: "Packaging Bay 3 - P02", toBin: "Packaging Line 2 Infeed", operator: "M. Ramirez", time: "09:40 AM", reason: "Line Replenishment" }
  ]);

  // Tab 4: Transfers Data
  const [transfers, setTransfers] = useState([
    { id: "TRF-701", fromFacility: "Main Plant WH-01", toFacility: "Distribution Center WH-02", item: "Finished Sparkling Yuzu Tea", qty: "18,000 cans (15 Plts)", carrier: "Titan Logistics", eta: "Today 14:00", status: "In Transit" },
    { id: "TRF-702", fromFacility: "Distribution Center WH-02", toFacility: "Main Plant WH-01", item: "Empty Returnable Plastic Pallets", qty: "200 Pallets", carrier: "In-House Shunt", eta: "Today 16:30", status: "Scheduled" }
  ]);

  // Tab 5: Picking Data
  const [pickOrders, setPickOrders] = useState([
    { id: "PCK-501", orderRef: "WO-BATCH-2026-0891", lineItem: "Orange Concentrate + Citric Acid", targetWorkCenter: "Blending Tank T-101", itemsCount: 4, pickedItems: 3, status: "Picking Active" },
    { id: "PCK-502", orderRef: "WO-BATCH-2026-0892", lineItem: "Natural Terpene Emulsion", targetWorkCenter: "Flavor Add Skid S-04", itemsCount: 2, pickedItems: 0, status: "Pending Release" },
    { id: "PCK-503", orderRef: "SO-CUST-8819", lineItem: "Finished Yuzu Cans 330ml", targetWorkCenter: "Outbound Bay 2", itemsCount: 1, pickedItems: 1, status: "Pick Complete" }
  ]);

  // Tab 6: Staging Data
  const [stagingBays, setStagingBays] = useState([
    { bay: "Stage Bay STG-PROD-01", destination: "Canning Line 1", stagedItem: "330ml Aluminum Cans + Ends", lot: "LOT-PKG-CAN-9140", pallets: 6, stagedBy: "K. Vance", status: "Staged Ready" },
    { bay: "Stage Bay STG-PROD-02", destination: "Batch Blending Tank 2", stagedItem: "Liquid Cane Sugar 67.5° Brix", lot: "LOT-RM-SGR-1108", pallets: 4, stagedBy: "D. Kim", status: "Staged Ready" },
    { bay: "Stage Bay STG-DOCK-04", destination: "Dock Outbound 4", stagedItem: "Yuzu Sparkling Tea Cases", lot: "LOT-FG-2026-0885", pallets: 10, stagedBy: "M. Ramirez", status: "Awaiting Dispatch" }
  ]);

  // Tab 7: Dispatch Data
  const [dispatchOrders, setDispatchOrders] = useState([
    { id: "DSP-1041", shipmentId: "SHP-2026-881", customer: "Metro Supermarkets Distribution", destination: "Toronto Hub, ON", carrier: "Challenger Freight", trailerNo: "TR-5510", sealNo: "SL-99410", pallets: 24, status: "Loading Complete" },
    { id: "DSP-1042", shipmentId: "SHP-2026-882", customer: "Costco Wholesale East Depot", destination: "Brampton Depot, ON", carrier: "Bison Transport", trailerNo: "TR-8822", sealNo: "SL-99411", pallets: 26, status: "Dispatched" }
  ]);

  // Modal State for Action Execution
  const [activeModal, setActiveModal] = useState(null); // 'RECEIVE' | 'PUTAWAY' | 'MOVE' | 'TRANSFER' | 'PICK' | 'STAGE' | 'DISPATCH'
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = [
    { id: "receiving", label: "1. Receiving", icon: ArrowDownToLine, count: receivingTasks.length },
    { id: "putaway", label: "2. Put Away", icon: Box, count: putAwayTasks.length },
    { id: "movement", label: "3. Stock Movement", icon: ArrowRightLeft, count: movementLogs.length },
    { id: "transfer", label: "4. Transfer", icon: Share2, count: transfers.length },
    { id: "picking", label: "5. Picking", icon: CheckSquare, count: pickOrders.length },
    { id: "staging", label: "6. Staging", icon: MapPin, count: stagingBays.length },
    { id: "dispatch", label: "7. Dispatch", icon: Send, count: dispatchOrders.length }
  ];

  // Actions
  const handleSaveDockCheckIn = (e) => {
    e.preventDefault();
    if (!dockForm.poNumber || !dockForm.supplier || !dockForm.item) {
      addToast("Please fill in required fields", "warning");
      return;
    }

    const newId = `RCV-2026-${Math.floor(904 + receivingTasks.length)}`;
    const newTask = {
      id: newId,
      poNumber: dockForm.poNumber,
      supplier: dockForm.supplier,
      item: dockForm.item,
      qty: dockForm.qty || "1,000 units",
      dock: dockForm.dock,
      status: dockForm.status || "Dock Arrived",
      tempCheck: dockForm.tempCheck || "Ambient"
    };

    setReceivingTasks((prev) => [newTask, ...prev]);
    setIsDockCheckInModalOpen(false);
    addToast(`Inbound shipment ${newId} (PO ${dockForm.poNumber}) checked into ${dockForm.dock}!`, "success");

    // Cycle to next sample PO
    const nextPO = pendingPOs[(receivingTasks.length + 1) % pendingPOs.length] || pendingPOs[0];
    setDockForm({
      poNumber: nextPO.po,
      supplier: nextPO.supplier,
      item: nextPO.item,
      qty: nextPO.defaultQty,
      dock: nextPO.dock,
      carrier: "Titan Freight Lines",
      trailerNo: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      tempCheck: nextPO.temp,
      bolNumber: `BOL-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Dock Arrived"
    });
  };

  const handleInspectAndAccept = (task) => {
    setReceivingTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "Inspected" } : t))
    );

    // Automatically create a Put Away Task for accepted items
    const newPutAway = {
      id: `PTA-${Math.floor(444 + putAwayTasks.length)}`,
      lot: `LOT-INB-${task.id.replace("RCV-2026-", "")}`,
      material: task.item,
      qty: task.qty,
      source: task.dock,
      targetBin: task.tempCheck?.includes("°C") ? "Cold Zone A - Rack R02-B1" : "Ambient Bay 1 - Bin A-04",
      priority: task.tempCheck?.includes("°C") ? "High" : "Standard",
      status: "Ready for Put-Away"
    };
    setPutAwayTasks((prev) => [newPutAway, ...prev]);

    addToast(`Shipment ${task.id} inspected & accepted! Put-away task ${newPutAway.id} generated.`, "success");
  };

  const handleCompletePutAway = (task) => {
    setPutAwayTasks((prev) => prev.filter((p) => p.id !== task.id));
    addToast(`Lot ${task.lot} successfully put away into ${task.targetBin}!`, "success");
  };

  const handleConfirmPick = (order) => {
    setPickOrders((prev) =>
      prev.map((p) =>
        p.id === order.id ? { ...p, pickedItems: p.itemsCount, status: "Pick Complete" } : p
      )
    );
    addToast(`Pick order ${order.id} verified and completed. Ready for production issue.`, "success");
  };

  const handleReleaseStaging = (bay) => {
    setStagingBays((prev) =>
      prev.map((b) =>
        b.bay === bay.bay ? { ...b, status: "Released to Line" } : b
      )
    );
    addToast(`${bay.stagedItem} released directly to ${bay.destination}.`, "success");
  };

  const handleDispatchShipment = (dsp) => {
    setDispatchOrders((prev) =>
      prev.map((d) =>
        d.id === dsp.id ? { ...d, status: "Dispatched" } : d
      )
    );
    addToast(`Trailer ${dsp.trailerNo} sealed and dispatched to ${dsp.customer}!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Warehouse Management System (WMS Operations)
            </h1>
            <Badge variant="cyan">7 CORE WAREHOUSE OPERATIONS</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            End-to-end execution flow: Receiving → Put Away → Stock Movement → Transfer → Picking → Staging → Dispatch.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Inbound Dock Queue"
          value={receivingTasks.length.toString()}
          unit="Active Inbounds"
          trend={{ value: "All docks scheduled", isPositive: true, text: "" }}
          icon={ArrowDownToLine}
          colorVariant="blue"
        />
        <StatCard
          title="Put-Away Backlog"
          value={putAwayTasks.length.toString()}
          unit="Pending Lots"
          trend={{ value: "Avg cycle: 14 mins", isPositive: true, text: "" }}
          icon={Box}
          colorVariant="amber"
        />
        <StatCard
          title="Active Picking Orders"
          value={pickOrders.filter((p) => p.status.includes("Pick")).length.toString()}
          unit="Waves Active"
          trend={{ value: "Production prioritized", isPositive: true, text: "" }}
          icon={CheckSquare}
          colorVariant="cyan"
        />
        <StatCard
          title="Ready For Dispatch"
          value={dispatchOrders.filter((d) => d.status.includes("Loading") || d.status.includes("Complete")).length.toString()}
          unit="Trailers Sealed"
          trend={{ value: "OTIF on schedule", isPositive: true, text: "" }}
          icon={Send}
          colorVariant="emerald"
        />
      </div>

      {/* Operation Tabs Navigation */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", borderBottom: "1px solid var(--border-subtle)" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "10px 10px 0 0",
                border: "none",
                borderBottom: isActive ? "3px solid #C89547" : "3px solid transparent",
                backgroundColor: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              <Icon size={16} color={isActive ? "#8C5B23" : "currentColor"} />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "rgba(200, 149, 71, 0.15)" : "var(--bg-card-subtle)",
                  color: isActive ? "#8C5B23" : "inherit"
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CARDS */}

      {/* 1. RECEIVING */}
      {activeTab === "receiving" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Inbound Receiving & Dock Pre-Inspection
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "4px" }}>
                Verify incoming bill of lading, temperature SLAs, and scan material barcode labels.
              </span>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsDockCheckInModalOpen(true)}
            >
              Dock Check-In
            </Button>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Receiving ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>PO Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Supplier</th>
                  <th style={{ whiteSpace: "nowrap" }}>Material Item</th>
                  <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ whiteSpace: "nowrap" }}>Dock Location</th>
                  <th style={{ whiteSpace: "nowrap" }}>Temp Check</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receivingTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{task.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{task.poNumber}</td>
                    <td style={{ fontWeight: 600 }}>{task.supplier}</td>
                    <td>{task.item}</td>
                    <td style={{ fontWeight: 700 }}>{task.qty}</td>
                    <td><Badge variant="blue">{task.dock}</Badge></td>
                    <td><span style={{ color: "#10B981", fontWeight: 600 }}>{task.tempCheck}</span></td>
                    <td><Badge variant={task.status === "Inspected" ? "emerald" : "amber"}>{task.status}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      <Button
                        variant={task.status === "Inspected" ? "ghost" : "secondary"}
                        size="sm"
                        disabled={task.status === "Inspected"}
                        onClick={() => handleInspectAndAccept(task)}
                        style={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        {task.status === "Inspected" ? "Inspected ✓" : "Inspect & Accept"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. PUT AWAY */}
      {activeTab === "putaway" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Directed Put Away Tasks
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Direct pallets from inbound receiving bays into optimized rack locations based on zoning rules.
              </span>
            </div>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "920px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Task ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Lot Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Material Description</th>
                  <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ whiteSpace: "nowrap" }}>Source Bay</th>
                  <th style={{ whiteSpace: "nowrap" }}>Target Rack / Bin</th>
                  <th style={{ whiteSpace: "nowrap" }}>Priority</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {putAwayTasks.map((task) => (
                  <tr key={task.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{task.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{task.lot}</td>
                    <td style={{ fontWeight: 600 }}>{task.material}</td>
                    <td style={{ fontWeight: 700 }}>{task.qty}</td>
                    <td><Badge variant="slate">{task.source}</Badge></td>
                    <td><Badge variant="emerald">{task.targetBin}</Badge></td>
                    <td><Badge variant={task.priority === "High" ? "rose" : "blue"}>{task.priority}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompletePutAway(task)}
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                      >
                        Confirm Put-Away
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 3. STOCK MOVEMENT */}
      {activeTab === "movement" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Internal Stock Movement Ledger
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Full audit trail of all bin-to-bin and station-to-station relocations.
              </span>
            </div>
            <Button
              variant="secondary"
              icon={Plus}
              size="sm"
              onClick={() => addToast("Internal stock movement initiated.", "info")}
            >
              + Move Stock
            </Button>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Movement ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Lot Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Material</th>
                  <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ whiteSpace: "nowrap" }}>From Location</th>
                  <th style={{ whiteSpace: "nowrap" }}>To Location</th>
                  <th style={{ whiteSpace: "nowrap" }}>Operator</th>
                  <th style={{ whiteSpace: "nowrap" }}>Time</th>
                  <th style={{ whiteSpace: "nowrap" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {movementLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{log.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{log.lot}</td>
                    <td style={{ fontWeight: 600 }}>{log.material}</td>
                    <td style={{ fontWeight: 700 }}>{log.qty}</td>
                    <td><span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{log.fromBin}</span></td>
                    <td><Badge variant="cyan">{log.toBin}</Badge></td>
                    <td>{log.operator}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{log.time}</td>
                    <td><Badge variant="slate">{log.reason}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. TRANSFER */}
      {activeTab === "transfer" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Inter-Facility & Inter-Zone Transfers
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Manage bulk transfer orders between Main Plant WH-01 and Distribution Center WH-02.
              </span>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => addToast("New Inter-Warehouse Transfer Order drafted.", "info")}
            >
              + Create Transfer Order
            </Button>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Transfer ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Origin Facility</th>
                  <th style={{ whiteSpace: "nowrap" }}>Destination Facility</th>
                  <th style={{ whiteSpace: "nowrap" }}>Item Transferred</th>
                  <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                  <th style={{ whiteSpace: "nowrap" }}>Logistics Carrier</th>
                  <th style={{ whiteSpace: "nowrap" }}>ETA</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{t.id}</td>
                    <td style={{ fontWeight: 600 }}>{t.fromFacility}</td>
                    <td style={{ fontWeight: 600, color: "#0284C7" }}>{t.toFacility}</td>
                    <td>{t.item}</td>
                    <td style={{ fontWeight: 700 }}>{t.qty}</td>
                    <td>{t.carrier}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{t.eta}</td>
                    <td><Badge variant={t.status === "In Transit" ? "blue" : "emerald"}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. PICKING */}
      {activeTab === "picking" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Order Picking & Kitting Execution
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Pick lists generated for work orders, batch blending, and customer dispatch waves.
              </span>
            </div>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Pick Order</th>
                  <th style={{ whiteSpace: "nowrap" }}>Reference Order</th>
                  <th style={{ whiteSpace: "nowrap" }}>Ingredients / Materials</th>
                  <th style={{ whiteSpace: "nowrap" }}>Target Work Center</th>
                  <th style={{ whiteSpace: "nowrap" }}>Pick Progress</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pickOrders.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{p.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{p.orderRef}</td>
                    <td>{p.lineItem}</td>
                    <td><Badge variant="blue">{p.targetWorkCenter}</Badge></td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{p.pickedItems} / {p.itemsCount} Items</span>
                    </td>
                    <td><Badge variant={p.status === "Pick Complete" ? "emerald" : "amber"}>{p.status}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      {p.status !== "Pick Complete" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleConfirmPick(p)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          Confirm Pick
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. STAGING */}
      {activeTab === "staging" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Production & Dock Staging Buffers
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Materials pre-allocated and verified in staging lanes before feeding production lines.
              </span>
            </div>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "900px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Staging Bay</th>
                  <th style={{ whiteSpace: "nowrap" }}>Destination Line</th>
                  <th style={{ whiteSpace: "nowrap" }}>Staged Item</th>
                  <th style={{ whiteSpace: "nowrap" }}>Lot Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Pallets</th>
                  <th style={{ whiteSpace: "nowrap" }}>Staged By</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stagingBays.map((bay, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: "#8C5B23" }}>{bay.bay}</td>
                    <td><Badge variant="cyan">{bay.destination}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{bay.stagedItem}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{bay.lot}</td>
                    <td style={{ fontWeight: 700 }}>{bay.pallets} Plts</td>
                    <td>{bay.stagedBy}</td>
                    <td><Badge variant={bay.status === "Released to Line" ? "emerald" : "amber"}>{bay.status}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      {bay.status !== "Released to Line" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReleaseStaging(bay)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          Release to Line
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Issued</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. DISPATCH */}
      {activeTab === "dispatch" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Outbound Shipping & Trailer Dispatch
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Final outbound carrier check, security bolt seal verification, and electronic bill of lading issuance.
              </span>
            </div>
          </div>

          <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ width: "100%", minWidth: "960px" }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Dispatch ID</th>
                  <th style={{ whiteSpace: "nowrap" }}>Shipment Ref</th>
                  <th style={{ whiteSpace: "nowrap" }}>Customer Destination</th>
                  <th style={{ whiteSpace: "nowrap" }}>Logistics Carrier</th>
                  <th style={{ whiteSpace: "nowrap" }}>Trailer Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Security Seal</th>
                  <th style={{ whiteSpace: "nowrap" }}>Pallets</th>
                  <th style={{ whiteSpace: "nowrap" }}>Status</th>
                  <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dispatchOrders.map((dsp) => (
                  <tr key={dsp.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23" }}>{dsp.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{dsp.shipmentId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{dsp.customer}</div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{dsp.destination}</span>
                    </td>
                    <td>{dsp.carrier}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{dsp.trailerNo}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "#10B981", fontWeight: 700 }}>{dsp.sealNo}</td>
                    <td style={{ fontWeight: 700 }}>{dsp.pallets} Plts</td>
                    <td><Badge variant={dsp.status === "Dispatched" ? "emerald" : "blue"}>{dsp.status}</Badge></td>
                    <td style={{ textAlign: "center" }}>
                      {dsp.status !== "Dispatched" ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          onClick={() => handleDispatchShipment(dsp)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          Dispatch Carrier
                        </Button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dock Check-In Modal */}
      <Modal
        isOpen={isDockCheckInModalOpen}
        onClose={() => setIsDockCheckInModalOpen(false)}
        title="Inbound Dock Check-In & Gate Receipt"
        subtitle="Register incoming carrier shipment, verify PO & assign unloading dock bay."
        maxWidth="680px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
            <Button variant="ghost" onClick={() => setIsDockCheckInModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleSaveDockCheckIn}>
              Confirm Dock Check-In
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDockCheckIn} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Select PO Preset */}
          <div style={{ padding: "12px", borderRadius: "8px", background: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Quick Select Inbound PO Preset
            </label>
            <select
              value={dockForm.poNumber}
              onChange={(e) => {
                const selected = pendingPOs.find((p) => p.po === e.target.value);
                if (selected) {
                  setDockForm((prev) => ({
                    ...prev,
                    poNumber: selected.po,
                    supplier: selected.supplier,
                    item: selected.item,
                    qty: selected.defaultQty,
                    dock: selected.dock,
                    tempCheck: selected.temp
                  }));
                }
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input, #fff)",
                color: "var(--text-primary)",
                fontSize: "13px"
              }}
            >
              {pendingPOs.map((p) => (
                <option key={p.po} value={p.po}>
                  {p.po} — {p.supplier} ({p.item})
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px"
            }}
          >
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                PO Number *
              </label>
              <input
                type="text"
                required
                value={dockForm.poNumber}
                onChange={(e) => setDockForm({ ...dockForm, poNumber: e.target.value })}
                placeholder="e.g. PO-SUP-2026-445"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Supplier / Vendor *
              </label>
              <input
                type="text"
                required
                value={dockForm.supplier}
                onChange={(e) => setDockForm({ ...dockForm, supplier: e.target.value })}
                placeholder="e.g. Citrus Valley Farms Co."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Material / Commodity Description *
              </label>
              <input
                type="text"
                required
                value={dockForm.item}
                onChange={(e) => setDockForm({ ...dockForm, item: e.target.value })}
                placeholder="e.g. Valencia Orange Concentrate"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Shipment Quantity / Units
              </label>
              <input
                type="text"
                value={dockForm.qty}
                onChange={(e) => setDockForm({ ...dockForm, qty: e.target.value })}
                placeholder="e.g. 4,500 kg (6 Plts)"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Dock Bay Assignment
              </label>
              <select
                value={dockForm.dock}
                onChange={(e) => setDockForm({ ...dockForm, dock: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              >
                <option value="Dock Bay 01">Dock Bay 01 (Refrigerated)</option>
                <option value="Dock Bay 02">Dock Bay 02 (Dry Bulk / Liquids)</option>
                <option value="Dock Bay 03">Dock Bay 03 (Packaging Materials)</option>
                <option value="Dock Bay 04">Dock Bay 04 (General Inbound)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Freight Carrier Name
              </label>
              <input
                type="text"
                value={dockForm.carrier}
                onChange={(e) => setDockForm({ ...dockForm, carrier: e.target.value })}
                placeholder="e.g. Titan Freight Lines"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Trailer / Truck Plate No.
              </label>
              <input
                type="text"
                value={dockForm.trailerNo}
                onChange={(e) => setDockForm({ ...dockForm, trailerNo: e.target.value })}
                placeholder="e.g. TR-9420"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Initial Temp SLA Check
              </label>
              <input
                type="text"
                value={dockForm.tempCheck}
                onChange={(e) => setDockForm({ ...dockForm, tempCheck: e.target.value })}
                placeholder="e.g. 3.2°C or Ambient"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Bill of Lading (BOL) #
              </label>
              <input
                type="text"
                value={dockForm.bolNumber}
                onChange={(e) => setDockForm({ ...dockForm, bolNumber: e.target.value })}
                placeholder="e.g. BOL-88491"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-input, #fff)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

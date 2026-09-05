import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  Package,
  Search,
  Filter,
  Download,
  Eye,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  MapPin,
  Calendar,
  Layers
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export const INITIAL_FINISHED_GOODS = [
  {
    id: "FG-001",
    sku: "SKU-CAN-330ML-LEM",
    productName: "Sparkling Yuzu Sparkling Tea 330ml Can",
    finishedLot: "LOT-FG-2026-0885",
    batch: "BAT-2026-0885",
    quantity: "36,000 cans (1,500 Cases)",
    location: "Finished Goods High-Bay - Bin FG-44",
    productionDate: "2026-08-30",
    expiryDate: "2027-08-30",
    status: "QA Released",
    pallet: "20 Pallets (PLT-0885-01..20)",
    shipmentStatus: "Ready to Ship",
    destination: "Metro Supermarkets Hub (Toronto)",
    tempCheck: "18.5°C Controlled"
  },
  {
    id: "FG-002",
    sku: "SKU-BOT-500ML-CIT",
    productName: "Organic Citrus Blast 500ml Multi-Barrier Bottle",
    finishedLot: "LOT-FG-2026-0886",
    batch: "BAT-2026-0886",
    quantity: "24,000 bottles (1,000 Cases)",
    location: "Finished Goods Cold Staging - Bin FG-12",
    productionDate: "2026-09-01",
    expiryDate: "2027-09-01",
    status: "QA Released",
    pallet: "14 Pallets (PLT-0886-01..14)",
    shipmentStatus: "Staged",
    destination: "Costco Wholesale East Depot (Brampton)",
    tempCheck: "4.2°C Cold Chain"
  },
  {
    id: "FG-003",
    sku: "SKU-CAN-330ML-ORG",
    productName: "Sparkling Organic Orange Soda 330ml Sleek Can",
    finishedLot: "LOT-FG-2026-0887",
    batch: "BAT-2026-0887",
    quantity: "48,000 cans (2,000 Cases)",
    location: "Finished Goods High-Bay - Bin FG-48",
    productionDate: "2026-09-02",
    expiryDate: "2027-09-02",
    status: "QA Released",
    pallet: "26 Pallets (PLT-0887-01..26)",
    shipmentStatus: "Allocated",
    destination: "Whole Foods Regional Logistics Center",
    tempCheck: "18.0°C Ambient"
  },
  {
    id: "FG-004",
    sku: "SKU-BOT-1000ML-TON",
    productName: "Natural Botanical Tonic Water 1L Glass Bottle",
    finishedLot: "LOT-FG-2026-0879",
    batch: "BAT-2026-0879",
    quantity: "12,000 bottles (1,000 Cases)",
    location: "Finished Goods Bay 3 - Bin FG-06",
    productionDate: "2026-08-25",
    expiryDate: "2028-08-25",
    status: "QA Hold",
    pallet: "12 Pallets (PLT-0879-01..12)",
    shipmentStatus: "Hold / Quarantined",
    destination: "Pending Microbiological Clearance",
    tempCheck: "20.5°C Ambient"
  }
];

export function FinishedGoods() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [finishedGoodsList, setFinishedGoodsList] = useState(INITIAL_FINISHED_GOODS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedGoodForView, setSelectedGoodForView] = useState(null);

  const filteredGoods = useMemo(() => {
    return finishedGoodsList.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        g.sku.toLowerCase().includes(q) ||
        g.finishedLot.toLowerCase().includes(q) ||
        g.batch.toLowerCase().includes(q) ||
        g.productName.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || g.shipmentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [finishedGoodsList, searchQuery, statusFilter]);

  const handleTraceLot = (lotCode) => {
    addToast(`Loading 360° Traceability for Finished Lot ${lotCode}...`, "info");
    navigate(`/warehouse/traceability?lot=${lotCode}`);
  };

  const handleExportCSV = () => {
    const headers = "SKU,Product Name,Finished Lot,Batch,Quantity,Location,Production Date,Expiry Date,Status,Pallet,Shipment Status,Destination\n";
    const rows = filteredGoods
      .map(
        (g) =>
          `"${g.sku}","${g.productName}","${g.finishedLot}","${g.batch}","${g.quantity}","${g.location}","${g.productionDate}","${g.expiryDate}","${g.status}","${g.pallet}","${g.shipmentStatus}","${g.destination}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Finished_Goods_Inventory_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Finished goods inventory exported to CSV.", "info");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "QA Released":
        return <Badge variant="emerald" dot>QA Released</Badge>;
      case "QA Hold":
        return <Badge variant="rose" dot>QA Hold</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const getShipmentBadge = (status) => {
    switch (status) {
      case "Ready to Ship":
        return <Badge variant="emerald">Ready to Ship</Badge>;
      case "Staged":
        return <Badge variant="blue">Staged</Badge>;
      case "Allocated":
        return <Badge variant="amber">Allocated</Badge>;
      case "Hold / Quarantined":
        return <Badge variant="rose">Quarantined</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Finished Goods Inventory & Pallet Staging
            </h1>
            <Badge variant="emerald">100% LOT & BATCH TRACEABLE</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time warehouse tracking of released finished product batches, pallet serials, and outbound shipment allocation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Total Finished Pallets"
          value="72 Pallets"
          unit="5,500 Cases"
          trend={{ value: "In Warehouse Storage", isPositive: true, text: "" }}
          icon={Boxes}
          colorVariant="blue"
        />
        <StatCard
          title="Ready For Dispatch"
          value="34 Pallets"
          unit="Ready to Ship"
          trend={{ value: "Customer orders confirmed", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="emerald"
        />
        <StatCard
          title="QA Release Rate"
          value="97.8%"
          unit="CoA Verified"
          trend={{ value: "1 batch on routine hold", isPositive: false, text: "" }}
          icon={CheckCircle2}
          colorVariant="cyan"
        />
        <StatCard
          title="High-Bay Occupancy"
          value="68.5%"
          unit="Capacity"
          trend={{ value: "Plenty of staging buffer", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by SKU, Finished Lot, Batch, Product Name, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Shipment Status:</span>
            <select
              className="form-select"
              style={{ height: "36px", minWidth: "150px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Shipment Statuses</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Staged">Staged</option>
              <option value="Allocated">Allocated</option>
              <option value="Hold / Quarantined">Hold / Quarantined</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1150px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>SKU</th>
                <th style={{ whiteSpace: "nowrap" }}>Finished Lot</th>
                <th style={{ whiteSpace: "nowrap" }}>Batch</th>
                <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                <th style={{ whiteSpace: "nowrap" }}>Storage Location</th>
                <th style={{ whiteSpace: "nowrap" }}>Production Date</th>
                <th style={{ whiteSpace: "nowrap" }}>Expiry</th>
                <th style={{ whiteSpace: "nowrap" }}>QA Status</th>
                <th style={{ whiteSpace: "nowrap" }}>Pallet Serial</th>
                <th style={{ whiteSpace: "nowrap" }}>Shipment Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoods.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No finished goods match your search query.
                  </td>
                </tr>
              ) : (
                filteredGoods.map((g) => (
                  <tr key={g.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8C5B23", fontSize: "12px" }}>
                        {g.sku}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)", fontSize: "12.5px" }}>
                        {g.finishedLot}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#0284C7", fontSize: "12px" }}>
                        {g.batch}
                      </span>
                    </td>
                    <td style={{ minWidth: "160px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "12.5px" }}>{g.quantity}</div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{g.productName}</span>
                    </td>
                    <td style={{ minWidth: "160px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{g.location}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{g.productionDate}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 600 }}>{g.expiryDate}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {getStatusBadge(g.status)}
                    </td>
                    <td style={{ minWidth: "150px" }}>
                      <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{g.pallet}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {getShipmentBadge(g.shipmentStatus)}
                    </td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedGoodForView(g)}
                          style={{ fontSize: "11px", padding: "4px 8px" }}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={GitBranch}
                          onClick={() => handleTraceLot(g.finishedLot)}
                          style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "#0284C7", borderColor: "#0284C7" }}
                          title="Trace Finished Lot to Ingredients & Pallet Delivery"
                        >
                          Trace Lot
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW DETAILS MODAL */}
      {selectedGoodForView && (
        <div className="modal-backdrop" onClick={() => setSelectedGoodForView(null)}>
          <div className="modal-content" style={{ maxWidth: "580px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Boxes size={18} color="#8C5B23" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Finished Goods Dossier: {selectedGoodForView.finishedLot}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    SKU: {selectedGoodForView.sku} • Batch: {selectedGoodForView.batch}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedGoodForView(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {selectedGoodForView.productName}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Target Destination: <strong style={{ color: "#0284C7" }}>{selectedGoodForView.destination}</strong>
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Total Quantity:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedGoodForView.quantity}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Pallet Serialization:</span>
                  <strong style={{ color: "#8C5B23" }}>{selectedGoodForView.pallet}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Storage Location:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedGoodForView.location}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Ambient / Cold SLA:</span>
                  <strong style={{ color: "#10B981" }}>{selectedGoodForView.tempCheck}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Production Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{selectedGoodForView.productionDate}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Expiry Date:</span>
                  <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{selectedGoodForView.expiryDate}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button
                  variant="primary"
                  icon={GitBranch}
                  onClick={() => {
                    const lot = selectedGoodForView.finishedLot;
                    setSelectedGoodForView(null);
                    handleTraceLot(lot);
                  }}
                  style={{ backgroundColor: "#0284C7", borderColor: "#0284C7" }}
                >
                  Trace 360° Genealogy
                </Button>

                <Button variant="secondary" onClick={() => setSelectedGoodForView(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import {
  Building2,
  Layers,
  MapPin,
  Package,
  ArrowRightLeft,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Thermometer,
  ShieldCheck,
  Download
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

const INITIAL_WAREHOUSE_LOCATIONS = [
  {
    id: "LOC-WH1-ZA-R04-B1",
    warehouse: "Main Plant WH-01",
    zone: "Zone A (Cold Storage +4°C)",
    rack: "Rack R04",
    location: "Bin R04-B1",
    fullHierarchy: "WH-01 > Zone A > Rack R04 > Bin B1",
    capacityPallets: 40,
    occupiedPallets: 36,
    material: "Valencia Organic Orange Juice Concentrate 65° Brix",
    materialCode: "RM-ORG-CONC",
    batchLot: "LOT-RM-ORG-4402",
    quantity: "3,800 kg",
    status: "Near Capacity",
    temp: "3.4°C"
  },
  {
    id: "LOC-WH1-ZA-R04-B2",
    warehouse: "Main Plant WH-01",
    zone: "Zone A (Cold Storage +4°C)",
    rack: "Rack R04",
    location: "Bin R04-B2",
    fullHierarchy: "WH-01 > Zone A > Rack R04 > Bin B2",
    capacityPallets: 40,
    occupiedPallets: 28,
    material: "Natural Blood Orange & Mandarin Terpene Emulsion",
    materialCode: "RM-NAT-FLV",
    batchLot: "LOT-RM-FLV-0312",
    quantity: "160 kg",
    status: "Optimal",
    temp: "3.8°C"
  },
  {
    id: "LOC-WH1-ZB-R02-G12",
    warehouse: "Main Plant WH-01",
    zone: "Zone B (Ambient Raw)",
    rack: "Rack R02",
    location: "Bin G-12",
    fullHierarchy: "WH-01 > Zone B > Rack R02 > Bin G-12",
    capacityPallets: 60,
    occupiedPallets: 45,
    material: "Organic Ginger Root Extract Fluid 20:1",
    materialCode: "RM-GNG-EXT",
    batchLot: "LOT-RM-GNG-0092",
    quantity: "120 kg",
    status: "Optimal",
    temp: "21.2°C"
  },
  {
    id: "LOC-WH1-ZB-R03-G04",
    warehouse: "Main Plant WH-01",
    zone: "Zone B (Ambient Raw)",
    rack: "Rack R03",
    location: "Bin G-04",
    fullHierarchy: "WH-01 > Zone B > Rack R03 > Bin G-04",
    capacityPallets: 50,
    occupiedPallets: 48,
    material: "Non-GMO Liquid Cane Sugar 67.5° Brix",
    materialCode: "RM-SWT-SUCR",
    batchLot: "LOT-RM-SGR-1108",
    quantity: "4,800 L",
    status: "Near Capacity",
    temp: "21.0°C"
  },
  {
    id: "LOC-WH1-ZC-R01-P02",
    warehouse: "Main Plant WH-01",
    zone: "Zone C (Packaging High-Bay)",
    rack: "Rack P01",
    location: "Bin P01-A",
    fullHierarchy: "WH-01 > Zone C > Rack P01 > Bin P01-A",
    capacityPallets: 100,
    occupiedPallets: 85,
    material: "330ml Sleek Aluminum Cans w/ Matte Varnish",
    materialCode: "PKG-CAN-330",
    batchLot: "LOT-PKG-CAN-9140",
    quantity: "120,000 cans",
    status: "Optimal",
    temp: "22.5°C"
  },
  {
    id: "LOC-WH1-ZC-R02-P05",
    warehouse: "Main Plant WH-01",
    zone: "Zone C (Packaging High-Bay)",
    rack: "Rack P02",
    location: "Bin P02-B",
    fullHierarchy: "WH-01 > Zone C > Rack P02 > Bin P02-B",
    capacityPallets: 80,
    occupiedPallets: 40,
    material: "24-Pack Kraft Corrugated Master Shipping Trays",
    materialCode: "PKG-CRTN-24",
    batchLot: "LOT-PKG-BX-5520",
    quantity: "6,500 trays",
    status: "Optimal",
    temp: "22.0°C"
  },
  {
    id: "LOC-WH2-ZD-R01-FG44",
    warehouse: "Distribution Center WH-02",
    zone: "Zone D (Finished Goods Log Bay)",
    rack: "High-Bay Rack 01",
    location: "Bin FG-44",
    fullHierarchy: "WH-02 > Zone D > High-Bay 01 > Bin FG-44",
    capacityPallets: 120,
    occupiedPallets: 95,
    material: "Sparkling Yuzu Sparkling Tea 330ml Can",
    materialCode: "SKU-CAN-330ML-LEM",
    batchLot: "LOT-FG-2026-0885",
    quantity: "36,000 cans",
    status: "Optimal",
    temp: "18.5°C"
  },
  {
    id: "LOC-WH2-ZD-R02-FG48",
    warehouse: "Distribution Center WH-02",
    zone: "Zone D (Finished Goods Log Bay)",
    rack: "High-Bay Rack 02",
    location: "Bin FG-48",
    fullHierarchy: "WH-02 > Zone D > High-Bay 02 > Bin FG-48",
    capacityPallets: 120,
    occupiedPallets: 0,
    material: "Unoccupied Available Staging Bay",
    materialCode: "BIN-EMPTY",
    batchLot: "N/A",
    quantity: "0 units",
    status: "Available",
    temp: "18.5°C"
  }
];

export function WarehousesList() {
  const { addToast } = useApp();

  const [locations, setLocations] = useState(INITIAL_WAREHOUSE_LOCATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");

  // Modals
  const [selectedLocationForView, setSelectedLocationForView] = useState(null);
  const [selectedLocationForTransfer, setSelectedLocationForTransfer] = useState(null);
  const [transferTarget, setTransferTarget] = useState("");

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        loc.location.toLowerCase().includes(q) ||
        loc.fullHierarchy.toLowerCase().includes(q) ||
        loc.material.toLowerCase().includes(q) ||
        loc.batchLot.toLowerCase().includes(q) ||
        loc.materialCode.toLowerCase().includes(q);

      const matchesWh = selectedWarehouse === "ALL" || loc.warehouse === selectedWarehouse;
      const matchesZone = selectedZone === "ALL" || loc.zone.includes(selectedZone);

      return matchesSearch && matchesWh && matchesZone;
    });
  }, [locations, searchQuery, selectedWarehouse, selectedZone]);

  const handleTransferStock = (e) => {
    e.preventDefault();
    if (!selectedLocationForTransfer || !transferTarget) {
      addToast("Please select a target bin location", "warning");
      return;
    }

    setLocations((prev) =>
      prev.map((l) => {
        if (l.id === selectedLocationForTransfer.id) {
          return {
            ...l,
            occupiedPallets: 0,
            material: "Unoccupied Available Staging Bay",
            materialCode: "BIN-EMPTY",
            batchLot: "N/A",
            quantity: "0 units",
            status: "Available"
          };
        }
        if (l.id === transferTarget) {
          return {
            ...l,
            occupiedPallets: selectedLocationForTransfer.occupiedPallets,
            material: selectedLocationForTransfer.material,
            materialCode: selectedLocationForTransfer.materialCode,
            batchLot: selectedLocationForTransfer.batchLot,
            quantity: selectedLocationForTransfer.quantity,
            status: "Optimal"
          };
        }
        return l;
      })
    );

    addToast(
      `Stock ${selectedLocationForTransfer.batchLot} relocated to target location successfully!`,
      "success"
    );
    setIsTransferModalOpen(false);
    setSelectedLocationForTransfer(null);
    setTransferTarget("");
  };

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Optimal":
        return <Badge variant="emerald" dot>Optimal</Badge>;
      case "Near Capacity":
        return <Badge variant="amber" dot>Near Full</Badge>;
      case "Available":
        return <Badge variant="cyan" dot>Available</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = "Location Hierarchy,Warehouse,Zone,Rack,Location,Capacity (Pallets),Occupied (Pallets),Occupancy %,Material,Batch/Lot,Quantity,Status\n";
    const rows = filteredLocations
      .map(
        (l) =>
          `"${l.fullHierarchy}","${l.warehouse}","${l.zone}","${l.rack}","${l.location}",${l.capacityPallets},${l.occupiedPallets},${Math.round((l.occupiedPallets / l.capacityPallets) * 100)}%,"${l.material}","${l.batchLot}","${l.quantity}","${l.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Warehouse_Locations_Hierarchy_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Warehouse location hierarchy exported to CSV.", "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Warehouse Physical Hierarchy & Locations
            </h1>
            <Badge variant="emerald">Warehouse → Zone → Rack → Location</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time rack-level capacity, volumetric occupancy, stored material lots, and aisle zoning.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Layout CSV
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
          title="Active Warehouses"
          value="2 Facilities"
          unit="WH-01 & WH-02"
          trend={{ value: "100% Operational", isPositive: true, text: "" }}
          icon={Building2}
          colorVariant="blue"
        />
        <StatCard
          title="Global Rack Occupancy"
          value="76.4%"
          unit="Pallet Capacity"
          trend={{ value: "348 / 450 Pallets", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="amber"
        />
        <StatCard
          title="Cold Zone Temp SLA"
          value="3.6°C"
          unit="Stable"
          trend={{ value: "Within 2.0-4.0°C target", isPositive: true, text: "" }}
          icon={Thermometer}
          colorVariant="cyan"
        />
        <StatCard
          title="Available Empty Bins"
          value={locations.filter((l) => l.occupiedPallets === 0).length.toString()}
          unit="Ready for Inbound"
          trend={{ value: "Clean & pre-audited", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Hierarchy Visual Summary Breadcrumbs */}
      <Card style={{ padding: "16px", borderRadius: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "13px" }}>
          <strong style={{ color: "var(--text-primary)" }}>Hierarchy Structure:</strong>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", color: "#8C5B23", fontWeight: 700 }}>
            Warehouse (WH-01, WH-02)
          </span>
          <span style={{ color: "var(--text-muted)" }}>➔</span>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", color: "#0284C7", fontWeight: 700 }}>
            Zone (Cold A, Ambient B, Packaging C, FG D)
          </span>
          <span style={{ color: "var(--text-muted)" }}>➔</span>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", color: "#10B981", fontWeight: 700 }}>
            Rack (R01 - R06)
          </span>
          <span style={{ color: "var(--text-muted)" }}>➔</span>
          <span style={{ padding: "4px 8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", color: "var(--text-primary)", fontWeight: 700 }}>
            Location Bin (B1, B2, G-12, FG-44)
          </span>
        </div>
      </Card>

      {/* Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search location, bin, material, lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Warehouse:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "140px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
              >
                <option value="ALL">All Warehouses</option>
                <option value="Main Plant WH-01">Main Plant WH-01</option>
                <option value="Distribution Center WH-02">Distribution Center WH-02</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>Zone:</span>
              <select
                className="form-select"
                style={{ height: "36px", minWidth: "130px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                <option value="ALL">All Zones</option>
                <option value="Zone A">Zone A (Cold)</option>
                <option value="Zone B">Zone B (Ambient)</option>
                <option value="Zone C">Zone C (Packaging)</option>
                <option value="Zone D">Zone D (Finished Goods)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "1100px" }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Location (Warehouse &gt; Zone &gt; Rack &gt; Bin)</th>
                <th style={{ whiteSpace: "nowrap" }}>Capacity</th>
                <th style={{ whiteSpace: "nowrap" }}>Occupancy</th>
                <th style={{ whiteSpace: "nowrap" }}>Material</th>
                <th style={{ whiteSpace: "nowrap" }}>Batch / Lot</th>
                <th style={{ whiteSpace: "nowrap" }}>Quantity</th>
                <th style={{ whiteSpace: "nowrap" }}>Status</th>
                <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "var(--text-secondary)" }}>
                    No warehouse storage bins match your filters.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => {
                  const pct = Math.round((loc.occupiedPallets / loc.capacityPallets) * 100);
                  const isAvailable = loc.occupiedPallets === 0;

                  return (
                    <tr key={loc.id}>
                      <td style={{ minWidth: "220px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <MapPin size={14} color="#8C5B23" />
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                              {loc.location}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              {loc.fullHierarchy}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {loc.capacityPallets} Pallets
                        </span>
                      </td>

                      <td style={{ minWidth: "130px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              backgroundColor: "var(--border-subtle)",
                              borderRadius: "3px",
                              overflow: "hidden"
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                backgroundColor: pct > 85 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#10B981"
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, minWidth: "32px" }}>
                            {pct}%
                          </span>
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          {loc.occupiedPallets} / {loc.capacityPallets} Plts
                        </span>
                      </td>

                      <td style={{ minWidth: "200px" }}>
                        <div style={{ fontWeight: 600, fontSize: "12px", color: isAvailable ? "var(--text-muted)" : "var(--text-primary)", maxWidth: "220px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={loc.material}>
                          {loc.material}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          {loc.materialCode}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: isAvailable ? "var(--text-muted)" : "#8C5B23", fontWeight: 700 }}>
                          {loc.batchLot}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                          {loc.quantity}
                        </span>
                      </td>

                      <td style={{ whiteSpace: "nowrap" }}>
                        {getStatusBadge(loc.status)}
                      </td>

                      <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedLocationForView(loc)}
                            style={{ fontSize: "11px", padding: "4px 8px" }}
                          >
                            View
                          </Button>
                          {!isAvailable && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={ArrowRightLeft}
                              onClick={() => {
                                setSelectedLocationForTransfer(loc);
                                setIsTransferModalOpen(true);
                              }}
                              style={{ fontSize: "11px", padding: "4px 8px", color: "#8C5B23" }}
                            >
                              Transfer Stock
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW LOCATION DOSSIER MODAL */}
      {selectedLocationForView && (
        <div className="modal-backdrop" onClick={() => setSelectedLocationForView(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#8C5B23" />
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Location Dossier: {selectedLocationForView.location}
                  </h2>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {selectedLocationForView.fullHierarchy}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedLocationForView(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Warehouse Facility:</span>
                  <strong style={{ color: "var(--text-primary)" }}>{selectedLocationForView.warehouse}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Zone Classification:</span>
                  <strong style={{ color: "#0284C7" }}>{selectedLocationForView.zone}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Ambient / Cold SLA:</span>
                  <strong style={{ color: "#10B981" }}>{selectedLocationForView.temp}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Occupancy Rating:</span>
                  <strong style={{ color: "var(--text-primary)" }}>
                    {selectedLocationForView.occupiedPallets} / {selectedLocationForView.capacityPallets} Pallets ({Math.round((selectedLocationForView.occupiedPallets / selectedLocationForView.capacityPallets) * 100)}%)
                  </strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Currently Stored Lot:
                </h4>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedLocationForView.material}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "var(--text-muted)" }}>
                    <span>SKU: {selectedLocationForView.materialCode}</span>
                    <span>Batch/Lot: <strong style={{ color: "#8C5B23" }}>{selectedLocationForView.batchLot}</strong></span>
                    <span>Quantity: {selectedLocationForView.quantity}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedLocationForView(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER STOCK MODAL */}
      {isTransferModalOpen && selectedLocationForTransfer && (
        <div className="modal-backdrop" onClick={() => setIsTransferModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Transfer / Relocate Stock
                </h2>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Source: {selectedLocationForTransfer.fullHierarchy}
                </span>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferStock} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "10px 14px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px", fontSize: "12px" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedLocationForTransfer.material}</div>
                <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                  Lot: <strong>{selectedLocationForTransfer.batchLot}</strong> • {selectedLocationForTransfer.quantity} ({selectedLocationForTransfer.occupiedPallets} Pallets)
                </div>
              </div>

              <div>
                <label className="form-label">Destination Rack / Bin Location *</label>
                <select
                  className="form-select"
                  required
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="">Select Destination Bin...</option>
                  {locations
                    .filter((l) => l.id !== selectedLocationForTransfer.id)
                    .map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.fullHierarchy} ({dest.capacityPallets - dest.occupiedPallets} Plts Available)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="form-label">Relocation Reason</label>
                <select className="form-select" style={{ backgroundColor: "#FFFFFF" }}>
                  <option value="OPTIMIZE_SPACE">Consolidation / Space Optimization</option>
                  <option value="TEMP_ZONE">Temperature Re-Zoning</option>
                  <option value="STAGING">Production Line Staging Preparation</option>
                  <option value="MAINTENANCE">Aisle Rack Inspection</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={ArrowRightLeft}>
                  Execute Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import {
  Package,
  Search,
  Plus,
  ArrowRight,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useInventory } from "../../context/InventoryContext";
import { useApp } from "../../context/AppContext";

export function WarehouseInventoryPage() {
  const { lots, zones, addLot } = useInventory();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    category: "Raw Material",
    quantity: 1000,
    unit: "kg",
    zone: "Zone A - Raw Ingredients"
  });

  const filteredLots = (lots || []).filter((l) => {
    return (
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.zone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.item) {
      addToast("Please provide item name", "warning");
      return;
    }
    if (addLot) {
      addLot({
        ...formData,
        quantity: Number(formData.quantity),
        status: "In Stock"
      });
    }
    addToast(`Material Lot added to Warehouse Inventory!`, "success");
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Warehouse & Raw Materials Inventory
            </h1>
            <Badge variant="cyan">{lots?.length || 0} Tracked Material Lots</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            MRO store, bulk ingredient holding tanks, packaging materials stock, and warehouse bin locations.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Receive Material Lot
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <StatCard
          title="Stock Availability Health"
          value="98.1%"
          unit="In Stock"
          trend={{ value: "All high-runner SKUs covered", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Active Storage Zones"
          value="4 Zones"
          unit="A, B, C, D"
          trend={{ value: "Cleanroom & ambient storage", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Inventory Turnover"
          value="18.2 Days"
          unit="DOH"
          trend={{ value: "Lean stock buffer", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search lot number, material item, zone..."
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
                <th>Lot ID</th>
                <th>Material Description</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Warehouse Zone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLots.map((l) => (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{l.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.item}</div>
                  </td>
                  <td>
                    <Badge variant="cyan">{l.category}</Badge>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {l.quantity.toLocaleString()} {l.unit}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {l.zone}
                  </td>
                  <td>
                    <Badge variant={l.status === "In Stock" ? "emerald" : "amber"}>
                      {l.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECEIVE LOT MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Receive Material Inbound
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liquid Cane Sugar 67° Bx Syrup"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Raw Material">Raw Material Ingredient</option>
                    <option value="Packaging">Packaging (Bottles/Caps)</option>
                    <option value="Chemicals">Sanitation Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Destination Warehouse Zone</label>
                <select
                  className="form-select"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                >
                  <option value="Zone A - Raw Ingredients">Zone A - Raw Ingredients</option>
                  <option value="Zone B - Packaging & Corrugated">Zone B - Packaging</option>
                  <option value="Zone C - Bulk Tank Silos">Zone C - Bulk Tank Silos</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Receive & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

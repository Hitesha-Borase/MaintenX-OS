import React, { useState } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Edit2,
  X,
  Boxes,
  Tag,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function ItemMasterPage() {
  const { items = [], addItem, setItems } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "Finished Goods",
    family: "Sparkling Flavors",
    uom: "Bottles",
    stdCost: "$0.45"
  });

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.family.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      addToast("Please provide item name.", "warning");
      return;
    }
    const created = addItem(newItem);
    addToast(`Item ${created.id} (${created.name}) registered in SKU Master!`, "success");
    setIsAddModalOpen(false);
    setNewItem({ name: "", category: "Finished Goods", family: "Sparkling Flavors", uom: "Bottles", stdCost: "$0.45" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem.name.trim()) {
      addToast("Please provide item name.", "warning");
      return;
    }
    if (setItems) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? editingItem : i))
      );
    }
    addToast(`Item ${editingItem.id} (${editingItem.name}) updated successfully!`, "success");
    setEditingItem(null);
  };

  const finishedGoodsCount = items.filter((i) => i.category?.includes("Finished")).length;
  const materialsCount = items.filter((i) => !i.category?.includes("Finished")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Item & SKU Master Data
            </h1>
            <Badge variant="cyan">{items.length} REGISTERED ITEMS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Create New SKU Item
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
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
          title="Registered SKUs"
          value={items.length.toString()}
          unit="Active Items"
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Finished Goods"
          value={finishedGoodsCount.toString()}
          unit="Formulations"
          icon={Boxes}
          colorVariant="cyan"
        />
        <StatCard
          title="Raw & Packaging"
          value={materialsCount.toString()}
          unit="Components"
          icon={Tag}
          colorVariant="amber"
        />
        <StatCard
          title="BOM Integrity"
          value="100%"
          unit="Validated"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table Section */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Controls Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "220px" }}>
            <div style={{ position: "relative", minWidth: "200px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search SKU code, product name, family..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: "auto", minWidth: "140px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Raw Ingredients">Raw Ingredients</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name / Description</th>
                <th>Category</th>
                <th>Product Family</th>
                <th>Base UOM</th>
                <th>Std Unit Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {item.id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{item.name}</strong>
                  </td>
                  <td>
                    <Badge variant={item.category.includes("Finished") ? "emerald" : "amber"}>
                      {item.category}
                    </Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{item.family}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700 }}>{item.uom}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>
                    {item.stdCost}
                  </td>
                  <td>
                    <Badge variant="emerald">Active</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingItem({ ...item })}
                      title="Edit SKU"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-card-subtle)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE SKU MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Create New SKU Item
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 330ml Blood Orange Sparkling Soda"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Product Family</label>
                  <input
                    type="text"
                    placeholder="e.g. Sparkling Flavors"
                    value={newItem.family}
                    onChange={(e) => setNewItem({ ...newItem, family: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Base UOM</label>
                  <select
                    className="form-select"
                    value={newItem.uom}
                    onChange={(e) => setNewItem({ ...newItem, uom: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Bottles">Bottles</option>
                    <option value="Cans">Cans</option>
                    <option value="Liters">Liters</option>
                    <option value="Units">Units</option>
                    <option value="Kilograms">Kilograms</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Standard Unit Cost</label>
                  <input
                    type="text"
                    placeholder="e.g. $0.45"
                    value={newItem.stdCost}
                    onChange={(e) => setNewItem({ ...newItem, stdCost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save SKU
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SKU MODAL */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit SKU — {editingItem.id}
              </h2>
              <button onClick={() => setEditingItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Product Family</label>
                  <input
                    type="text"
                    value={editingItem.family}
                    onChange={(e) => setEditingItem({ ...editingItem, family: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Base UOM</label>
                  <select
                    className="form-select"
                    value={editingItem.uom}
                    onChange={(e) => setEditingItem({ ...editingItem, uom: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Bottles">Bottles</option>
                    <option value="Cans">Cans</option>
                    <option value="Liters">Liters</option>
                    <option value="Units">Units</option>
                    <option value="Kilograms">Kilograms</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Standard Unit Cost</label>
                  <input
                    type="text"
                    value={editingItem.stdCost}
                    onChange={(e) => setEditingItem({ ...editingItem, stdCost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

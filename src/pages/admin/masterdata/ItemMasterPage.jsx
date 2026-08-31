import React, { useState } from "react";
import {
  Database,
  Search,
  Plus,
  CheckCircle2,
  Download,
  Filter,
  Layers,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useAdmin } from "../../../context/AdminContext";
import { useApp } from "../../../context/AppContext";

export function ItemMasterPage() {
  const { items, addItem } = useAdmin();
  const { addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Finished Goods",
    family: "Sparkling Flavors",
    uom: "Bottles",
    stdCost: "$0.45"
  });

  const filteredItems = items.filter((i) => {
    return (
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.family.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name) {
      addToast("Please provide item name", "warning");
      return;
    }
    const created = addItem(newItem);
    addToast(`Item ${created.id} (${created.name}) registered in SKU Master!`, "success");
    setIsAddModalOpen(false);
    setNewItem({ name: "", category: "Finished Goods", family: "Sparkling Flavors", uom: "Bottles", stdCost: "$0.45" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Item & SKU Master Data
            </h1>
            <Badge variant="cyan">{items.length} Registered Items</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Global master catalogue of finished goods, raw ingredients, packaging components, and standard costs.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Create New SKU Item
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search item SKU, name, family..."
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
                <th>Item SKU Code</th>
                <th>Item Description</th>
                <th>Category</th>
                <th>Product Family</th>
                <th>Base UOM</th>
                <th>Standard Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((i) => (
                <tr key={i.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{i.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{i.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{i.category}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{i.family}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{i.uom}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{i.stdCost}</td>
                  <td>
                    <Badge variant="emerald">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE ITEM MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Item / SKU to Master
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500ml Berry Blast Soda"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Chemicals">Sanitation Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Product Family</label>
                  <input
                    type="text"
                    value={newItem.family}
                    onChange={(e) => setNewItem({ ...newItem, family: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Base UOM</label>
                  <input
                    type="text"
                    value={newItem.uom}
                    onChange={(e) => setNewItem({ ...newItem, uom: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Standard Cost</label>
                  <input
                    type="text"
                    value={newItem.stdCost}
                    onChange={(e) => setNewItem({ ...newItem, stdCost: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save to SKU Master
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

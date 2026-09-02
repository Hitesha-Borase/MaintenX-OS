import React, { useState } from "react";
import {
  Package,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Layers,
  Truck,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function PackagingMasterPage() {
  const { addToast } = useApp();

  const [packagingTypes, setPackagingTypes] = useState([
    { id: "PKG-01", name: "500ml Clear PET Preform", spec: "28mm PCO 1881", supplier: "Amcor Rigid Packaging", cost: "$0.045", status: "Active" },
    { id: "PKG-02", name: "28mm Plastic Sport Closure", spec: "Tamper-evident lining", supplier: "Berry Global", cost: "$0.018", status: "Active" },
    { id: "PKG-03", name: "330ml Sleek Aluminum Can", spec: "202 End finish", supplier: "Ball Corp", cost: "$0.075", status: "Active" },
    { id: "PKG-04", name: "24-Pack Corrugated Tray", spec: "B-Flute Kraft", supplier: "International Paper", cost: "$0.220", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [newPkg, setNewPkg] = useState({
    name: "",
    spec: "",
    supplier: "",
    cost: "$0.050"
  });

  const filteredPkg = packagingTypes.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q) ||
      p.spec.toLowerCase().includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPkg.name.trim()) {
      addToast("Please provide packaging item name.", "warning");
      return;
    }

    const created = {
      id: `PKG-0${packagingTypes.length + 1}`,
      name: newPkg.name,
      spec: newPkg.spec || "Standard Factory Spec",
      supplier: newPkg.supplier || "Approved Direct Vendor",
      cost: newPkg.cost || "$0.050",
      status: "Active"
    };

    setPackagingTypes([...packagingTypes, created]);
    addToast(`Packaging spec "${created.name}" created!`, "success");
    setIsModalOpen(false);
    setNewPkg({ name: "", spec: "", supplier: "", cost: "$0.050" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPkg.name.trim()) {
      addToast("Please provide packaging item name.", "warning");
      return;
    }

    setPackagingTypes(packagingTypes.map((p) => (p.id === editingPkg.id ? editingPkg : p)));
    addToast(`Packaging spec ${editingPkg.id} updated successfully!`, "success");
    setEditingPkg(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Packaging Specifications Master
            </h1>
            <Badge variant="cyan">{packagingTypes.length} PACKAGING ITEMS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Add Packaging Spec
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
          title="Packaging Items"
          value={packagingTypes.length.toString()}
          unit="Active Items"
          trend={{ value: "PET, Cans, Closures & Trays", isPositive: true, text: "" }}
          icon={Package}
          colorVariant="emerald"
        />
        <StatCard
          title="Primary Vendors"
          value="4 Suppliers"
          unit="Tier-1"
          trend={{ value: "Direct OEM contracts active", isPositive: true, text: "" }}
          icon={Truck}
          colorVariant="cyan"
        />
        <StatCard
          title="Preform Unit Cost"
          value="$0.045"
          unit="Avg Cost"
          trend={{ value: "28mm PCO standard", isPositive: true, text: "" }}
          icon={DollarSign}
          colorVariant="amber"
        />
        <StatCard
          title="Quality Assurance"
          value="100%"
          unit="CoA Verified"
          trend={{ value: "Food-grade certified", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search packaging item, spec, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "680px" }}>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Packaging Description</th>
                <th>Technical Specification</th>
                <th>Primary Supplier</th>
                <th>Standard Unit Cost</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPkg.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{p.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{p.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{p.spec}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{p.supplier}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#059669" }}>{p.cost}</td>
                  <td>
                    <Badge variant="emerald">{p.status}</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setEditingPkg({ ...p })}
                      title="Edit Specification"
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

      {/* ADD PACKAGING MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Add Packaging Specification
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Packaging Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500ml Embossed Glass Bottle"
                  value={newPkg.name}
                  onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Technical Specification</label>
                <input
                  type="text"
                  placeholder="e.g. Crown finish 26mm, Flint Glass"
                  value={newPkg.spec}
                  onChange={(e) => setNewPkg({ ...newPkg, spec: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Primary Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Owens-Illinois"
                    value={newPkg.supplier}
                    onChange={(e) => setNewPkg({ ...newPkg, supplier: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Standard Unit Cost</label>
                  <input
                    type="text"
                    placeholder="e.g. $0.120"
                    value={newPkg.cost}
                    onChange={(e) => setNewPkg({ ...newPkg, cost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Specification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PACKAGING MODAL */}
      {editingPkg && (
        <div className="modal-backdrop" onClick={() => setEditingPkg(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#B27E33" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Packaging Spec — {editingPkg.id}
                </h2>
              </div>
              <button onClick={() => setEditingPkg(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Packaging Description *</label>
                <input
                  type="text"
                  required
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Technical Specification</label>
                <input
                  type="text"
                  value={editingPkg.spec}
                  onChange={(e) => setEditingPkg({ ...editingPkg, spec: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Primary Supplier</label>
                  <input
                    type="text"
                    value={editingPkg.supplier}
                    onChange={(e) => setEditingPkg({ ...editingPkg, supplier: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div>
                  <label className="form-label">Standard Unit Cost</label>
                  <input
                    type="text"
                    value={editingPkg.cost}
                    onChange={(e) => setEditingPkg({ ...editingPkg, cost: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingPkg(null)}>
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

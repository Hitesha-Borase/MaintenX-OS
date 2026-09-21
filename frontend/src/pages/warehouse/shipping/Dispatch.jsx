import React, { useState, useEffect, useCallback } from "react";
import { Send, FileText, Plus, RefreshCw, Edit2, Trash2, X, AlertTriangle, Truck, MapPin, Package } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function Dispatch() {
  const { addToast } = useApp();

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Dispatch Form State
  const initialNewDispatch = {
    customer: "",
    destination: "",
    quantity: "12 Pallets",
    carrier: "DHL Supply Chain",
    trailerNo: "TR-5510",
    bolNumber: "",
    status: "Staged"
  };
  const [newDispatch, setNewDispatch] = useState(initialNewDispatch);

  const fetchDispatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getDispatchSummary();
      const data = res?.data || res;
      if (Array.isArray(data?.dispatches)) {
        setDispatches(data.dispatches);
      } else if (Array.isArray(data)) {
        setDispatches(data);
      } else {
        setDispatches([]);
      }
    } catch (err) {
      console.warn("Could not load dispatch summary:", err.message);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  // Dispatch Cargo Handler -> Updates to "Dispatched" in PostgreSQL
  const handleDispatch = async (d) => {
    setSubmitting(true);
    try {
      await warehouseService.dispatchShipment({
        shipmentId: d.id || d.realId,
        id: d.realId || d.id,
        bolNumber: d.bolNumber || `BOL-${d.id}`,
        driver: "Ashley Kulcar",
        trailerNo: d.trailerNo || "TR-5510"
      });
      addToast(`Shipment ${d.id} dispatched! BoL issued to carrier.`, "success");
      await fetchDispatches();
    } catch (e) {
      console.error("dispatchShipment error:", e);
      addToast("Failed to dispatch shipment in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Create Staged Cargo -> Saves to PostgreSQL shipment_orders
  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const shipNum = `SO-${Math.floor(9000 + Math.random() * 900)}`;
    const payload = {
      shipmentNumber: shipNum,
      customer: newDispatch.customer || "Commercial Distribution Hub",
      destination: newDispatch.destination,
      quantity: newDispatch.quantity,
      carrier: newDispatch.carrier,
      trailerNo: newDispatch.trailerNo || `TR-${Math.floor(5000 + Math.random() * 4000)}`,
      bolNumber: newDispatch.bolNumber || `BOL-${shipNum}`,
      status: newDispatch.status || "Staged",
      finishedGoods: "Staged Finished Goods Consignment",
      orderNumber: `ORD-${Math.floor(88000 + Math.random() * 1000)}`
    };

    try {
      await warehouseService.createShipmentOrder(payload);
      addToast(`Cargo ${shipNum} staged for dispatch in database!`, "success");
      setIsCreateModalOpen(false);
      setNewDispatch(initialNewDispatch);
      await fetchDispatches();
    } catch (err) {
      console.error("Failed to create dispatch:", err);
      addToast("Failed to save staged cargo in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Staged Cargo -> Updates in PostgreSQL shipment_orders
  const handleUpdateDispatch = async (e) => {
    e.preventDefault();
    if (!editingDispatch) return;
    setSubmitting(true);

    try {
      await warehouseService.updateShipmentOrder(editingDispatch.realId || editingDispatch.id, {
        destination: editingDispatch.dest,
        quantity: editingDispatch.cargo,
        carrier: editingDispatch.carrier,
        trailerNo: editingDispatch.trailerNo,
        bolNumber: editingDispatch.bolNumber,
        status: editingDispatch.status
      });
      addToast(`Dispatch ${editingDispatch.id} updated in database.`, "success");
      setEditingDispatch(null);
      await fetchDispatches();
    } catch (err) {
      console.error("Failed to update dispatch:", err);
      addToast("Failed to update dispatch in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Cargo -> Permanently removes from PostgreSQL shipment_orders
  const handleDeleteDispatch = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      await warehouseService.deleteShipmentOrder(deleteTarget.realId || deleteTarget.id);
      addToast(`Dispatch ${deleteTarget.id} permanently deleted from database.`, "success");
      setDeleteTarget(null);
      await fetchDispatches();
    } catch (err) {
      console.error("Failed to delete dispatch:", err);
      addToast("Failed to delete dispatch from database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2d2825", margin: "0 0 4px 0" }}>
            Outbound Cargo Dispatch
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
            Stage, verify freight, and dispatch outbound carrier shipments directly connected to PostgreSQL.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={fetchDispatches}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "#f4f4f5",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#52525b",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing..." : "Refresh"}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#8C5B23",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <Plus size={15} /> + Stage Outbound Cargo
          </button>
        </div>
      </div>

      {/* Dispatches List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <RefreshCw className="animate-spin" size={20} color="#8C5B23" />
              <span>Loading staged cargo from database...</span>
            </div>
          </div>
        ) : dispatches.length === 0 ? (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e8e6e1", borderRadius: "16px", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(140, 91, 35, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8C5B23", margin: "0 auto 16px auto" }}>
              <Truck size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2d2825", margin: "0 0 6px 0" }}>
              No Outbound Cargo Staged for Dispatch
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
              The database has no shipments pending dispatch. Click below to stage a new outbound load.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#8C5B23",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Plus size={15} /> + Stage Outbound Cargo
            </button>
          </div>
        ) : (
          dispatches.map((d) => {
            const isStaged = d.status === "Staged" || d.status === "Scheduled" || d.status === "Loading Complete";
            return (
              <div 
                key={d.id} 
                style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  gap: "16px",
                  justifyContent: "space-between", 
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "20px 24px",
                  borderRadius: "16px",
                  border: "1px solid #e8e6e1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px", color: "#8C5B23" }}>
                      {d.id}
                    </span>
                    <span style={{ 
                      padding: "4px 10px", 
                      backgroundColor: isStaged ? "#fef3c7" : "#e8fbf0", 
                      color: isStaged ? "#b45309" : "#10b981", 
                      border: `1px solid ${isStaged ? "#fde68a" : "#a7e6c4"}`,
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "#2d2825", fontWeight: 600 }}>
                    Freight: <span style={{ color: "#8C5B23" }}>{d.cargo}</span> • Carrier: {d.carrier}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>Destination: {d.dest}</span>
                    {d.trailerNo && <span>• Trailer: {d.trailerNo}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => isStaged && handleDispatch(d)}
                    disabled={!isStaged || submitting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      backgroundColor: isStaged ? "#059669" : "#f1f5f9",
                      color: isStaged ? "#ffffff" : "#94a3b8",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isStaged ? "pointer" : "default",
                      transition: "all 0.2s"
                    }}
                    title="Dispatch Cargo"
                  >
                    <Send size={15} />
                    {isStaged ? "Dispatch Cargo" : "Dispatched"}
                  </button>

                  <button
                    onClick={() => setEditingDispatch({ ...d })}
                    style={{
                      padding: "7px 12px",
                      backgroundColor: "#f4f4f5",
                      border: "1px solid #e4e4e7",
                      borderRadius: "8px",
                      color: "#52525b",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                    title="Edit Dispatch Details"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => setDeleteTarget(d)}
                    style={{
                      padding: "7px 10px",
                      backgroundColor: "transparent",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      borderRadius: "8px",
                      color: "#DC2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                    title="Delete Dispatch from Database"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE STAGED CARGO MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} color="#8C5B23" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Stage Outbound Cargo for Dispatch
                </h2>
              </div>
              <button onClick={() => !submitting && setIsCreateModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Customer / Depot *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Target Regional Logistics Hub"
                  className="form-input"
                  value={newDispatch.customer}
                  onChange={(e) => setNewDispatch({ ...newDispatch, customer: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Freight Payload (Quantity) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12 Pallets"
                    className="form-input"
                    value={newDispatch.quantity}
                    onChange={(e) => setNewDispatch({ ...newDispatch, quantity: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Carrier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHL Supply Chain"
                    className="form-input"
                    value={newDispatch.carrier}
                    onChange={(e) => setNewDispatch({ ...newDispatch, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Destination Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicago Regional Depot, IL"
                  className="form-input"
                  value={newDispatch.destination}
                  onChange={(e) => setNewDispatch({ ...newDispatch, destination: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    placeholder="e.g. TR-5510"
                    className="form-input"
                    value={newDispatch.trailerNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Bill of Lading (BoL) #</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    className="form-input"
                    value={newDispatch.bolNumber}
                    onChange={(e) => setNewDispatch({ ...newDispatch, bolNumber: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: "8px 16px", backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 18px", backgroundColor: "#8C5B23", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : "Stage in Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingDispatch && (
        <div className="modal-backdrop" onClick={() => !submitting && setEditingDispatch(null)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Dispatch: {editingDispatch.id}
              </h2>
              <button onClick={() => !submitting && setEditingDispatch(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateDispatch} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Freight Payload (Quantity) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingDispatch.cargo || ""}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, cargo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Carrier *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingDispatch.carrier || ""}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Destination Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingDispatch.dest || ""}
                  onChange={(e) => setEditingDispatch({ ...editingDispatch, dest: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingDispatch.trailerNo || ""}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingDispatch.status || "Staged"}
                    onChange={(e) => setEditingDispatch({ ...editingDispatch, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Staged">Staged</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Loading Complete">Loading Complete</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setEditingDispatch(null)}
                  style={{ padding: "8px 16px", backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 18px", backgroundColor: "#8C5B23", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => !submitting && setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: "440px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626" }}>
                <AlertTriangle size={20} />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#2d2825", margin: 0 }}>
                  Delete Outbound Dispatch
                </h2>
              </div>
              <button onClick={() => !submitting && setDeleteTarget(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete dispatch <strong style={{ color: "#2d2825" }}>{deleteTarget.id}</strong> ({deleteTarget.dest}) from the database?
              </p>

              <div style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#DC2626" }}>
                This record will be permanently deleted from the PostgreSQL table <code>shipment_orders</code>.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  style={{ padding: "8px 16px", backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDispatch}
                  disabled={submitting}
                  style={{ padding: "8px 16px", backgroundColor: "#DC2626", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  {submitting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dispatch;

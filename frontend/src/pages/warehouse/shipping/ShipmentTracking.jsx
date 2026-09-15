import React, { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, Navigation, Edit2, Trash2, X, AlertTriangle, MapPin, Truck, Plus, CheckCircle2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import warehouseService from "../../../services/warehouseService";

export function ShipmentTracking() {
  const { addToast } = useApp();

  const [trackingList, setTrackingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const initialNewTracking = {
    customer: "",
    destination: "",
    carrier: "Titan Freight Lines",
    trailerNo: "TR-5510",
    eta: new Date().toISOString().substring(0, 10),
    status: "In Transit"
  };
  const [newTracking, setNewTracking] = useState(initialNewTracking);

  const fetchTracking = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getShipmentTracking();
      const data = res.data?.data || res.data;
      if (data?.trackingList && Array.isArray(data.trackingList)) {
        setTrackingList(data.trackingList);
      } else if (data?.activeShipments && Array.isArray(data.activeShipments)) {
        setTrackingList(data.activeShipments);
      } else if (Array.isArray(data)) {
        setTrackingList(data);
      } else {
        setTrackingList([]);
      }
    } catch (err) {
      console.warn("Could not load shipment tracking from API:", err.message);
      setTrackingList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Toggle In Transit <-> Delivered directly in PostgreSQL
  const handleToggleStatus = async (t) => {
    const nextStatus = t.status === "Delivered" ? "In Transit" : "Delivered";
    try {
      await warehouseService.toggleShipmentTracking(t.id || t.realId, nextStatus);
      if (nextStatus === "Delivered") {
        addToast(`Shipment ${t.id} marked as Delivered!`, "success");
      } else {
        addToast(`Shipment ${t.id} reverted to In Transit.`, "info");
      }
      await fetchTracking();
    } catch (e) {
      console.error("toggleShipmentTracking error:", e);
      addToast("Failed to update shipment tracking status in database", "error");
    }
  };

  // Add Tracked Shipment -> Saves to PostgreSQL
  const handleAddTracking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const shipNum = `TRK-${Math.floor(9000 + Math.random() * 900)}`;

    try {
      await warehouseService.createShipmentOrder({
        shipmentNumber: shipNum,
        trackingNumber: shipNum,
        customer: newTracking.customer || "Logistics Depot Partner",
        destination: newTracking.destination,
        carrier: newTracking.carrier,
        trailerNo: newTracking.trailerNo,
        status: newTracking.status,
        shipDate: newTracking.eta,
        quantity: "20 Pallets",
        orderNumber: `ORD-${Math.floor(88000 + Math.random() * 1000)}`
      });
      addToast(`Tracked shipment ${shipNum} registered in database!`, "success");
      setIsAddModalOpen(false);
      setNewTracking(initialNewTracking);
      await fetchTracking();
    } catch (err) {
      console.error("Failed to add tracked shipment:", err);
      addToast("Failed to register tracked shipment in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Tracking -> Updates in PostgreSQL
  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);

    try {
      await warehouseService.updateShipmentOrder(editingItem.realId || editingItem.id, {
        destination: editingItem.dest,
        carrier: editingItem.carrier,
        trailerNo: editingItem.trailerNo,
        status: editingItem.status,
        shipDate: editingItem.etaDate || new Date().toISOString().substring(0, 10)
      });
      addToast(`Shipment ${editingItem.id} updated in database.`, "success");
      setEditingItem(null);
      await fetchTracking();
    } catch (err) {
      console.error("Failed to update tracking:", err);
      addToast("Failed to update tracking in database", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Tracked Shipment -> Permanently removes from PostgreSQL
  const handleDeleteTracking = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      await warehouseService.deleteShipmentOrder(deleteTarget.realId || deleteTarget.id);
      addToast(`Shipment ${deleteTarget.id} removed from database.`, "success");
      setDeleteTarget(null);
      await fetchTracking();
    } catch (err) {
      console.error("Failed to delete shipment:", err);
      addToast("Failed to delete shipment from database", "error");
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
            Shipment Tracking
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
            Real-time GPS carrier milestone tracking and freight delivery status connected directly to PostgreSQL.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={fetchTracking}
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
            onClick={() => setIsAddModalOpen(true)}
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
            <Plus size={15} /> + Add Tracked Shipment
          </button>
        </div>
      </div>

      {/* Tracking List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <RefreshCw className="animate-spin" size={20} color="#8C5B23" />
              <span>Loading shipment tracking from database...</span>
            </div>
          </div>
        ) : trackingList.length === 0 ? (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e8e6e1", borderRadius: "16px", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(14, 165, 233, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284C7", margin: "0 auto 16px auto" }}>
              <Navigation size={28} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2d2825", margin: "0 0 6px 0" }}>
              No Active In-Transit Shipments
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
              There are currently no active in-transit or delivered shipments in the database.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
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
              <Plus size={15} /> + Add Tracked Shipment
            </button>
          </div>
        ) : (
          trackingList.map((t) => {
            const isDelivered = t.status === "Delivered" || t.status?.toLowerCase() === "delivered";
            return (
              <div 
                key={t.id} 
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "14px", color: "#8C5B23" }}>
                      {t.trackingNumber || t.id}
                    </span>
                    <span style={{ 
                      padding: "3px 8px", 
                      backgroundColor: isDelivered ? "#e8fbf0" : "#e0f2fe", 
                      color: isDelivered ? "#10b981" : "#0284C7", 
                      border: `1px solid ${isDelivered ? "#a7e6c4" : "#bae6fd"}`,
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#2d2825" }}>
                    <Clock size={16} color={isDelivered ? "#10b981" : "#0284C7"} />
                    <span>ETA / Delivery: <strong>{t.eta || "In Transit"}</strong></span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>Destination: {t.dest}</span>
                    {t.carrier && <span>• Carrier: {t.carrier}</span>}
                    {t.trailerNo && <span>• Trailer: {t.trailerNo}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button 
                    onClick={() => handleToggleStatus(t)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      backgroundColor: isDelivered ? "#f4f4f5" : "#e8fbf0",
                      color: isDelivered ? "#52525b" : "#10b981",
                      border: `1px solid ${isDelivered ? "#e4e4e7" : "#a7e6c4"}`,
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    title="Toggle Delivery Status"
                  >
                    <CheckCircle2 size={14} />
                    {isDelivered ? "Revert to In Transit" : "Mark as Delivered"}
                  </button>

                  <button
                    onClick={() => setEditingItem({ ...t, etaDate: t.eta?.substring(0, 10) || "" })}
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
                    title="Edit Shipment Tracking"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => setDeleteTarget(t)}
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
                    title="Delete Tracking from Database"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD TRACKING MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Navigation size={18} color="#0284C7" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Tracked In-Transit Shipment
                </h2>
              </div>
              <button onClick={() => !submitting && setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTracking} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Customer / Consignee *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Walmart Logistics - Houston"
                  className="form-input"
                  value={newTracking.customer}
                  onChange={(e) => setNewTracking({ ...newTracking, customer: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Destination Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Houston Distribution Hub, TX"
                  className="form-input"
                  value={newTracking.destination}
                  onChange={(e) => setNewTracking({ ...newTracking, destination: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Carrier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Titan Freight Lines"
                    className="form-input"
                    value={newTracking.carrier}
                    onChange={(e) => setNewTracking({ ...newTracking, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    placeholder="e.g. TR-5510"
                    className="form-input"
                    value={newTracking.trailerNo}
                    onChange={(e) => setNewTracking({ ...newTracking, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Estimated Delivery (ETA) *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={newTracking.eta}
                    onChange={(e) => setNewTracking({ ...newTracking, eta: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={newTracking.status}
                    onChange={(e) => setNewTracking({ ...newTracking, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "8px 16px", backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 18px", backgroundColor: "#8C5B23", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => !submitting && setEditingItem(null)}>
          <div className="modal-content" style={{ maxWidth: "540px", margin: "16px", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Edit Tracking: {editingItem.id}
              </h2>
              <button onClick={() => !submitting && setEditingItem(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTracking} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Destination Address *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingItem.dest || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, dest: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Carrier *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingItem.carrier || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, carrier: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Trailer #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.trailerNo || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, trailerNo: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={editingItem.status || "In Transit"}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
                  Delete Tracking Record
                </h2>
              </div>
              <button onClick={() => !submitting && setDeleteTarget(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to permanently delete tracking record <strong style={{ color: "#2d2825" }}>{deleteTarget.id}</strong> ({deleteTarget.dest}) from the database?
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
                  onClick={handleDeleteTracking}
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
export default ShipmentTracking;

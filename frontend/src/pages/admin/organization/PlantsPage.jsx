import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Layers,
  X,
  Gauge,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Clock,
  Calendar,
  Globe,
  Hash
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function PlantsPage() {
  const { setPlants: setContextPlants, lines = [], activePlantId, setActivePlantId } = useMasterData();
  const { addToast } = useApp();

<<<<<<< HEAD
  // Trigger live GET /api/v1/master-data/plants on mount
  React.useEffect(() => {
    masterDataService.getPlants().then((res) => {
      const data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data) && typeof setPlants === "function") {
        setPlants(data);
      }
    }).catch((err) => console.warn("Live plant fetch:", err.message));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [viewingPlant, setViewingPlant] = useState(null);
=======
  const [plants, setPlants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [viewingPlant, setViewingPlant] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlants = async () => {
    try {
      const res = await masterDataService.getPlants();
      const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setPlants(data);
      if (typeof setContextPlants === "function") {
        setContextPlants(data);
      }
    } catch (err) {
      console.warn("Failed to fetch plants:", err.message);
    }
  };

  React.useEffect(() => {
    fetchPlants();
  }, []);
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2

  const [newPlant, setNewPlant] = useState({
    code: "",
    name: "",
    city: "",
    state: "",
    country: "India",
    timezone: "Asia/Kolkata (IST)",
    dailyCapacity: "350,000 Units / Day",
    status: "Active"
  });

  const totalLines = useMemo(() => lines.length, [lines]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newPlant.name.trim() || !newPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

<<<<<<< HEAD
    const loc = `${newPlant.city || ""}${newPlant.state ? `, ${newPlant.state}` : ""}${newPlant.country ? `, ${newPlant.country}` : ""}`.replace(/^,\s*/, "");
    const created = addPlant({
      ...newPlant,
      location: loc || newPlant.city || "Primary Facility"
    });
    addToast(`Plant "${created.name}" registered in Enterprise Master!`, "success");
    setIsModalOpen(false);
    setNewPlant({
      code: "",
      name: "",
      city: "",
      state: "",
      country: "India",
      timezone: "Asia/Kolkata (IST)",
      dailyCapacity: "350,000 Units / Day",
      status: "Active"
    });
=======
    setIsSubmitting(true);
    try {
      await masterDataService.createPlant(newPlant);
      addToast(`Plant "${newPlant.name}" registered in database!`, "success");
      setIsModalOpen(false);
      setNewPlant({
        code: "",
        name: "",
        location: "Indore, Madhya Pradesh, India",
        timezone: "Asia/Kolkata (IST)",
        linesCount: 3,
        dailyCapacity: "280,000 Units / Day"
      });
      await fetchPlants();
    } catch (err) {
      addToast(`Failed to create plant: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlant.name.trim() || !editingPlant.code.trim()) {
      addToast("Please provide plant name and code.", "warning");
      return;
    }

<<<<<<< HEAD
    const loc = `${editingPlant.city || ""}${editingPlant.state ? `, ${editingPlant.state}` : ""}${editingPlant.country ? `, ${editingPlant.country}` : ""}`.replace(/^,\s*/, "");
    updatePlant(editingPlant.id || editingPlant.plantId, {
      ...editingPlant,
      location: loc || editingPlant.city || editingPlant.location || "Primary Facility"
    });
    addToast(`Plant "${editingPlant.name}" updated!`, "success");
    setEditingPlant(null);
=======
    setIsSubmitting(true);
    try {
      const targetId = editingPlant.id || editingPlant.plantId || editingPlant.code;
      await masterDataService.updatePlant(targetId, editingPlant);
      addToast(`Plant "${editingPlant.name}" updated in database!`, "success");
      setEditingPlant(null);
      await fetchPlants();
    } catch (err) {
      addToast(`Failed to update plant: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
  };

  const handleDelete = async (plantId, name) => {
    if (window.confirm(`Are you sure you want to delete Plant "${name}"? This will permanently delete it from the database.`)) {
      try {
        await masterDataService.deletePlant(plantId);
        addToast(`Plant "${name}" deleted from database.`, "success");
        if (editingPlant && (editingPlant.id === plantId || editingPlant.plantId === plantId)) {
          setEditingPlant(null);
        }
        if (viewingPlant && (viewingPlant.id === plantId || viewingPlant.plantId === plantId)) {
          setViewingPlant(null);
        }
        await fetchPlants();
      } catch (err) {
        addToast(`Failed to delete plant: ${err.message}`, "error");
      }
    }
  };

  const openEditFromView = (plant) => {
    setViewingPlant(null);
    setEditingPlant({
      ...plant,
      city: plant.city || (plant.location ? plant.location.split(",")[0]?.trim() : ""),
      state: plant.state || (plant.location ? plant.location.split(",")[1]?.trim() : ""),
      country: plant.country || (plant.location ? plant.location.split(",")[2]?.trim() : "India"),
      status: plant.status || (plant.isActive ? "Active" : "Inactive")
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Plant Facilities & Site Configuration
            </h1>
            <Badge variant="emerald">{plants.length} SITES ACTIVE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Provision Plant
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
          title="Active Plants"
          value={plants.length.toString()}
          unit="Facilities"
          icon={Building2}
          colorVariant="emerald"
        />
        <StatCard
          title="Operational Lines"
          value={totalLines.toString()}
          unit="Packaging Cells"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Total Rated Capacity"
          value="450k"
          unit="Units/Day"
          icon={Gauge}
          colorVariant="amber"
        />
        <StatCard
          title="Site Availability"
          value="99.8%"
          unit="Operational"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Code</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Facility Name</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Geographic Location</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Timezone</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Lines Configured</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {plants.length > 0 ? (
                plants.map((p) => {
                  const plantLines = lines.filter((l) => l.plantId === p.id).length;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
=======
              {plants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)", fontSize: "13px" }}>
                    No plant facilities found in database. Click "+ Provision Plant" to add one.
                  </td>
                </tr>
              ) : (
                plants.map((p) => {
                  const plantLines = lines.filter((l) => l.plantId === (p.id || p.plantId)).length;
                  return (
                    <tr key={p.id || p.plantId || p.code} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#8C5B23" }}>
                        {p.code || p.id}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{p.name}</div>
<<<<<<< HEAD
                        {p.id === activePlantId && <Badge variant="cyan" style={{ marginTop: "4px" }}>Active Current Plant</Badge>}
=======
                        {(p.id === activePlantId || p.code === activePlantId) && <Badge variant="cyan" style={{ marginTop: "4px" }}>Active Current Plant</Badge>}
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={12} color="#C89547" />
<<<<<<< HEAD
                          <span>{p.location || `${p.city || ""}${p.state ? `, ${p.state}` : ""}${p.country ? `, ${p.country}` : ""}` || "—"}</span>
=======
                          <span>{p.location}</span>
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {p.timezone || "Asia/Kolkata (IST)"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
<<<<<<< HEAD
                        <Badge variant="cyan">{plantLines} Active Lines</Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant={p.status === "Inactive" || p.isActive === false ? "amber" : "emerald"}>
                          {p.status || (p.isActive === false ? "Inactive" : "Active")}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {/* VIEW BUTTON */}
                          <button
                            onClick={() => setViewingPlant({ ...p })}
                            title="View Plant Details"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#8C5B23",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() =>
                              setEditingPlant({
                                ...p,
                                city: p.city || (p.location ? p.location.split(",")[0]?.trim() : ""),
                                state: p.state || (p.location ? p.location.split(",")[1]?.trim() : ""),
                                country: p.country || (p.location ? p.location.split(",")[2]?.trim() : "India"),
                                status: p.status || (p.isActive === false ? "Inactive" : "Active")
                              })
                            }
                            title="Edit Plant"
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
                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDelete(p.id || p.plantId, p.name)}
                            title="Delete Plant"
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: "var(--bg-card-subtle)",
                              color: "#EF4444",
                              border: "1px solid var(--border-subtle)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
=======
                        <Badge variant="cyan">{plantLines || 3} Active Lines</Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant="emerald">{p.status || "Operational"}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <button
                            onClick={() => setViewingPlant(p)}
                            title="View Plant Details"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#0284C7", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => setEditingPlant({ ...p })}
                            title="Edit Plant"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id || p.plantId || p.code, p.name)}
                            title="Delete Plant"
                            style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
<<<<<<< HEAD
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                      <Building2 size={40} strokeWidth={1.5} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        No Manufacturing Plants provisioned yet
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "420px" }}>
                        Click &quot;+ Provision Plant&quot; to set up your facility, timezone, and production lines.
                      </div>
                    </div>
                  </td>
                </tr>
=======
>>>>>>> 5af8411961ffaedde5d11b050f16c0266436a5f2
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VIEW PLANT DETAILS MODAL */}
      {viewingPlant && (
        <div className="modal-backdrop" onClick={() => setViewingPlant(null)}>
          <div className="modal-content" style={{ maxWidth: "600px", margin: "16px", backgroundColor: "#FFFFFF", borderRadius: "14px", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Plant Facility Details — {viewingPlant.code || viewingPlant.name}
                </h2>
              </div>
              <button onClick={() => setViewingPlant(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Summary Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Facility Name</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>{viewingPlant.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Code: <strong>{viewingPlant.code || viewingPlant.id}</strong></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Badge variant={viewingPlant.status === "Inactive" || viewingPlant.isActive === false ? "amber" : "emerald"}>
                    {viewingPlant.status || (viewingPlant.isActive === false ? "Inactive" : "Active")}
                  </Badge>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {lines.filter((l) => l.plantId === viewingPlant.id).length} Active Lines
                  </div>
                </div>
              </div>

              {/* Detailed DB Fields Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={11} color="#C89547" /> City (DB)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.city || viewingPlant.location?.split(",")[0]?.trim() || "—"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={11} color="#C89547" /> State / Province (DB)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.state || viewingPlant.location?.split(",")[1]?.trim() || "—"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Globe size={11} color="#C89547" /> Country (DB)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.country || viewingPlant.location?.split(",")[2]?.trim() || "India"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} color="#C89547" /> Timezone (DB)
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.timezone || "Asia/Kolkata (IST)"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Gauge size={11} color="#C89547" /> Daily Capacity
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.dailyCapacity || viewingPlant.capacity || "350,000 Units / Day"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={11} color="#C89547" /> Full Geographic Location
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px", wordBreak: "break-word" }}>
                    {viewingPlant.location || `${viewingPlant.city || ""}, ${viewingPlant.state || ""}, ${viewingPlant.country || ""}`}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={11} color="#C89547" /> Created At (DB)
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {viewingPlant.createdAt ? new Date(viewingPlant.createdAt).toLocaleString("en-IN") : "System Initialized"}
                  </div>
                </div>

                <div style={{ padding: "10px 12px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} color="#C89547" /> Last Updated (DB)
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {viewingPlant.updatedAt ? new Date(viewingPlant.updatedAt).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
              </div>

              {/* Database ID Footer */}
              <div style={{ padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Hash size={12} />
                <span>DB Record ID:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{viewingPlant.id}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                <Button variant="secondary" onClick={() => setViewingPlant(null)} style={{ fontSize: "12px" }}>
                  Close
                </Button>
                <Button variant="primary" icon={Edit2} onClick={() => openEditFromView(viewingPlant)} style={{ fontSize: "12px" }}>
                  Edit Plant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PLANT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Provision Manufacturing Plant
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLT-01"
                    value={newPlant.code}
                    onChange={(e) => setNewPlant({ ...newPlant, code: e.target.value.toUpperCase() })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Plant Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune Beverage Hub"
                    value={newPlant.name}
                    onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              {/* DB Geographic Fields: City, State, Country */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={newPlant.city}
                    onChange={(e) => setNewPlant({ ...newPlant, city: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">State / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={newPlant.state}
                    onChange={(e) => setNewPlant({ ...newPlant, state: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={newPlant.country}
                    onChange={(e) => setNewPlant({ ...newPlant, country: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    value={newPlant.timezone}
                    onChange={(e) => setNewPlant({ ...newPlant, timezone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Daily Capacity</label>
                  <input
                    type="text"
                    value={newPlant.dailyCapacity}
                    onChange={(e) => setNewPlant({ ...newPlant, dailyCapacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={newPlant.status}
                    onChange={(e) => setNewPlant({ ...newPlant, status: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Provision Plant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLANT MODAL */}
      {editingPlant && (
        <div className="modal-backdrop" onClick={() => setEditingPlant(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={16} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Plant — {editingPlant.code || editingPlant.id}
                </h2>
              </div>
              <button onClick={() => setEditingPlant(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Plant Code</label>
                  <input
                    type="text"
                    disabled
                    value={editingPlant.code || editingPlant.id}
                    className="form-input"
                    style={{ backgroundColor: "var(--bg-card-subtle)", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label className="form-label">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPlant.name}
                    onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              {/* DB Geographic Fields: City, State, Country */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    required
                    value={editingPlant.city || ""}
                    onChange={(e) => setEditingPlant({ ...editingPlant, city: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">State / Province</label>
                  <input
                    type="text"
                    value={editingPlant.state || ""}
                    onChange={(e) => setEditingPlant({ ...editingPlant, state: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    value={editingPlant.country || "India"}
                    onChange={(e) => setEditingPlant({ ...editingPlant, country: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Timezone</label>
                  <input
                    type="text"
                    value={editingPlant.timezone || "Asia/Kolkata (IST)"}
                    onChange={(e) => setEditingPlant({ ...editingPlant, timezone: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Daily Capacity</label>
                  <input
                    type="text"
                    value={editingPlant.dailyCapacity || editingPlant.capacity || "350,000 Units / Day"}
                    onChange={(e) => setEditingPlant({ ...editingPlant, dailyCapacity: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingPlant.status || (editingPlant.isActive === false ? "Inactive" : "Active")}
                    onChange={(e) => setEditingPlant({ ...editingPlant, status: e.target.value, isActive: e.target.value === "Active" })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingPlant(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Update Plant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* VIEW PLANT MODAL */}
      {viewingPlant && (
        <div className="modal-backdrop" onClick={() => setViewingPlant(null)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Plant Facility Details
                </h2>
              </div>
              <button onClick={() => setViewingPlant(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Plant Code</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{viewingPlant.code || viewingPlant.id}</div>
                </div>
                <Badge variant="emerald">{viewingPlant.status || "Operational"}</Badge>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Facility Name</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingPlant.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Timezone</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingPlant.timezone || "Asia/Kolkata (IST)"}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Geographic Location</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin size={14} color="#C89547" />
                  <span>{viewingPlant.location || "Indore, Madhya Pradesh, India"}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Configured Lines</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {lines.filter((l) => l.plantId === viewingPlant.id).length || viewingPlant.linesCount || 3} Active Lines
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Daily Capacity</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {viewingPlant.dailyCapacity || "280,000 Units / Day"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingPlant(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const toEdit = { ...viewingPlant };
                    setViewingPlant(null);
                    setEditingPlant(toEdit);
                  }}
                >
                  Edit Plant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

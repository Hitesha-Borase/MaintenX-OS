import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  X,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/common/StatCard";
import { useQuality } from "../../context/QualityContext";
import { useApp } from "../../context/AppContext";

export function HoldsPage() {
  const { holds, deviations, updateDeviationStatus } = useQuality();
  const { addToast } = useApp();

  const [holdList, setHoldList] = useState([
    { id: "HLD-2026-081", lotNumber: "LOT-CIT-0828", product: "Sparkling Citrus Soda 500ml", units: 2400, reason: "Cap torque reading lower than 12 in-lbs limit", date: "2026-08-30", status: "Under Quarantine" },
    { id: "HLD-2026-082", lotNumber: "LOT-TON-0829", product: "Tonic Water Natural 1L", units: 1200, reason: "Minor fill volume variance ±8ml", date: "2026-08-31", status: "Under Quarantine" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHold, setNewHold] = useState({
    lotNumber: "",
    product: "Sparkling Citrus Soda 500ml",
    units: 1000,
    reason: ""
  });

  const handleReleaseLot = (id) => {
    setHoldList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: "Released by QA" } : h))
    );
    addToast(`Lot hold ${id} released for shipment!`, "success");
  };

  const handleScrapLot = (id) => {
    setHoldList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: "Scrapped" } : h))
    );
    addToast(`Lot hold ${id} disposition set to Scrap.`, "warning");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newHold.lotNumber || !newHold.reason) {
      addToast("Please provide lot number and hold reason", "warning");
      return;
    }
    const created = {
      id: `HLD-2026-08${holdList.length + 3}`,
      ...newHold,
      units: Number(newHold.units),
      date: new Date().toISOString().substring(0, 10),
      status: "Under Quarantine"
    };
    setHoldList([...holdList, created]);
    addToast(`Quality Hold ${created.id} issued! Lot placed in Quarantine.`, "success");
    setIsModalOpen(false);
    setNewHold({ lotNumber: "", product: "Sparkling Citrus Soda 500ml", units: 1000, reason: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Quality Holds & Non-Conformance Quarantine
            </h1>
            <Badge variant="rose">Quarantine Gate</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Electronic batch hold management, non-conformance quarantine tracking, root-cause investigations, and QA disposition release.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Place Lot on Quality Hold
          </Button>
        </div>
      </div>

      {/* Holds Table */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
            Active Quarantine Inventory & Non-Conformance Holds
          </h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hold ID</th>
                <th>Lot Number</th>
                <th>Product SKU</th>
                <th>Quarantined Units</th>
                <th>Hold Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdList.map((h) => {
                const isQuarantine = h.status === "Under Quarantine";

                return (
                  <tr key={h.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{h.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{h.lotNumber}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Date: {h.date}</div>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-primary)", fontSize: "12px" }}>{h.product}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {h.units.toLocaleString()} units
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#F59E0B", maxWidth: "260px" }}>
                      {h.reason}
                    </td>
                    <td>
                      <Badge variant={isQuarantine ? "rose" : h.status.includes("Released") ? "emerald" : "amber"}>
                        {h.status}
                      </Badge>
                    </td>
                    <td>
                      {isQuarantine ? (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleReleaseLot(h.id)}
                          >
                            Release
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleScrapLot(h.id)}
                          >
                            Scrap
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700 }}>● Disposition Complete</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Place Lot on Quality Quarantine
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Lot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-CIT-0831"
                    value={newHold.lotNumber}
                    onChange={(e) => setNewHold({ ...newHold, lotNumber: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Quantity to Quarantine *</label>
                  <input
                    type="number"
                    required
                    value={newHold.units}
                    onChange={(e) => setNewHold({ ...newHold, units: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Product SKU</label>
                <select
                  className="form-select"
                  value={newHold.product}
                  onChange={(e) => setNewHold({ ...newHold, product: e.target.value })}
                >
                  <option value="Sparkling Citrus Soda 500ml">Sparkling Citrus Soda 500ml</option>
                  <option value="Tonic Water Natural 1L">Tonic Water Natural 1L</option>
                  <option value="Organic Ginger Beer 330ml">Organic Ginger Beer 330ml Can</option>
                </select>
              </div>

              <div>
                <label className="form-label">Non-Conformance / Hold Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe out-of-spec test result or packaging defect..."
                  value={newHold.reason}
                  onChange={(e) => setNewHold({ ...newHold, reason: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Quarantine Lot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

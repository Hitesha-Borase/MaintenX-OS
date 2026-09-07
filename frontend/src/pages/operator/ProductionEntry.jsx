import React, { useState } from "react";
import {
  Factory,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  AlertTriangle,
  Clock,
  User,
  Layers,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { useProduction } from "../../context/ProductionContext";
import { useApp } from "../../context/AppContext";

export function ProductionEntry() {
  const { productionOrders = [], setProductionOrders } = useProduction();
  const { addToast } = useApp();

  const activeOrder = productionOrders.find((o) => o.status === "Running") || productionOrders[0] || {
    id: "PO-2026-904",
    orderNumber: "ORD-904-ASEPTIC-JUICE",
    productName: "Organic Cold-Pressed Orange Juice 500ml",
    line: "Line 1 (Aseptic Bottling)",
    targetQuantity: 24000,
    producedQuantity: 18450,
    scrapQuantity: 210,
    reworkQuantity: 65,
    unit: "Bottles"
  };

  const [producedAdd, setProducedAdd] = useState(500);
  const [scrapAdd, setScrapAdd] = useState(10);
  const [reworkAdd, setReworkAdd] = useState(5);
  const [lastLoggedMessage, setLastLoggedMessage] = useState(null);

  // Shift Log History Ledger
  const [recentLogs, setRecentLogs] = useState([
    {
      id: "LOG-104",
      time: "11:00 AM",
      operator: "Alexander Vance",
      goodUnits: 500,
      scrapUnits: 10,
      runningTotal: 18450,
      notes: "Pallet #37 completed and stretch-wrapped"
    },
    {
      id: "LOG-103",
      time: "10:30 AM",
      operator: "Alexander Vance",
      goodUnits: 500,
      scrapUnits: 5,
      runningTotal: 17950,
      notes: "Routine hourly run log"
    }
  ]);

  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [defectCode, setDefectCode] = useState("Cap Seal Deformation / Dent");
  const [scrapNotes, setScrapNotes] = useState("Found during capper exit inspection");

  const targetQty = Number(activeOrder.targetQuantity) || 24000;
  const currentProduced = Number(activeOrder.producedQuantity) || 0;
  const currentScrap = Number(activeOrder.scrapQuantity) || 0;
  const currentRework = Number(activeOrder.reworkQuantity) || 0;
  const pctComplete = Math.min(100, Math.round((currentProduced / targetQty) * 100));

  const handleSubmit = (e) => {
    e.preventDefault();

    const addGood = Number(producedAdd) || 0;
    const addScrap = Number(scrapAdd) || 0;
    const addRework = Number(reworkAdd) || 0;
    const newTotal = currentProduced + addGood;

    setProductionOrders((prev) =>
      prev.map((o) => {
        if (o.id === activeOrder.id) {
          return {
            ...o,
            producedQuantity: newTotal,
            scrapQuantity: (Number(o.scrapQuantity) || 0) + addScrap,
            reworkQuantity: (Number(o.reworkQuantity) || 0) + addRework
          };
        }
        return o;
      })
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newLogEntry = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      time: timeStr,
      operator: "Alexander Vance (Line Operator)",
      goodUnits: addGood,
      scrapUnits: addScrap,
      runningTotal: newTotal,
      notes: `Logged +${addGood} good units, +${addScrap} scrap`
    };

    setRecentLogs([newLogEntry, ...recentLogs]);
    setLastLoggedMessage(`+${addGood.toLocaleString()} Bottles Successfully Added! Total is now ${newTotal.toLocaleString()} / ${targetQty.toLocaleString()}`);

    addToast(`Successfully logged +${addGood} bottles produced! Current Total: ${newTotal.toLocaleString()}`, "success");
  };

  const handleLogScrapSubmit = (e) => {
    e.preventDefault();
    const addScrap = Number(scrapAdd) || 0;

    setProductionOrders((prev) =>
      prev.map((o) =>
        o.id === activeOrder.id
          ? { ...o, scrapQuantity: (Number(o.scrapQuantity) || 0) + addScrap }
          : o
      )
    );

    addToast(`Scrap reject of +${addScrap} units logged under defect category: "${defectCode}". Sent to Quality & Costing.`, "danger");
    setIsScrapModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
            Production HMI Entry & Output Logging
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
            Operator touch panel to record batch production cycles, pallet completions, and scrap rejects.
          </p>
        </div>

        <Button variant="danger" icon={AlertTriangle} onClick={() => setIsScrapModalOpen(true)}>
          Log Scrap Defect Reason
        </Button>
      </div>

      {/* ACTIVE RUN LIVE TOTALS BANNER */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
                ACTIVE ORDER ON LINE 1
              </span>
              <Badge variant="emerald">RUNNING</Badge>
            </div>
            <div style={{ fontWeight: 900, color: "var(--text-primary)", fontSize: "18px", margin: "4px 0" }}>
              {activeOrder.orderNumber} — {activeOrder.productName}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Running Total Output
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#059669", fontFamily: "var(--font-mono)" }}>
              {currentProduced.toLocaleString()}{" "}
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>/ {targetQty.toLocaleString()} Units</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>
              Progress: <strong style={{ color: "var(--text-primary)" }}>{pctComplete}%</strong> Completed
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              Remaining: <strong style={{ color: "#D97706" }}>{Math.max(0, targetQty - currentProduced).toLocaleString()} {activeOrder.unit || "Bottles"}</strong>
            </span>
          </div>
          <div style={{ width: "100%", height: "10px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", overflow: "hidden" }}>
            <div
              style={{
                width: `${pctComplete}%`,
                height: "100%",
                background: pctComplete >= 100 ? "#059669" : "linear-gradient(90deg, #E2B670 0%, #059669 100%)",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>

        {/* Last logged confirmation alert */}
        {lastLoggedMessage && (
          <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid #10B981", display: "flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "13px", fontWeight: 700 }}>
            <CheckCircle2 size={16} />
            {lastLoggedMessage}
          </div>
        )}
      </Card>

      {/* STEPPER INPUTS FORM */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {/* Produced Quantity Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "4px solid #10B981",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Good Output</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>+Units to add to total</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                +Add Qty
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: "32px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setProducedAdd((p) => Math.max(0, p - 100))}
                style={stepperBtnStyle}
                title="-100"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={producedAdd}
                onChange={(e) => setProducedAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#059669",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 900,
                  outline: "none",
                  width: "80px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setProducedAdd((p) => p + 100)}
                style={stepperBtnStyle}
                title="+100"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick-Preset Chips */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              {[100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setProducedAdd(val)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: producedAdd === val ? "#10B981" : "var(--bg-card-subtle)",
                    color: producedAdd === val ? "#FFFFFF" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </Card>

          {/* Scrap Count Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "4px solid #EF4444",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
                  <AlertOctagon size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Scrap Rejects</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total so far: {currentScrap}</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
                Defects
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: "32px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setScrapAdd((p) => Math.max(0, p - 5))}
                style={stepperBtnStyle}
                title="-5"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={scrapAdd}
                onChange={(e) => setScrapAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#DC2626",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 900,
                  outline: "none",
                  width: "80px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setScrapAdd((p) => p + 5)}
                style={stepperBtnStyle}
                title="+5"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick-Preset Chips */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              {[0, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setScrapAdd(val)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: scrapAdd === val ? "#EF4444" : "var(--bg-card-subtle)",
                    color: scrapAdd === val ? "#FFFFFF" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </Card>

          {/* Rework Count Card */}
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              padding: "20px",
              borderTop: "4px solid #C89547",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 2px 8px rgba(70, 45, 15, 0.04)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B27E33" }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Add Rework</h4>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total so far: {currentRework}</span>
                </div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#8C5B23", backgroundColor: "rgba(200, 149, 71, 0.15)", padding: "3px 9px", borderRadius: "12px", border: "1px solid rgba(200, 149, 71, 0.3)" }}>
                Re-process
              </span>
            </div>

            {/* Stepper Input */}
            <div style={{ display: "flex", margin: "0 auto", width: "fit-content", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: "32px", border: "1px solid #E8DDCF" }}>
              <button
                type="button"
                onClick={() => setReworkAdd((p) => Math.max(0, p - 5))}
                style={stepperBtnStyle}
                title="-5"
              >
                <Minus size={16} />
              </button>

              <input
                type="number"
                value={reworkAdd}
                onChange={(e) => setReworkAdd(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  textAlign: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#B27E33",
                  fontFamily: "var(--font-mono)",
                  fontSize: "22px",
                  fontWeight: 900,
                  outline: "none",
                  width: "80px",
                  padding: "0"
                }}
                required
              />

              <button
                type="button"
                onClick={() => setReworkAdd((p) => p + 5)}
                style={stepperBtnStyle}
                title="+5"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick-Preset Chips */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
              {[0, 5, 10, 20].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setReworkAdd(val)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: reworkAdd === val ? "#C89547" : "var(--bg-card-subtle)",
                    color: reworkAdd === val ? "#FFFFFF" : "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="submit" variant="primary" icon={Send} style={{ padding: "12px 36px", fontSize: "14px", fontWeight: 800 }}>
            Submit Production Log (+{producedAdd} Bottles)
          </Button>
        </div>
      </form>

      {/* RECENT SHIFT PRODUCTION LOG HISTORY LEDGER */}
      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} color="#B27E33" />
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Recent Shift Production Logs (Shift A)
            </h3>
          </div>
          <Badge variant="cyan">{recentLogs.length} Records Logged</Badge>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Time</th>
                <th>Operator</th>
                <th>+Good Output</th>
                <th>+Scrap Defects</th>
                <th>Running Total</th>
                <th>Notes / Action</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {log.id}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{log.time}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{log.operator}</div>
                  </td>
                  <td>
                    <span style={{ color: "#059669", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                      +{log.goodUnits.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: log.scrapUnits > 0 ? "#DC2626" : "var(--text-muted)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      +{log.scrapUnits}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                      {log.runningTotal.toLocaleString()} Units
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{log.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Scrap Defect Reason Modal */}
      <Modal
        isOpen={isScrapModalOpen}
        onClose={() => setIsScrapModalOpen(false)}
        title="Categorize Scrap Reject Reason"
        subtitle="Specify Defect Code & Material Impact"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScrapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Send} onClick={handleLogScrapSubmit}>
              Confirm Defect Log
            </Button>
          </>
        }
      >
        <form onSubmit={handleLogScrapSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Defect Category / Reason Code
            </label>
            <select
              value={defectCode}
              onChange={(e) => setDefectCode(e.target.value)}
              className="input-field"
            >
              <option value="Cap Seal Deformation / Dent">Cap Seal Deformation / Dent</option>
              <option value="Label Misalignment / Tear">Label Misalignment / Tear</option>
              <option value="Volume Underfill / Overfill">Volume Underfill / Overfill</option>
              <option value="Bottle Neck Contamination">Bottle Neck Contamination</option>
              <option value="Date Code Barcode Smudge">Date Code Barcode Smudge</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Scrap Reject Quantity
            </label>
            <input
              type="number"
              value={scrapAdd}
              onChange={(e) => setScrapAdd(Number(e.target.value))}
              className="input-field"
              min={1}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Operator Notes
            </label>
            <input
              type="text"
              value={scrapNotes}
              onChange={(e) => setScrapNotes(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

const stepperBtnStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2D7C7",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(70, 45, 15, 0.05)",
  transition: "all 0.2s ease",
  flexShrink: 0
};

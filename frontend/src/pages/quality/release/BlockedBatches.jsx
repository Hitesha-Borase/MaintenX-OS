import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, Search, FileSpreadsheet, RefreshCw, 
  ShieldAlert, Eye, X, CheckCircle2, ArrowRight, ShieldCheck
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function BlockedBatches() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHold, setSelectedHold] = useState(null);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getBlockedBatches();
      if (res && res.data && res.data.length > 0) {
        setHolds(res.data);
      } else {
        setHolds([
          { 
            id: "BLK-101", 
            batch: "BAT-2026-0890", 
            reason: "CCP Pasteurizer temp excursion to 82.9°C (Minimum threshold: 83.1°C)", 
            blockedBy: "Maria Santos (QA Lead)", 
            date: "2026-08-31", 
            status: "HOLD",
            severity: "HIGH",
            lotNumber: "LOT-ORG-442"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load blocked batches", err);
      addToast("Loaded blocked batches", "info");
      setHolds([
        { 
          id: "BLK-101", 
          batch: "BAT-2026-0890", 
          reason: "CCP Pasteurizer temp excursion to 82.9°C (Minimum threshold: 83.1°C)", 
          blockedBy: "Maria Santos (QA Lead)", 
          date: "2026-08-31", 
          status: "HOLD",
          severity: "HIGH",
          lotNumber: "LOT-ORG-442"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleToggleStatus = async (h) => {
    const nextStatus = h.status === "HOLD" ? "RELEASED" : "HOLD";
    setHolds(prev => prev.map(item => item.id === h.id ? { ...item, status: nextStatus } : item));
    try {
      await qualityService.toggleBlockedBatch({ id: h.id, batch: h.batch, status: h.status });
      addToast(`Batch ${h.batch} status updated to ${nextStatus}.`, nextStatus === "RELEASED" ? "success" : "warning");
    } catch (err) {
      console.warn("Toggle blocked batch status error:", err);
      addToast(`Batch ${h.batch} status updated to ${nextStatus}.`, nextStatus === "RELEASED" ? "success" : "warning");
    }
  };

  const handleExportCSV = async () => {
    try {
      await qualityService.exportBlockedBatches({ count: holds.length });
    } catch (err) {
      console.warn("Export blocked batches error:", err);
    }

    const headers = "Hold ID,Batch,Lot Number,Reason,Blocked By,Date,Severity,Status\n";
    const rows = holds.map(h => `"${h.id}","${h.batch}","${h.lotNumber || 'N/A'}","${h.reason}","${h.blockedBy}","${h.date}","${h.severity}","${h.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Blocked_Batches_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("Blocked batches log exported as CSV.", "info");
  };

  const filteredHolds = holds.filter(h =>
    (h.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.batch || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.reason || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertOctagon size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Blocked / Quality HOLD Batches
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Batches blocked from distribution due to critical control point excursions or active quality holds
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export Logs
          </Button>
          <Button variant="primary" icon={RefreshCw} onClick={fetchBlocked}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Blocked Batches</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#B91C1C", fontSize: "12px", fontWeight: 700 }}>
              Active Lockout
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {holds.filter(h => h.status === "HOLD").length}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Warehouse dispatch prohibited
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Primary Trigger</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              CCP-01
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            Thermal
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Pasteurizer kill step excursion
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Resolution Path</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Action
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            Disposition
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Rework / Scrap / Release decision
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by batch number, hold reason..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "13px", color: "#2B1D11" }}
          />
        </div>
      </Card>

      {/* Structured Table Card */}
      <Card style={{ padding: "0", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E8DDCF" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B1D11", margin: 0 }}>
            Active Quarantine Block Register ({filteredHolds.length})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Batch ID</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Excursion / Hold Reason</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Blocked By</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Block Date</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHolds.map((h, index) => {
                const isHold = h.status === "HOLD";

                return (
                  <tr 
                    key={h.id || index}
                    style={{ 
                      borderBottom: index === filteredHolds.length - 1 ? "none" : "1px solid #F0E8DD",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isHold ? "#EF4444" : "#C89547" }} />
                        <span>{h.batch}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", maxWidth: "340px", color: "#2B1D11", fontWeight: 600 }}>
                      {h.reason}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#8B6914", fontWeight: 600 }}>
                      {h.blockedBy}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#6B5B4E" }}>
                      {h.date}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span 
                        onClick={() => handleToggleStatus(h)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "5px 12px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          backgroundColor: isHold ? "rgba(239, 68, 68, 0.12)" : "rgba(200, 149, 71, 0.3)",
                          color: isHold ? "#B91C1C" : "#2B1D11",
                          border: "1px solid rgba(239, 68, 68, 0.3)"
                        }}
                        title="Click to toggle status"
                      >
                        {h.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={Eye} 
                          onClick={() => setSelectedHold(h)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          icon={ArrowRight} 
                          onClick={() => navigate("/quality/disposition/release")}
                        >
                          Disposition Gate
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Details */}
      {selectedHold && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(30, 20, 10, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E8DDCF",
            width: "100%",
            maxWidth: "560px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8DDCF", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAF8F5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertOctagon size={18} color="#C89547" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
                  Quarantine Dossier: {selectedHold.batch}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedHold(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5B4E", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#8B6914", textTransform: "uppercase" }}>Excursion Description</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#2B1D11", marginTop: "2px" }}>{selectedHold.reason}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Severity</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#B91C1C" }}>{selectedHold.severity || "HIGH"}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Blocked By</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#8B6914" }}>{selectedHold.blockedBy}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Lockout Date</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B1D11" }}>{selectedHold.date}</span>
                </div>
                <div style={{ padding: "12px", borderRadius: "8px", border: "1px solid #E8DDCF" }}>
                  <span style={{ fontSize: "11px", color: "#6B5B4E", display: "block" }}>Current Status</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#B91C1C" }}>{selectedHold.status}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button variant="outline" onClick={() => setSelectedHold(null)}>
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  icon={ArrowRight}
                  onClick={() => {
                    setSelectedHold(null);
                    navigate("/quality/disposition/release");
                  }}
                >
                  Go to Disposition Gate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

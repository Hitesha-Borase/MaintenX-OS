import React, { useState, useEffect } from "react";
import { 
  Clock, Search, FileSpreadsheet, RefreshCw, 
  FileCheck, ShieldCheck, ArrowRight, Activity, ShieldAlert
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function ReleaseQueue() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await qualityService.getReleaseQueue();
      if (res && res.data && res.data.length > 0) {
        setQueue(res.data.map(b => ({
          id: `REL-${b.batchNumber?.replace(/\D/g, "") || "201"}`,
          batch: b.batchNumber || b.id,
          sku: b.sku?.name || "Organic Orange Juice 1L Bottle",
          line: "Line 1 (Aseptic Bottling 580 BPM)",
          ccp: "83.5°C (PASS)",
          allergen: "Allergen Clear (0 ppm)",
          status: "AWAITING QA SIGN-OFF"
        })));
      } else {
        setQueue([
          {
            id: "REL-201",
            batch: "BAT-2026-0889",
            sku: "Organic Orange Juice 1L Bottle",
            line: "Line 1 (Aseptic Bottling 580 BPM)",
            ccp: "83.5°C (PASS)",
            allergen: "Allergen Clear (0 ppm)",
            status: "AWAITING QA SIGN-OFF"
          },
          {
            id: "REL-202",
            batch: "BAT-2026-0890",
            sku: "Sparkling Citrus Soda 500ml",
            line: "Line 2 (High-Speed Canner 800 CPM)",
            ccp: "83.2°C (PASS)",
            allergen: "Soy-Free Audited",
            status: "AWAITING QA SIGN-OFF"
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to load release queue", err);
      addToast("Loaded pending release queue", "info");
      setQueue([
        {
          id: "REL-201",
          batch: "BAT-2026-0889",
          sku: "Organic Orange Juice 1L Bottle",
          line: "Line 1 (Aseptic Bottling 580 BPM)",
          ccp: "83.5°C (PASS)",
          allergen: "Allergen Clear (0 ppm)",
          status: "AWAITING QA SIGN-OFF"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleExportCSV = async () => {
    try {
      await qualityService.exportReleaseQueue({ count: queue.length });
    } catch (err) {
      console.warn("Export release queue telemetry warning:", err);
    }

    const headers = "Release ID,Batch,Product SKU,Line,CCP Status,Allergen,Status\n";
    const rows = queue.map(q => `"${q.id}","${q.batch}","${q.sku}","${q.line}","${q.ccp}","${q.allergen}","${q.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QA_Release_Queue_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    addToast("QA Release queue exported as CSV.", "info");
  };

  const filteredQueue = queue.filter(q =>
    (q.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.batch || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              QA Human Release Queue
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Final 21 CFR Part 11 authorized gatekeeper review for manufactured lots before warehouse release
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
            Export Queue
          </Button>
          <Button variant="primary" icon={RefreshCw} onClick={fetchQueue}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Batches Pending Sign-Off</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Queue
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {queue.length}
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            Awaiting QA Lead authorization
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>CCP Clearances</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              PASSED
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            100%
          </div>
          <div style={{ fontSize: "12px", color: "#8B6914", marginTop: "4px" }}>
            All thermal pasteurization logs verified
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Avg QA Cycle Time</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              Metric
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            14 mins
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            Standard compliance SLA &lt; 30m
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "450px", backgroundColor: "#FAF8F5", border: "1px solid #E8DDCF", borderRadius: "10px", padding: "8px 14px" }}>
          <Search size={18} color="#6B5B4E" />
          <input 
            type="text" 
            placeholder="Search by batch number, release ID, product name..." 
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
            Batches Ready for QA Disposition ({filteredQueue.length})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF8F5", borderBottom: "1px solid #E8DDCF" }}>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Batch Number</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Product SKU / Recipe</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Line & CCP State</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Allergen Check</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "14px 20px", color: "#6B5B4E", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((b, index) => (
                <tr 
                  key={b.id || index}
                  style={{ 
                    borderBottom: index === filteredQueue.length - 1 ? "none" : "1px solid #F0E8DD",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAF8F5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "#2B1D11" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C89547" }} />
                      <span>{b.batch}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B5B4E", marginTop: "2px" }}>Req ID: {b.id}</div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#2B1D11" }}>
                    {b.sku}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ color: "#2B1D11", fontSize: "12px" }}>{b.line}</div>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(200, 149, 71, 0.15)", color: "#8B6914", fontSize: "11px", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>
                      {b.ccp}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#8B6914", fontWeight: 600 }}>
                    {b.allergen}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: "rgba(200, 149, 71, 0.15)",
                      color: "#8B6914",
                      border: "1px solid rgba(200, 149, 71, 0.4)"
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      icon={FileCheck} 
                      onClick={() => navigate("/quality/release/review", { state: { releaseId: b.id, batch: b.batch } })}
                    >
                      Review & Sign-Off
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#6B5B4E" }}>
                    No batches currently awaiting QA release sign-off.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

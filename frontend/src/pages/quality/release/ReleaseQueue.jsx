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
  const [metrics, setMetrics] = useState({
    pendingBatchesCount: 0,
    ccpClearances: {
      rate: "0%",
      badge: "NO CHECKS",
      subtitle: "Connecting to database..."
    },
    qaCycleTime: {
      time: "--",
      badge: "TARGET",
      subtitle: "Standard compliance SLA < 30m"
    }
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [queueRes, metricsRes] = await Promise.allSettled([
        qualityService.getReleaseQueue(),
        qualityService.getReleaseMetrics()
      ]);

      if (queueRes.status === "fulfilled") {
        const res = queueRes.value;
        const rawList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setQueue(rawList.map((b, idx) => {
          const ccpCheck = (b.ccpChecks && b.ccpChecks.length > 0) ? b.ccpChecks[0] : null;
          const ccpText = ccpCheck 
            ? `${ccpCheck.actualValue} ${ccpCheck.uom || ''} (${ccpCheck.status})` 
            : (b.ccpStatus || "No CCP Required");

          return {
            id: `REL-${b.batchNumber?.replace(/\D/g, "") || (idx + 101)}`,
            batch: b.batchNumber || b.id,
            sku: b.sku?.name || b.skuName || b.productName || "Standard SKU",
            line: b.line?.name || b.lineName || "Line 1",
            ccp: ccpText,
            allergen: b.allergenStatus || b.allergenCheck || "Pending Inspection",
            status: b.status === "Completed" ? "AWAITING QA SIGN-OFF" : (b.status || "AWAITING QA SIGN-OFF")
          };
        }));
      }

      if (metricsRes.status === "fulfilled" && metricsRes.value?.data) {
        setMetrics(metricsRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load release queue", err);
      setQueue([]);
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
          <div style={{ fontSize: "12px", color: queue.length > 0 ? "#8B6914" : "#6B5B4E", marginTop: "4px" }}>
            {queue.length > 0 ? "Awaiting QA Lead authorization" : "All batches cleared / none pending"}
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>CCP Clearances</span>
            <div style={{ 
              padding: "6px 10px", 
              borderRadius: "8px", 
              backgroundColor: metrics.ccpClearances?.badge === "PASSED" ? "rgba(34, 197, 94, 0.12)" : "rgba(200, 149, 71, 0.12)", 
              color: metrics.ccpClearances?.badge === "PASSED" ? "#15803D" : "#8B6914", 
              fontSize: "12px", 
              fontWeight: 700 
            }}>
              {metrics.ccpClearances?.badge || "PASSED"}
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {metrics.ccpClearances?.rate || "0%"}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            {metrics.ccpClearances?.subtitle || "Calculated from database ccp_checks"}
          </div>
        </Card>

        <Card style={{ padding: "18px 20px", borderRadius: "14px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6B5B4E", fontWeight: 600 }}>Avg QA Cycle Time</span>
            <div style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "rgba(200, 149, 71, 0.12)", color: "#8B6914", fontSize: "12px", fontWeight: 700 }}>
              {metrics.qaCycleTime?.badge || "TARGET"}
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#2B1D11", marginTop: "10px" }}>
            {metrics.qaCycleTime?.time || "--"}
          </div>
          <div style={{ fontSize: "12px", color: "#6B5B4E", marginTop: "4px" }}>
            {metrics.qaCycleTime?.subtitle || "Standard compliance SLA < 30m"}
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

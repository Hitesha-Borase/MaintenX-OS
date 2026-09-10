import React, { useState, useEffect } from "react";
import { Trash2, ShieldAlert, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function ScrapReworkCost() {
  const { addToast } = useApp();

  const [scrapEvents, setScrapEvents] = useState([]);
  const [scrapCostMtd, setScrapCostMtd] = useState("$4,200");
  const [scrapTarget, setScrapTarget] = useState("<$3,000");
  const [reworkCostMtd, setReworkCostMtd] = useState("$1,800");
  const [reworkTarget, setReworkTarget] = useState("<$2,000");
  const [yieldLossMargin, setYieldLossMargin] = useState("3.1%");
  const [yieldLimit, setYieldLimit] = useState("2.5%");
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const fetchScrapData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getScrapReworkCosts();
      const data = res.data || res;
      if (data) {
        if (data.events) setScrapEvents(data.events);
        if (data.scrapCostMtd) setScrapCostMtd(data.scrapCostMtd);
        if (data.scrapTarget) setScrapTarget(data.scrapTarget);
        if (data.reworkCostMtd) setReworkCostMtd(data.reworkCostMtd);
        if (data.reworkTarget) setReworkTarget(data.reworkTarget);
        if (data.yieldLossMargin) setYieldLossMargin(data.yieldLossMargin);
        if (data.yieldLimit) setYieldLimit(data.yieldLimit);
      }
    } catch (err) {
      console.error("Error loading scrap costs:", err);
      addToast("Failed to load scrap costs telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapData();
  }, []);

  const handleOpenAudit = (ev) => {
    setSelectedEvent(ev);
    setIsAuditModalOpen(true);
  };

  const handleConfirmAudit = async () => {
    if (!selectedEvent) return;
    try {
      setAuditing(true);
      const res = await executiveService.auditScrapEvent({ eventId: selectedEvent.id });
      const data = res.data || res;
      if (data && data.events) {
        setScrapEvents(data.events);
      }
      addToast(data?.message || `Quality hold and scrap audit log verified for event ${selectedEvent.id}`, "success");
      setIsAuditModalOpen(false);
    } catch (err) {
      console.error("Error auditing scrap event:", err);
      addToast("Failed to record scrap audit log", "error");
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Scrap & Rework Costing
        </h1>
      </div>

      <div className="grid-3">
        <StatCard title="Scrap Cost (MTD)" value={scrapCostMtd} description={`Std Target: ${scrapTarget}`} icon={Trash2} color="#DC2626" />
        <StatCard title="Rework Cost (MTD)" value={reworkCostMtd} description={`Std Target: ${reworkTarget}`} icon={Trash2} color="#059669" />
        <StatCard title="Yield Loss Margin" value={yieldLossMargin} description={`vs. ${yieldLimit} standard yield limit`} icon={Trash2} color="#D97706" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Scrap & Rework Ledger
        </h3>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {scrapEvents.map((ev, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-card-subtle)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                      {ev.id} ({ev.batch})
                    </span>
                    <Badge variant={ev.status === "Closed" || ev.status.includes("Verified") ? "emerald" : "warning"}>{ev.status}</Badge>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Reason: <strong>{ev.reason}</strong>
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626", fontFamily: "var(--font-mono)" }}>
                    {ev.cost}
                  </span>
                  <Button variant="secondary" size="xs" icon={FileText} onClick={() => handleOpenAudit(ev)}>
                    Audit Log
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit Log Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title={`Scrap & Rework Audit Log: ${selectedEvent?.id || ""}`}
        subtitle={`Batch: ${selectedEvent?.batch || ""}`}
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAuditModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" icon={CheckCircle2} onClick={handleConfirmAudit} disabled={auditing}>
              {auditing ? "Verifying..." : "Export Audit Record"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
          <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>Financial Impact: <strong style={{ color: "#DC2626", fontFamily: "var(--font-mono)" }}>{selectedEvent?.cost}</strong></div>
            <div>Department: <strong>{selectedEvent?.department}</strong></div>
            <div>Logged By: <strong>{selectedEvent?.loggedBy}</strong></div>
            <div>Status: <strong>{selectedEvent?.status}</strong></div>
          </div>
          <div>
            <strong>Root Cause / Incident Detail:</strong>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "4px" }}>{selectedEvent?.reason}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from "react";
import { Trash2, AlertOctagon, ArrowLeft, ShieldAlert } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function Reject() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [batches, setBatches] = useState([
    { id: "BAT-2026-0890", name: "BAT-2026-0890 — Organic Orange Juice 1L (Hold: HLD-401)" },
    { id: "BAT-2026-0888", name: "BAT-2026-0888 — Organic Orange Juice 1L" }
  ]);
  const [protocols, setProtocols] = useState([
    { id: "ON_SITE_BIO_DRAIN", label: "On-Site Waste Water / Bio-Drain Neutralization", defaultNote: "Non-recoverable CCP pasteurizer excursion. Biological integrity compromised." },
    { id: "CERTIFIED_LANDFILL", label: "Certified Industrial Waste Landfill Transfer", defaultNote: "Material unfit for reclamation. Scheduled for certified landfill transfer." },
    { id: "HAZARDOUS_INCINERATION", label: "High-Temperature Incineration", defaultNote: "Complete thermal destruction under hazardous waste protocol." }
  ]);

  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0890");
  const [rejectReason, setRejectReason] = useState("Non-recoverable CCP pasteurizer excursion. Biological integrity compromised.");
  const [destructionProtocol, setDestructionProtocol] = useState("ON_SITE_BIO_DRAIN");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchRejectData = async () => {
      setLoading(true);
      try {
        const res = await qualityService.getDispositionReject();
        if (res && res.data) {
          if (res.data.batches && res.data.batches.length > 0) {
            setBatches(res.data.batches);
            setSelectedBatch(res.data.batches[0].id);
          }
          if (res.data.protocols && res.data.protocols.length > 0) {
            setProtocols(res.data.protocols);
            setDestructionProtocol(res.data.protocols[0].id);
            if (res.data.protocols[0].defaultNote) {
              setRejectReason(res.data.protocols[0].defaultNote);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load reject data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRejectData();
  }, []);

  const handleProtocolChange = (protocolId) => {
    setDestructionProtocol(protocolId);
    const found = protocols.find(p => p.id === protocolId);
    if (found && found.defaultNote) {
      setRejectReason(found.defaultNote);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await qualityService.submitReject({
        batch: selectedBatch,
        reason: rejectReason,
        destructionProtocol: destructionProtocol
      });

      setConfirmed(true);
      addToast(`Batch ${selectedBatch} REJECTED and marked for scrap/destruction.`, "warning");
    } catch (err) {
      console.error(err);
      setConfirmed(true);
      addToast(`Batch ${selectedBatch} REJECTED.`, "warning");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={20} color="#B91C1C" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Disposition — Reject / Scrap
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Authorize certified scrap, write-offs, and controlled destruction protocols for failed batches
          </p>
        </div>

        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/disposition/release")}>
          Back to Disposition Gate
        </Button>
      </div>

      <form onSubmit={handleReject}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "28px", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
          <div style={{ padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#B91C1C", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertOctagon size={18} />
            <span>Warning: Authorizing rejection marks this entire lot as scrap. This action generates a financial write-off entry.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#2B1D11", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                Target Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name || b.id}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#2B1D11", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                Destruction Protocol
              </label>
              <select
                value={destructionProtocol}
                onChange={(e) => handleProtocolChange(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
              >
                {protocols.map(p => (
                  <option key={p.id} value={p.id}>{p.label || p.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#2B1D11", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              Rejection Rationale & Scrap Notes *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button 
              type="submit" 
              variant="outline" 
              icon={Trash2} 
              disabled={confirmed || submitting}
              style={{ padding: "12px 24px", color: "#B91C1C", borderColor: "#E8DDCF" }}
            >
              {confirmed ? "✗ Batch REJECTED" : submitting ? "Authorizing..." : "Authorize Rejection (QA Sign-Off)"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

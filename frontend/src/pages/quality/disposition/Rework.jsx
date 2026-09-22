import React, { useState } from "react";
import { RefreshCw, CheckCircle2, ArrowLeft, ShieldCheck, FileText } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function Rework() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [protocols, setProtocols] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [reworkNote, setReworkNote] = useState("");
  const [reworkProtocol, setReworkProtocol] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchReworkData = async () => {
      setLoading(true);
      try {
        const res = await qualityService.getDispositionRework();
        if (res && res.data) {
          if (res.data.batches && res.data.batches.length > 0) {
            setBatches(res.data.batches);
            setSelectedBatch(res.data.batches[0].id);
          }
          if (res.data.protocols && res.data.protocols.length > 0) {
            setProtocols(res.data.protocols);
            setReworkProtocol(res.data.protocols[0].id);
            if (res.data.protocols[0].defaultNote) {
              setReworkNote(res.data.protocols[0].defaultNote);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load rework data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReworkData();
  }, []);

  const handleProtocolChange = (protocolId) => {
    setReworkProtocol(protocolId);
    const found = protocols.find(p => p.id === protocolId);
    if (found && found.defaultNote) {
      setReworkNote(found.defaultNote);
    }
  };

  const handleRework = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const currentBatch = batches.find(b => b.id === selectedBatch);

      const res = await qualityService.submitRework({
        batch: selectedBatch,
        holdId: currentBatch ? currentBatch.holdId : "",
        recordId: currentBatch ? currentBatch.recordId : "",
        instruction: reworkNote,
        protocol: reworkProtocol
      });

      setConfirmed(true);
      addToast(res?.data?.message || `Batch ${selectedBatch} authorized for rework and saved in database.`, "success");
    } catch (err) {
      console.error(err);
      addToast(`Failed to authorize rework for ${selectedBatch}`, "error");
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
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(200, 149, 71, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Disposition — Rework
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Issue authorized re-processing recipes and QA release gates back to production floor
          </p>
        </div>

        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/disposition/release")}>
          Back to Disposition Gate
        </Button>
      </div>

      <form onSubmit={handleRework}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "28px", borderRadius: "16px", border: "1px solid #E8DDCF", backgroundColor: "#FFFFFF" }}>
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
                Rework Protocol Strategy
              </label>
              <select
                value={reworkProtocol}
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
              Detailed Rework Instruction for Line Operators *
            </label>
            <textarea
              value={reworkNote}
              onChange={(e) => setReworkNote(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button 
              type="submit" 
              variant="primary" 
              icon={RefreshCw} 
              disabled={confirmed || submitting}
              style={{ padding: "12px 24px" }}
            >
              {confirmed ? "✓ Rework Authorized" : submitting ? "Authorizing..." : "Authorize Rework (QA Sign-Off)"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

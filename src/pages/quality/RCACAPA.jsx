import React, { useState } from "react";
import { SearchCode, Save, ArrowLeft } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useApp } from "../../context/AppContext";
import { useQualityStore } from "./utils/useQualityStore";
import { useNavigate } from "react-router-dom";

export function RCACAPA() {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const qualityState = useQualityStore();

  const [selectedInvId, setSelectedInvId] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [corrective, setCorrective] = useState("");
  const [preventive, setPreventive] = useState("");

  const pendingInvestigations = qualityState.investigations.filter(i => i.status !== "Completed" && i.finding);

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedInvId) {
      addToast("Please select an investigation to link this CAPA to.", "warning");
      return;
    }

    qualityState.updateInvestigation(selectedInvId, {
      capaRootCause: rootCause,
      capaCorrective: corrective,
      capaPreventive: preventive,
      status: "In Progress (CAPA Added)"
    });

    addToast(`RCA/CAPA record saved and linked to investigation ${selectedInvId}.`, "success");
    
    setTimeout(() => {
      navigate("/quality/events/investigations");
    }, 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            Root Cause Analysis & CAPA
          </h1>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px", borderRadius: "16px", backgroundColor: "#f9fafb" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              Link to Active Investigation
            </label>
            <select
              value={selectedInvId}
              onChange={(e) => setSelectedInvId(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", backgroundColor: "white" }}
              required
            >
              <option value="" disabled>Select Investigation...</option>
              {pendingInvestigations.map(i => (
                <option key={i.id} value={i.id}>{i.id} (Linked to {i.devId})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Root Cause (Why did the deviation occur?)
            </label>
            <textarea
              placeholder="E.g. Temperature sensor recalibration drift..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", resize: "vertical" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Corrective Action (What was done immediately?)
            </label>
            <textarea
              placeholder="E.g. Replaced defective temperature probe..."
              value={corrective}
              onChange={(e) => setCorrective(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", resize: "vertical" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Preventive Action (What system change prevents recurrence?)
            </label>
            <textarea
              placeholder="E.g. Implement monthly sensor calibration schedule..."
              value={preventive}
              onChange={(e) => setPreventive(e.target.value)}
              style={{ width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", resize: "vertical" }}
              required
            />
          </div>

          <div style={{ alignSelf: "flex-end" }}>
            <Button type="submit" variant="primary" icon={Save}>
              Save RCA / CAPA Record
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}


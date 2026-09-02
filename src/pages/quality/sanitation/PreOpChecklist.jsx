import React, { useState } from "react";
import { CheckCircle2, Save, XCircle, Play, CheckSquare } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Button } from "../../../components/common/Button";
import { useNavigate } from "react-router-dom";

export function PreOpChecklist() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [hasStarted, setHasStarted] = useState(false);
  const [items, setItems] = useState([
    { id: 1, name: "Physical inspection of filler nozzle seals", passed: null },
    { id: 2, name: "Pasteurizer pipeline pressure calibration", passed: null },
    { id: 3, name: "Line 1 clean of raw debris and tools", passed: null }
  ]);

  const handleStart = () => {
    setHasStarted(true);
    addToast("Pre-Op Checklist started.", "info");
  };

  const handleToggle = (id, result) => {
    if (!hasStarted) return;
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, passed: result } : item)
    );
  };

  const handleSaveProgress = () => {
    addToast("Progress saved.", "success");
  };

  const handleComplete = () => {
    const hasNull = items.some(i => i.passed === null);
    if (hasNull) {
      addToast("Please complete all checklist items before submitting.", "warning");
      return;
    }

    const hasFailed = items.some(i => i.passed === false);
    if (hasFailed) {
      addToast("Pre-Op failed! Redirecting to report a deviation.", "error");
      setTimeout(() => navigate("/quality/events/deviations"), 2000);
    } else {
      addToast("Pre-Op Checklist verified. Line is Ready for Production.", "success");
      setHasStarted(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px 0" }}>
            Pre-Op Startup Checklist
          </h1>
        </div>
        {!hasStarted ? (
          <Button variant="primary" icon={Play} onClick={handleStart}>
            Start Check
          </Button>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="outline" icon={Save} onClick={handleSaveProgress}>
              Save Progress
            </Button>
            <Button variant="primary" icon={CheckSquare} onClick={handleComplete}>
              Complete Check
            </Button>
          </div>
        )}
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px",
        backgroundColor: "var(--card-bg)",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        opacity: hasStarted ? 1 : 0.6,
        pointerEvents: hasStarted ? "auto" : "none"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: item.passed === true ? "rgba(16, 185, 129, 0.1)" : item.passed === false ? "rgba(239, 68, 68, 0.1)" : "var(--bg-secondary)",
                border: item.passed === true ? "1px solid #10b981" : item.passed === false ? "1px solid #ef4444" : "1px solid var(--border-color)",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{item.name}</span>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => handleToggle(item.id, true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", 
                    opacity: item.passed === true ? 1 : 0.3
                  }}
                >
                  <CheckCircle2 size={24} color="#10b981" />
                </button>
                <button 
                  onClick={() => handleToggle(item.id, false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    opacity: item.passed === false ? 1 : 0.3
                  }}
                >
                  <XCircle size={24} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


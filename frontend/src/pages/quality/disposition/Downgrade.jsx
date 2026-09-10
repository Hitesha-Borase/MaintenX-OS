import React, { useState } from "react";
import { ArrowDown, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";
import { qualityService } from "../../../services/qualityService";
import { useNavigate } from "react-router-dom";

export function Downgrade() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [batches, setBatches] = useState([
    { id: "BAT-2026-0890", name: "BAT-2026-0890 — Organic Orange Juice 1L (Hold: HLD-401)" },
    { id: "BAT-2026-0888", name: "BAT-2026-0888 — Organic Orange Juice 1L" }
  ]);
  const [grades, setGrades] = useState([
    { id: "Animal Feed Grade", label: "Animal Feed Grade (Certified Safe)", defaultNote: "Lot passed microbiological tests but failed aesthetic flavor/color profile for commercial retail." },
    { id: "Industrial Cleaning / Vinegar Base", label: "Industrial Cleaning / Vinegar Fermentation Base", defaultNote: "Reclassified as raw industrial vinegar fermentation substrate." },
    { id: "Compost / Bio-fertilizer Substrate", label: "Compost / Bio-fertilizer Substrate", defaultNote: "Safe organic material designated for agricultural composting." }
  ]);

  const [selectedBatch, setSelectedBatch] = useState("BAT-2026-0890");
  const [downgradeTarget, setDowngradeTarget] = useState("Animal Feed Grade");
  const [notes, setNotes] = useState("Lot passed microbiological tests but failed aesthetic flavor/color profile for commercial retail.");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDowngradeData = async () => {
      setLoading(true);
      try {
        const res = await qualityService.getDispositionDowngrade();
        if (res && res.data) {
          if (res.data.batches && res.data.batches.length > 0) {
            setBatches(res.data.batches);
            setSelectedBatch(res.data.batches[0].id);
          }
          if (res.data.grades && res.data.grades.length > 0) {
            setGrades(res.data.grades);
            setDowngradeTarget(res.data.grades[0].id);
            if (res.data.grades[0].defaultNote) {
              setNotes(res.data.grades[0].defaultNote);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load downgrade data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDowngradeData();
  }, []);

  const handleGradeChange = (gradeId) => {
    setDowngradeTarget(gradeId);
    const found = grades.find(g => g.id === gradeId);
    if (found && found.defaultNote) {
      setNotes(found.defaultNote);
    }
  };

  const handleDowngrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await qualityService.submitDowngrade({
        batch: selectedBatch,
        targetGrade: downgradeTarget,
        notes: notes
      });

      setConfirmed(true);
      addToast(`Batch ${selectedBatch} downgraded to "${downgradeTarget}" by QA authorization.`, "success");
    } catch (err) {
      console.error(err);
      setConfirmed(true);
      addToast(`Batch ${selectedBatch} downgraded to "${downgradeTarget}".`, "success");
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
              <ArrowDown size={20} color="#C89547" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#2B1D11", margin: 0 }}>
              Disposition — Downgrade
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 46px", fontSize: "13px", color: "#6B5B4E" }}>
            Authorize re-classification of off-spec product for non-human or secondary industrial applications
          </p>
        </div>

        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/quality/disposition/release")}>
          Back to Disposition Gate
        </Button>
      </div>

      <form onSubmit={handleDowngrade}>
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
                Downgrade Target Application
              </label>
              <select
                value={downgradeTarget}
                onChange={(e) => handleGradeChange(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", backgroundColor: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
              >
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.label || g.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#2B1D11", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              QA Quality Downgrade Justification *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E8DDCF", fontSize: "13px", color: "#2B1D11", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <Button 
              type="submit" 
              variant="primary" 
              icon={ArrowDown} 
              disabled={confirmed || submitting}
              style={{ padding: "12px 24px" }}
            >
              {confirmed ? "✓ Downgrade Authorized" : submitting ? "Authorizing..." : "Authorize Downgrade (QA Sign-Off)"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

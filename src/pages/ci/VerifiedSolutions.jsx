import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Download,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ThumbsUp,
  Clock,
  Plus,
  X,
  Filter
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function VerifiedSolutions() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [solutions, setSolutions] = useState([
    {
      id: "VS-21",
      failure: "HTST Temperature Sensor Drift during 98°C Steam Sanitization",
      fix: "Replace OEM sensor with dual PT100 RTD Class A probe in sanitary thermowell and codify 3-point pre-shift calibration cross-check against dry-well block calibrator.",
      effectiveness: "100%",
      date: "2026-07-14",
      author: "Pedro Alves (Maintenance Lead)",
      votes: 14,
      category: "Thermal Loop"
    },
    {
      id: "VS-19",
      failure: "Filler Nozzle Volumetric Over-Fill Liquid Giveaway (+2.4g/bottle)",
      fix: "Recalibrate servo dosing stroke profile to ±0.2g using dynamic Mettler Toledo high-speed checkweigher telemetry feedback loop.",
      effectiveness: "100%",
      date: "2026-06-20",
      author: "Ahmed Hassan (CI Lead)",
      votes: 19,
      category: "Liquid Dosing"
    },
    {
      id: "VS-18",
      failure: "Capping Head Spindle Torque Slip under 600 BPM Rotation",
      fix: "Upgrade to magnetic hysteresis clutches with quarterly spring deflection audits and wireless telemetry torque caps.",
      effectiveness: "100%",
      date: "2026-05-10",
      author: "Elena Rostova (Tooling Tech)",
      votes: 11,
      category: "Rotary Mechanical"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSolution, setNewSolution] = useState({
    failure: "",
    fix: "",
    category: "Thermal Loop",
    author: "Alexander Vance (Admin)"
  });

  const handleVote = (id) => {
    setSolutions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s))
    );
    addToast("Upvoted verified solution! Knowledge base score updated.", "success");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSolution.failure.trim() || !newSolution.fix.trim()) {
      addToast("Please provide failure symptom and standardized fix.", "warning");
      return;
    }

    const created = {
      id: `VS-${Math.floor(22 + Math.random() * 50)}`,
      failure: newSolution.failure,
      fix: newSolution.fix,
      category: newSolution.category,
      effectiveness: "100%",
      date: new Date().toISOString().substring(0, 10),
      author: newSolution.author,
      votes: 1
    };

    setSolutions([created, ...solutions]);
    addToast(`Solution ${created.id} codified and added to library!`, "success");
    setIsModalOpen(false);
    setNewSolution({
      failure: "",
      fix: "",
      category: "Thermal Loop",
      author: "Alexander Vance (Admin)"
    });
  };

  const handleExportCSV = () => {
    const headers = "Solution ID,Failure Mode,Validated Countermeasure,Category,Effectiveness,Verified Date,Author,Votes\n";
    const rows = filteredSolutions
      .map((s) => `"${s.id}","${s.failure}","${s.fix}","${s.category}","${s.effectiveness}","${s.date}","${s.author}",${s.votes}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Verified_Solutions_Knowledge_Base_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Verified solutions knowledge base exported to CSV.", "info");
  };

  const totalVotes = solutions.reduce((sum, s) => sum + s.votes, 0);

  const filteredSolutions = solutions.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      s.failure.toLowerCase().includes(term) ||
      s.fix.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.author.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Verified Solutions Library
            </h1>
            <Badge variant="emerald">100% SUSTAINED EFFICACY</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Submit Solution
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/standards")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Standards Library
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/engineering")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Engineering Hub
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 2x2 on mobile, 4 on desktop */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Verified Solutions"
          value={solutions.length.toString()}
          unit="Proven Fixes"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Recurrence Defense"
          value="100%"
          unit="Sustained"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Avg Resolution Time"
          value="2.4 Days"
          unit="MTTR Gain"
          icon={Clock}
          colorVariant="cyan"
        />
        <StatCard
          title="Technician Upvotes"
          value={`${totalVotes} Votes`}
          unit="Endorsed"
          icon={ThumbsUp}
          colorVariant="amber"
        />
      </div>

      {/* Structured Clean Data Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Controls Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "220px" }}>
            <div style={{ position: "relative", minWidth: "200px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search failure symptom, standard fix, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: "auto", minWidth: "150px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Thermal Loop">Thermal Loop</option>
              <option value="Liquid Dosing">Liquid Dosing</option>
              <option value="Rotary Mechanical">Rotary Mechanical</option>
            </select>
          </div>
        </div>

        {/* Structured Clean Table */}
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "780px" }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Failure Mode / Problem Symptom</th>
                <th>Standardized Kaizen Countermeasure</th>
                <th>Domain</th>
                <th>Author & Date</th>
                <th>Efficacy</th>
                <th>Endorsements</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolutions.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>
                      {s.id}
                    </span>
                  </td>
                  <td style={{ maxWidth: "260px" }}>
                    <strong style={{ color: "var(--text-primary)", fontSize: "13px", lineHeight: 1.3, display: "block" }}>
                      {s.failure}
                    </strong>
                  </td>
                  <td style={{ maxWidth: "340px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {s.fix}
                    </div>
                  </td>
                  <td>
                    <Badge variant="cyan">{s.category}</Badge>
                  </td>
                  <td>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{s.author}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{s.date}</div>
                  </td>
                  <td>
                    <Badge variant="emerald">100% Proven</Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => handleVote(s.id)}
                      title="Vote this solution as helpful"
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "rgba(5, 150, 105, 0.1)",
                        color: "#059669",
                        border: "1px solid rgba(5, 150, 105, 0.3)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <ThumbsUp size={12} /> {s.votes} Votes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SUBMIT SOLUTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Submit Verified Kaizen Solution
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Failure Mode / Symptom Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Induction Sealer Heat Inconsistency on 38mm Neck"
                  value={newSolution.failure}
                  onChange={(e) => setNewSolution({ ...newSolution, failure: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="form-label">Domain / System</label>
                  <select
                    className="form-select"
                    value={newSolution.category}
                    onChange={(e) => setNewSolution({ ...newSolution, category: e.target.value })}
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Thermal Loop">Thermal Loop</option>
                    <option value="Liquid Dosing">Liquid Dosing</option>
                    <option value="Rotary Mechanical">Rotary Mechanical</option>
                    <option value="Electrical & Sensors">Electrical & Sensors</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Author / Lead Tech</label>
                  <input
                    type="text"
                    value={newSolution.author}
                    onChange={(e) => setNewSolution({ ...newSolution, author: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Standardized Kaizen Fix / Procedure *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe step-by-step resolution, torque specs, replacement part #, or parameter changes..."
                  value={newSolution.fix}
                  onChange={(e) => setNewSolution({ ...newSolution, fix: e.target.value })}
                  className="form-textarea"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Solution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

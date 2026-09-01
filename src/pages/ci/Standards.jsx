import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Printer,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  X
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useApp } from "../../context/AppContext";

export function Standards() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [docs, setDocs] = useState([
    {
      code: "SOP-CCP-001",
      title: "HTST Pasteurizer CCP Critical Control Point Operating Procedure",
      category: "Food Safety & HACCP",
      rev: "Rev 4",
      lastReviewed: "2026-08-20",
      status: "Current"
    },
    {
      code: "SOP-QA-002",
      title: "Allergen Clean-Out & ATP Swab Pre-Op Verification Standard",
      category: "Quality Assurance",
      rev: "Rev 2",
      lastReviewed: "2026-07-15",
      status: "Current"
    },
    {
      code: "ENG-001",
      title: "Rotary Filler Liquid Nozzle Dynamic Calibration Engineering Standard",
      category: "Engineering & Maintenance",
      rev: "Rev 1",
      lastReviewed: "2026-08-28",
      status: "Under Review"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New SOP modal form
  const [newSOP, setNewSOP] = useState({
    code: "",
    title: "",
    category: "Engineering & Maintenance",
    rev: "Rev 1"
  });

  const handlePrint = (code) => {
    addToast(`Document ${code} prepared for print / controlled export.`, "info");
    window.print();
  };

  const handleAddSOP = (e) => {
    e.preventDefault();
    if (!newSOP.code || !newSOP.title) {
      addToast("Please provide document code and title.", "warning");
      return;
    }

    setDocs((prev) => [
      {
        ...newSOP,
        lastReviewed: new Date().toISOString().substring(0, 10),
        status: "Current"
      },
      ...prev
    ]);
    addToast(`Standard ${newSOP.code} successfully registered!`, "success");
    setNewSOP({
      code: "",
      title: "",
      category: "Engineering & Maintenance",
      rev: "Rev 1"
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Document Code,Title,Category,Revision,Last Reviewed,Status\n";
    const rows = filteredDocs
      .map((d) => `"${d.code}","${d.title}","${d.category}","${d.rev}","${d.lastReviewed}","${d.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Engineering_Standards_Register_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Standards register exported to CSV.", "info");
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      const matchesCategory = selectedCategoryFilter === "ALL" || d.category.includes(selectedCategoryFilter);
      const matchesStatus = selectedStatusFilter === "ALL" || d.status === selectedStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.code?.toLowerCase().includes(q) ||
        d.title?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.rev?.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [docs, searchQuery, selectedCategoryFilter, selectedStatusFilter]);

  const currentCount = docs.filter((d) => d.status === "Current").length;
  const reviewCount = docs.filter((d) => d.status === "Under Review").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Engineering Standards Library
            </h1>
            <Badge variant="cyan">{docs.length} CONTROLLED STANDARDS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 14px" }}>
            + Author Standard
          </Button>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Register
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/projects/list")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            CI Projects
          </Button>
          <Button variant="secondary" icon={ArrowRight} onClick={() => navigate("/ci/verified-solutions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Verified Solutions
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
          title="Current Active SOPs"
          value={currentCount.toString()}
          unit="Controlled"
          trend={{ value: "ISO 22000 compliant standards", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Standards in Review"
          value={reviewCount.toString()}
          unit="Engineering"
          trend={{ value: "Pending QA audit sign-off", isPositive: false, text: "" }}
          icon={AlertTriangle}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Compliance"
          value="100%"
          unit="Audited"
          trend={{ value: "Zero non-conforming SOPs", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="cyan"
        />
        <StatCard
          title="Revision Cadence"
          value="Annually"
          unit="Scheduled"
          trend={{ value: "Continuous engineering review", isPositive: true, text: "" }}
          icon={BookOpen}
          colorVariant="emerald"
        />
      </div>

      {/* Structured Standards Table Card */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="form-input"
                style={{ height: "36px", fontSize: "12px", width: "180px", backgroundColor: "#FFFFFF" }}
              >
                <option value="ALL">All Categories</option>
                <option value="Food Safety">Food Safety & HACCP</option>
                <option value="Quality">Quality Assurance</option>
                <option value="Engineering">Engineering & Maintenance</option>
              </select>
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "140px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Current">Current</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredDocs.length}</strong> of {docs.length} Controlled Standards
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Doc Code</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Document Title & Purpose</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Revision</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Last Reviewed</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((d, idx) => {
                  const isCurrent = d.status === "Current";
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {d.code}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {d.title}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="cyan">{d.category}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {d.rev}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {d.lastReviewed}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <Badge variant={isCurrent ? "emerald" : "amber"}>{d.status}</Badge>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Printer}
                          onClick={() => handlePrint(d.code)}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          Print / PDF
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No engineering standards match the selected category or search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* POPUP MODAL: AUTHOR NEW STANDARD */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(26, 15, 2, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#261603" }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    Author Controlled Standard
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Register a new engineering specification or plant SOP
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSOP} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Standard Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOP-MEC-005"
                    value={newSOP.code}
                    onChange={(e) => setNewSOP({ ...newSOP, code: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                    Revision *
                  </label>
                  <input
                    type="text"
                    value={newSOP.rev}
                    onChange={(e) => setNewSOP({ ...newSOP, rev: e.target.value })}
                    className="form-input"
                    style={{ width: "100%", height: "38px", fontSize: "13px" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Document Title & Description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Homogenizer Ceramic Plunger Packing Replacement Procedure"
                  value={newSOP.title}
                  onChange={(e) => setNewSOP({ ...newSOP, title: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px", display: "block" }}>
                  Discipline / Category *
                </label>
                <select
                  value={newSOP.category}
                  onChange={(e) => setNewSOP({ ...newSOP, category: e.target.value })}
                  className="form-input"
                  style={{ width: "100%", height: "38px", fontSize: "13px" }}
                >
                  <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                  <option value="Food Safety & HACCP">Food Safety & HACCP</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Plus}>
                  Register Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

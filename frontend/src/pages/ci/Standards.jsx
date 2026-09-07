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
  X,
  Layers,
  Sparkles,
  Eye,
  Check
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import { useCI } from "../../context/CIContext";
import { useApp } from "../../context/AppContext";

export function Standards() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    standards = [],
    createStandard,
    ciProjects = [],
    investigations = []
  } = useCI();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [printingDoc, setPrintingDoc] = useState(null);

  const [newSOP, setNewSOP] = useState({
    title: "",
    type: "Controlled SOP",
    sourceProjectId: ciProjects[0]?.id || "",
    sourceRcaId: investigations[0]?.id || "",
    owner: "Engineering Quality Committee"
  });

  const handlePrint = (doc) => {
    addToast(`Document ${doc.id} prepared for print / controlled export.`, "info");
    setPrintingDoc(doc);
    setTimeout(() => {
      window.print();
      setPrintingDoc(null);
    }, 100);
  };

  const handleAddSOP = (e) => {
    e.preventDefault();
    if (!newSOP.title.trim()) {
      addToast("Please provide document title.", "warning");
      return;
    }

    createStandard(newSOP);
    setNewSOP({
      title: "",
      type: "Controlled SOP",
      sourceProjectId: ciProjects[0]?.id || "",
      sourceRcaId: investigations[0]?.id || "",
      owner: "Engineering Quality Committee"
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = "Standard ID,Title,Type,Version,Source Project,Source RCA,Owner,Effective Date,Review Date,Status,Approved By\n";
    const rows = filteredDocs
      .map((d) => `"${d.id}","${d.title}","${d.type}","${d.version}","${d.sourceProjectId || "-"}","${d.sourceRcaId || "-"}","${d.owner}","${d.effectiveDate}","${d.reviewDate}","${d.status}","${d.approvedBy || "-"}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Controlled_Engineering_Standards_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    addToast("Engineering standards catalog exported to CSV.", "info");
  };

  const filteredDocs = useMemo(() => {
    return standards.filter((d) => {
      const matchesType = selectedTypeFilter === "ALL" || d.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === "ALL" || d.status === selectedStatusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [standards, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Controlled Standards & SOP Library
            </h1>
            <Badge variant="cyan">{standards.length} CONTROLLED SPECIFICATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="secondary" icon={Download} onClick={handleExportCSV} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Export Catalog CSV
          </Button>
          <Button variant="secondary" onClick={() => navigate("/ci/verified-solutions")} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Verified Solutions
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            Register Controlled Standard
          </Button>
        </div>
      </div>

      {/* KPI Tickers */}
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
          title="Active Standards"
          value={standards.filter((s) => s.status === "Active").length.toString()}
          unit="Current SOPs"
          icon={BookOpen}
          colorVariant="emerald"
        />
        <StatCard
          title="Engineering Specs"
          value={standards.filter((s) => s.type.includes("Spec") || s.type.includes("SOP")).length.toString()}
          unit="Approved"
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="HACCP & CCP Limits"
          value={standards.filter((s) => s.type.includes("HACCP")).length.toString()}
          unit="Critical Controls"
          icon={ShieldCheck}
          colorVariant="rose"
        />
        <StatCard
          title="Audit Readiness"
          value="100%"
          unit="Controlled Revision"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search standard title, ID, type or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: "36px",
                backgroundColor: "#FFFFFF",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Categories</option>
              <option value="Controlled SOP">Controlled SOP</option>
              <option value="Engineering Spec">Engineering Spec</option>
              <option value="HACCP Limit">HACCP Limit</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="form-input"
              style={{ fontSize: "12px", padding: "6px 10px", width: "auto", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Document Statuses</option>
              <option value="Active">Active / Current</option>
              <option value="Review">Under Review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Standard Document</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Revision</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Origin (Project / RCA)</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Review Schedule</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "13px" }}>{d.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{d.id} • Owner: {d.owner}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={d.type.includes("HACCP") ? "rose" : d.type.includes("Engineering") ? "amber" : "cyan"}>
                      {d.type}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px", color: "#8C5B23" }}>
                    {d.version}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {d.sourceProjectId || d.sourceRcaId || "Master Library"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <div>Effective: {d.effectiveDate}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Next Review: {d.reviewDate}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge variant={d.status === "Active" ? "emerald" : "amber"}>
                      {d.status?.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setSelectedDoc(d)}
                        title="View Standard Details"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handlePrint(d)}
                        title="Print Controlled Copy"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "var(--bg-card-subtle)",
                          color: "#8C5B23",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Printer size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE STANDARD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "520px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <BookOpen size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Register Controlled Standard
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSOP} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Standard Specification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOP-ENG-402: Instrument Air Header Filtration & Dewpoint Monitoring"
                  value={newSOP.title}
                  onChange={(e) => setNewSOP({ ...newSOP, title: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="form-label">Classification Type</label>
                  <select
                    value={newSOP.type}
                    onChange={(e) => setNewSOP({ ...newSOP, type: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="Controlled SOP">Controlled SOP</option>
                    <option value="Engineering Spec">Engineering Spec</option>
                    <option value="HACCP Limit">HACCP Critical Limit</option>
                    <option value="PM Standard Task">PM Standard Task</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Source CI Project</label>
                  <select
                    value={newSOP.sourceProjectId}
                    onChange={(e) => setNewSOP({ ...newSOP, sourceProjectId: e.target.value })}
                    className="form-input"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <option value="">Direct Revision</option>
                    {ciProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.id} — {p.name.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Governance / Department Owner</label>
                <input
                  type="text"
                  required
                  value={newSOP.owner}
                  onChange={(e) => setNewSOP({ ...newSOP, owner: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Publish Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedDoc && (
        <div className="modal-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content" style={{ maxWidth: "560px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {selectedDoc.id} — {selectedDoc.version}
                </h2>
              </div>
              <button onClick={() => setSelectedDoc(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Title:</strong>
                <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>{selectedDoc.title}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Category:</strong>
                  <div style={{ color: "var(--text-secondary)" }}>{selectedDoc.type}</div>
                </div>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Owner:</strong>
                  <div style={{ color: "var(--text-secondary)" }}>{selectedDoc.owner}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Effective Date:</strong>
                  <div style={{ color: "var(--text-secondary)" }}>{selectedDoc.effectiveDate}</div>
                </div>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Approved By:</strong>
                  <div style={{ color: "#059669", fontWeight: 700 }}>{selectedDoc.approvedBy || "Plant Director"}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setSelectedDoc(null)}>
                  Close
                </Button>
                <Button variant="primary" icon={Printer} onClick={() => handlePrint(selectedDoc)}>
                  Print Controlled Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT LAYOUT */}
      {printingDoc && (
        <div className="print-only" style={{ padding: "40px", backgroundColor: "#fff", color: "#000", width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 9999 }}>
          <div style={{ borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "#000" }}>{printingDoc.title}</h1>
              <div style={{ fontSize: "14px", marginTop: "8px", fontWeight: 600 }}>{printingDoc.type}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "18px", fontWeight: 800 }}>ID: {printingDoc.id}</div>
              <div style={{ fontSize: "14px", marginTop: "4px" }}>Rev: {printingDoc.version}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px", fontSize: "14px" }}>
            <div>
              <p style={{ margin: "4px 0" }}><strong>Owner:</strong> {printingDoc.owner}</p>
              <p style={{ margin: "4px 0" }}><strong>Status:</strong> {printingDoc.status}</p>
            </div>
            <div>
              <p style={{ margin: "4px 0" }}><strong>Effective Date:</strong> {printingDoc.effectiveDate}</p>
              <p style={{ margin: "4px 0" }}><strong>Next Review:</strong> {printingDoc.reviewDate}</p>
            </div>
          </div>

          <div style={{ border: "1px solid #000", padding: "30px", minHeight: "400px", marginBottom: "40px" }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>Document Content</h3>
            <p style={{ color: "#333", fontStyle: "italic", marginTop: "20px" }}>
              [Standard Operating Procedure / Engineering Specification details for {printingDoc.id} are maintained in the secure CI database.]
            </p>
            <p style={{ color: "#333", marginTop: "20px" }}>
              Source Reference: {printingDoc.sourceProjectId || printingDoc.sourceRcaId || "N/A"}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "60px", borderTop: "1px solid #000", paddingTop: "20px" }}>
            <div style={{ width: "250px" }}>
              <div style={{ borderBottom: "1px solid #000", height: "30px" }}></div>
              <div style={{ fontSize: "12px", marginTop: "8px", textAlign: "center" }}>Approved By Signature</div>
            </div>
            <div style={{ width: "200px" }}>
              <div style={{ borderBottom: "1px solid #000", height: "30px" }}></div>
              <div style={{ fontSize: "12px", marginTop: "8px", textAlign: "center" }}>Date</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

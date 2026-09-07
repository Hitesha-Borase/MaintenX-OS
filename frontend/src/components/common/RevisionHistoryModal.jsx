import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  GitCommit,
  X,
  ShieldCheck,
  Tag,
  ArrowLeftRight
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export function RevisionHistoryModal({ isOpen, onClose, entityTitle, entityCode, revisions = [], parameters = [] }) {
  const [selectedRevision, setSelectedRevision] = useState(revisions[0]?.revision || "R3");
  const [compareWithRevision, setCompareWithRevision] = useState(revisions[1]?.revision || "R2");
  const [activeTab, setActiveTab] = useState("timeline"); // "timeline" or "diff"

  if (!isOpen) return null;

  const currentRevObj = revisions.find((r) => r.revision === selectedRevision) || revisions[0];
  const compareRevObj = revisions.find((r) => r.revision === compareWithRevision) || revisions[1];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(38, 22, 3, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "780px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "rgba(200, 149, 71, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <History size={18} color="#B27E33" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Revision History & Audit Trace
                </h3>
                <Badge variant="cyan">{entityCode}</Badge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {entityTitle}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "var(--text-muted)"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "4px", padding: "12px 22px 0", borderBottom: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => setActiveTab("timeline")}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              borderBottom: activeTab === "timeline" ? "2px solid #C89547" : "2px solid transparent",
              color: activeTab === "timeline" ? "#8C5B23" : "var(--text-secondary)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Clock size={14} />
            Revision Timeline ({revisions.length})
          </button>

          <button
            onClick={() => setActiveTab("diff")}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              borderBottom: activeTab === "diff" ? "2px solid #C89547" : "2px solid transparent",
              color: activeTab === "diff" ? "#8C5B23" : "var(--text-secondary)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <ArrowLeftRight size={14} />
            Side-by-Side Comparison
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "22px", overflowY: "auto", flex: 1 }}>
          {activeTab === "timeline" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {revisions.map((rev, index) => {
                const isCurrent = index === 0;
                return (
                  <div
                    key={rev.revision}
                    style={{
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "16px",
                      backgroundColor: isCurrent ? "rgba(200, 149, 71, 0.04)" : "#FFFFFF",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: isCurrent ? "#C89547" : "var(--bg-card-subtle)",
                            color: isCurrent ? "#FFFFFF" : "var(--text-primary)",
                            fontSize: "12px",
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)"
                          }}
                        >
                          {rev.revision}
                        </span>
                        <Badge variant={rev.status === "Approved" || rev.status === "Active" ? "emerald" : "amber"}>
                          {rev.status}
                        </Badge>
                        {isCurrent && <Badge variant="cyan">CURRENT ACTIVE</Badge>}
                      </div>

                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {rev.date}
                      </div>
                    </div>

                    <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                      <strong>Change Note:</strong> {rev.changes || "No detailed modification note recorded."}
                    </div>

                    <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "var(--text-secondary)", borderTop: "1px dashed var(--border-subtle)", paddingTop: "8px" }}>
                      <div>Author: <strong style={{ color: "var(--text-primary)" }}>{rev.createdBy || "Alexander Vance"}</strong></div>
                      <div>Approved By: <strong style={{ color: "#0284C7" }}>{rev.approvedBy || "Sarah Jenkins"}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Comparison View */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Revision Pickers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Base Revision</label>
                  <select
                    value={compareWithRevision}
                    onChange={(e) => setCompareWithRevision(e.target.value)}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {revisions.map((r) => (
                      <option key={r.revision} value={r.revision}>{r.revision} ({r.status}) - {r.date}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Revision</label>
                  <select
                    value={selectedRevision}
                    onChange={(e) => setSelectedRevision(e.target.value)}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  >
                    {revisions.map((r) => (
                      <option key={r.revision} value={r.revision}>{r.revision} ({r.status}) - {r.date}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Table */}
              <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <th style={{ padding: "10px", textAlign: "left", color: "var(--text-secondary)" }}>Attribute / Parameter</th>
                      <th style={{ padding: "10px", textAlign: "left", color: "var(--text-secondary)" }}>{compareRevObj?.revision || "Previous"}</th>
                      <th style={{ padding: "10px", textAlign: "left", color: "var(--text-secondary)" }}>{currentRevObj?.revision || "Current"}</th>
                      <th style={{ padding: "10px", textAlign: "center", color: "var(--text-secondary)" }}>Change State</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px", fontWeight: 700 }}>Approval Status</td>
                      <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{compareRevObj?.status}</td>
                      <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 700 }}>{currentRevObj?.status}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <Badge variant="cyan">Updated</Badge>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px", fontWeight: 700 }}>Release Date</td>
                      <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{compareRevObj?.date}</td>
                      <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 700 }}>{currentRevObj?.date}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>-</span>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "10px", fontWeight: 700 }}>Approved By</td>
                      <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{compareRevObj?.approvedBy || "-"}</td>
                      <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 700 }}>{currentRevObj?.approvedBy || "-"}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <Badge variant="emerald">Verified</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px", fontWeight: 700 }}>Key Modification</td>
                      <td style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "11px" }}>{compareRevObj?.changes}</td>
                      <td style={{ padding: "10px", color: "#8C5B23", fontWeight: 600, fontSize: "11px" }}>{currentRevObj?.changes}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <Badge variant="amber">Diff Found</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} style={{ fontSize: "12px" }}>
            Close History
          </Button>
        </div>
      </div>
    </div>
  );
}

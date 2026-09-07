import React, { useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Lock,
  X,
  Search,
  Zap,
  ShieldCheck,
  Server,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";

export function APIsIntegrationPage() {
  const { addToast } = useApp();

  const [apiKeys, setApiKeys] = useState([
    { id: "KEY-01", name: "SCADA Production Telemetry Ingest", keyMasked: "mfg_live_9482••••••••••••••••", rateLimit: "1,000 req/min", created: "2026-08-15", status: "Active" },
    { id: "KEY-02", name: "Warehouse WMS Pallet Sync", keyMasked: "wms_live_7104••••••••••••••••", rateLimit: "250 req/min", created: "2026-08-20", status: "Active" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRate, setNewKeyRate] = useState("500 req/min");

  const filteredKeys = apiKeys.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      k.id.toLowerCase().includes(q)
    );
  });

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      addToast("Please provide application name.", "warning");
      return;
    }
    const created = {
      id: `KEY-0${apiKeys.length + 1}`,
      name: newKeyName,
      keyMasked: `key_live_${Math.floor(1000 + Math.random() * 9000)}••••••••••••••••`,
      rateLimit: newKeyRate || "500 req/min",
      created: new Date().toISOString().substring(0, 10),
      status: "Active"
    };
    setApiKeys([...apiKeys, created]);
    addToast(`API Key "${created.name}" generated!`, "success");
    setIsModalOpen(false);
    setNewKeyName("");
    setNewKeyRate("500 req/min");
  };

  const handleConfirmRevoke = () => {
    if (!deletingKey) return;
    setApiKeys(apiKeys.filter((k) => k.id !== deletingKey.id));
    addToast(`API Key ${deletingKey.id} (${deletingKey.name}) revoked and deleted.`, "warning");
    setDeletingKey(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1200px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              REST APIs & Webhook Key Management
            </h1>
            <Badge variant="emerald">{apiKeys.length} ACTIVE MACHINE KEYS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
            + Generate API Key
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
          title="Active Machine Keys"
          value={apiKeys.length.toString()}
          unit="Credentials"
          icon={KeyRound}
          colorVariant="emerald"
        />
        <StatCard
          title="Max Rate Limit"
          value="1,000"
          unit="req / min"
          icon={Zap}
          colorVariant="cyan"
        />
        <StatCard
          title="OpenAPI Gateway"
          value="v3.1.0"
          unit="REST Spec"
          icon={Server}
          colorVariant="amber"
        />
        <StatCard
          title="HMAC Security"
          value="256-bit"
          unit="Encrypted"
          icon={ShieldCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Keys Table */}
      <Card style={{ padding: "18px", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "14px", justifyContent: "space-between" }}>
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search application, key ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
            />
          </div>
        </div>

        <div className="data-table-container" style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", display: "block" }}>
          <table className="data-table" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th>Key Ref</th>
                <th>Application Name</th>
                <th>API Key Token</th>
                <th>Rate Limit</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{k.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--text-primary)" }}>{k.name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: "11px", color: "#059669", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{k.keyMasked}</code>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{k.rateLimit}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{k.created}</td>
                  <td>
                    <Badge variant="emerald">{k.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => addToast(`Key token for ${k.name} copied to clipboard!`, "info")}
                        title="Copy Key Token"
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
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingKey(k)}
                        title="Delete / Revoke Key"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(220, 38, 38, 0.1)",
                          color: "#DC2626",
                          border: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* GENERATE KEY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Generate Machine API Key
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateKey} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Application Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MES Automated Quality Vision Inspection"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Rate Limit Ceiling</label>
                <input
                  type="text"
                  placeholder="e.g. 500 req/min"
                  value={newKeyRate}
                  onChange={(e) => setNewKeyRate(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Issue Secret Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE / REVOKE MODAL */}
      {deletingKey && (
        <div className="modal-backdrop" onClick={() => setDeletingKey(null)}>
          <div className="modal-content" style={{ maxWidth: "420px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={15} />
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                  Confirm Delete Key
                </h2>
              </div>
              <button onClick={() => setDeletingKey(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                Kya aap sach me <strong>{deletingKey.name}</strong> ({deletingKey.id}) ko delete aur revoke karna chahte hain?
              </p>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", backgroundColor: "var(--bg-card-subtle)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                Is key ko use karne wali sabhi integrated services ka connection turant band ho jayega.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setDeletingKey(null)}>
                  Cancel
                </Button>
                <button
                  onClick={handleConfirmRevoke}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Yes, Delete Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

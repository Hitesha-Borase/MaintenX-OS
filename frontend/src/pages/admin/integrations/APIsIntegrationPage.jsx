import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Lock,
  X,
  Search,
  Eye,
  Zap,
  ShieldCheck,
  Server,
  AlertTriangle,
  Edit2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useApp } from "../../../context/AppContext";
import adminService from "../../../services/adminService";

export function APIsIntegrationPage() {
  const { addToast } = useApp();

  const [apiKeys, setApiKeys] = useState([]);
  const [viewingKey, setViewingKey] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyRate, setNewKeyRate] = useState("500 req/min");

  const loadKeys = () => {
    adminService.getApiKeys()
      .then((data) => {
        if (Array.isArray(data)) {
          setApiKeys(data);
        }
      })
      .catch((err) => console.warn("API keys load error:", err.message));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const filteredKeys = apiKeys.filter((k) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      k.id.toLowerCase().includes(q)
    );
  });

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      addToast("Please provide application name.", "warning");
      return;
    }
    try {
      const created = await adminService.createApiKey({
        name: newKeyName,
        rateLimit: newKeyRate || "500 req/min"
      });
      loadKeys();
      addToast(`API Key "${created.name}" generated in database!`, "success");
      setIsModalOpen(false);
      setNewKeyName("");
      setNewKeyRate("500 req/min");
    } catch (err) {
      addToast("Failed to create API key: " + err.message, "danger");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingKey.name.trim()) {
      addToast("Please provide application name.", "warning");
      return;
    }
    try {
      await adminService.updateApiKey(editingKey.id, {
        name: editingKey.name,
        rateLimit: editingKey.rateLimit,
        status: editingKey.status
      });
      loadKeys();
      addToast(`API Key "${editingKey.id}" updated in database!`, "success");
      setEditingKey(null);
    } catch (err) {
      addToast("Failed to update API key: " + err.message, "danger");
    }
  };

  const handleConfirmRevoke = async () => {
    if (!deletingKey) return;
    try {
      await adminService.revokeApiKey(deletingKey.id);
      setApiKeys((prev) => prev.filter((k) => k.id !== deletingKey.id));
      addToast(`API Key ${deletingKey.id} (${deletingKey.name}) revoked and deleted from database.`, "info");
      setDeletingKey(null);
    } catch (err) {
      addToast("Failed to revoke API key: " + err.message, "danger");
    }
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
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="btn btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>
              Clear Filter
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "650px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ width: "90px" }}>KEY REF</th>
                <th>APPLICATION NAME</th>
                <th>API KEY TOKEN</th>
                <th>RATE LIMIT</th>
                <th>DATE GENERATED</th>
                <th>STATUS</th>
                <th style={{ width: "130px" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                    No active API keys found in database.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((k) => (
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
                      <Badge variant={k.status === "Active" ? "emerald" : "zinc"}>{k.status}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setViewingKey(k)}
                          title="View API Key Details"
                          style={{ width: "30px", height: "30px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", color: "#0284C7", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditingKey({ ...k })}
                          title="Edit API Key"
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
                          <Edit2 size={13} />
                        </button>
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
                ))
              )}
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
                <label className="form-label">Application / Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCADA Ingestion Bridge"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Rate Limit Ceiling</label>
                <select
                  className="form-select"
                  value={newKeyRate}
                  onChange={(e) => setNewKeyRate(e.target.value)}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="250 req/min">250 req / min (Standard Microservice)</option>
                  <option value="500 req/min">500 req / min (Default Integration)</option>
                  <option value="1,000 req/min">1,000 req / min (High Throughput SCADA)</option>
                  <option value="5,000 req/min">5,000 req / min (Cluster Telemetry Gateway)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Generate Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT KEY MODAL */}
      {editingKey && (
        <div className="modal-backdrop" onClick={() => setEditingKey(null)}>
          <div className="modal-content" style={{ maxWidth: "480px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                Edit API Key: {editingKey.id}
              </h2>
              <button onClick={() => setEditingKey(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Application / Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingKey.name}
                  onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                  className="form-input"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              </div>

              <div>
                <label className="form-label">Rate Limit Ceiling</label>
                <select
                  className="form-select"
                  value={editingKey.rateLimit}
                  onChange={(e) => setEditingKey({ ...editingKey, rateLimit: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="250 req/min">250 req / min (Standard Microservice)</option>
                  <option value="500 req/min">500 req / min (Default Integration)</option>
                  <option value="1,000 req/min">1,000 req / min (High Throughput SCADA)</option>
                  <option value="5,000 req/min">5,000 req / min (Cluster Telemetry Gateway)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingKey.status}
                  onChange={(e) => setEditingKey({ ...editingKey, status: e.target.value })}
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setEditingKey(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM REVOKE MODAL */}
      {deletingKey && (
        <div className="modal-backdrop" onClick={() => setDeletingKey(null)}>
          <div className="modal-content" style={{ maxWidth: "450px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Revoke & Delete API Key</h2>
              </div>
              <button onClick={() => setDeletingKey(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                Are you sure you want to permanently revoke key <strong>{deletingKey.id}</strong> ({deletingKey.name})? Any service or external script currently authenticating with this key will immediately be rejected.
              </p>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingKey(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmRevoke} style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}>Revoke & Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW API KEY MODAL */}
      {viewingKey && (
        <div className="modal-backdrop" onClick={() => setViewingKey(null)}>
          <div className="modal-content" style={{ maxWidth: "500px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <KeyRound size={18} color="#C89547" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>API Key Details</h2>
              </div>
              <button onClick={() => setViewingKey(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Key Ref</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#8C5B23", fontFamily: "var(--font-mono)" }}>{viewingKey.id}</div>
                </div>
                <Badge variant={viewingKey.status === "Active" ? "emerald" : "zinc"}>{viewingKey.status}</Badge>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Application Name</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>{viewingKey.name}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>API Token (Masked)</div>
                <code style={{ fontSize: "12px", color: "#059669", fontFamily: "var(--font-mono)", fontWeight: 700, display: "block", marginTop: "4px", padding: "8px 12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>{viewingKey.keyMasked}</code>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Rate Limit</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0284C7", fontFamily: "var(--font-mono)", marginTop: "4px" }}>{viewingKey.rateLimit}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Date Generated</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{viewingKey.created}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <Button variant="secondary" onClick={() => setViewingKey(null)}>Close</Button>
                <Button variant="primary" onClick={() => { addToast(`Key token for ${viewingKey.name} copied!`, "info"); setViewingKey(null); }}>Copy Token</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

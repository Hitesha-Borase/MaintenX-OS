import React, { useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Lock,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function APIsIntegrationPage() {
  const { addToast } = useApp();

  const [apiKeys, setApiKeys] = useState([
    { id: "KEY-01", name: "SCADA Production Telemetry Ingest", keyMasked: "mfg_live_9482••••••••••••••••", rateLimit: "1,000 req/min", created: "2026-08-15", status: "Active" },
    { id: "KEY-02", name: "Warehouse WMS Pallet Sync", keyMasked: "wms_live_7104••••••••••••••••", rateLimit: "250 req/min", created: "2026-08-20", status: "Active" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName) {
      addToast("Please provide application name", "warning");
      return;
    }
    const created = {
      id: `KEY-0${apiKeys.length + 1}`,
      name: newKeyName,
      keyMasked: `key_live_${Math.floor(1000 + Math.random() * 9000)}••••••••••••••••`,
      rateLimit: "500 req/min",
      created: new Date().toISOString().substring(0, 10),
      status: "Active"
    };
    setApiKeys([...apiKeys, created]);
    addToast(`API Key "${created.name}" generated!`, "success");
    setIsModalOpen(false);
    setNewKeyName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              REST APIs & Webhook Key Management
            </h1>
            <Badge variant="emerald">OpenAPI 3.1 Gateway</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Programmatic machine-to-machine authentication tokens, webhook subscribers, and rate limiting policies.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Generate API Key
          </Button>
        </div>
      </div>

      {/* Keys Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Key Ref</th>
                <th>Application Name</th>
                <th>API Key Token</th>
                <th>Rate Limit</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{k.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{k.name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: "11px", color: "#34D399" }}>{k.keyMasked}</code>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{k.rateLimit}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{k.created}</td>
                  <td>
                    <Badge variant="emerald">{k.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                      onClick={() => addToast("API Key copied to clipboard!", "info")}
                    >
                      Copy
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                Generate Machine API Key
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateKey} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="form-label">Application Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MES Automated Quality Vision Inspection"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
    </div>
  );
}

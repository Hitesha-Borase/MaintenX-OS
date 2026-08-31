import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  Check,
  X,
  Layers,
  Lock,
  RotateCcw
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useApp } from "../../../context/AppContext";

export function PermissionsMatrixPage() {
  const { addToast } = useApp();

  const [selectedRole, setSelectedRole] = useState("Plant Manager");

  const [matrix, setMatrix] = useState({
    "Production Orders": { read: true, write: true, delete: false, approve: true, export: true },
    "Quality Holds & Release": { read: true, write: true, delete: false, approve: true, export: true },
    "Maintenance & CMMS": { read: true, write: true, delete: false, approve: true, export: true },
    "Master Data Items": { read: true, write: false, delete: false, approve: false, export: true },
    "Security & User Provisioning": { read: false, write: false, delete: false, approve: false, export: false },
    "System Integrations & APIs": { read: true, write: false, delete: false, approve: false, export: true },
    "Audit Logs": { read: true, write: false, delete: false, approve: false, export: true }
  });

  const togglePermission = (module, perm) => {
    setMatrix((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [perm]: !prev[module][perm]
      }
    }));
  };

  const handleSave = () => {
    addToast(`Permission matrix updated for ${selectedRole}!`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Granular Role Permission Matrix
            </h1>
            <Badge variant="cyan">Module Scoping</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Configure read, write, delete, electronic approval, and export rights per operational module.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Matrix Changes
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["Plant Manager", "QA Manager", "Maintenance Lead", "Operator / Line Tech"].map((r) => (
          <button
            key={r}
            className={`btn ${selectedRole === r ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSelectedRole(r)}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Permission Table */}
      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operational Module</th>
                <th style={{ textAlign: "center" }}>Read / View</th>
                <th style={{ textAlign: "center" }}>Create / Edit</th>
                <th style={{ textAlign: "center" }}>Delete</th>
                <th style={{ textAlign: "center" }}>E-Sign / Approve</th>
                <th style={{ textAlign: "center" }}>Export Data</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrix).map(([mod, perms]) => (
                <tr key={mod}>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{mod}</strong>
                  </td>
                  {["read", "write", "delete", "approve", "export"].map((p) => (
                    <td key={p} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={perms[p]}
                        onChange={() => togglePermission(mod, p)}
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#38BDF8" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

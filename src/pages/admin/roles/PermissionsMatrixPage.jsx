import React, { useState } from "react";
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  Download,
  Layers,
  AlertTriangle,
  RotateCcw,
  Check,
  X
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";

const ROLES_LIST = [
  { id: "admin", label: "Super Admin / System Administrator" },
  { id: "plant_manager", label: "Plant Manager" },
  { id: "qa_manager", label: "Quality Manager" },
  { id: "maintenance", label: "Maintenance Manager / Lead" },
  { id: "operator", label: "Line Operator" }
];

const MODULES_LIST = [
  "SKU Master",
  "BOM / Recipe",
  "Work Centers / Lines",
  "Machine Assets",
  "Employees & Skills",
  "Quality Specs",
  "Production",
  "Maintenance & CMMS",
  "Data Migration",
  "Audit Trail",
  "Executive Reports"
];

export function PermissionsMatrixPage() {
  const { rolePermissions = {}, updatePermissionMatrix } = useMasterData();
  const { addToast } = useApp();

  const [selectedRoleKey, setSelectedRoleKey] = useState("plant_manager");
  const [testModule, setTestModule] = useState("BOM / Recipe");
  const [testAction, setTestAction] = useState("delete");
  const [testResult, setTestResult] = useState(null);

  const currentRoleConfig = rolePermissions[selectedRoleKey] || { permissions: {} };

  const handleToggle = (module, action) => {
    const currentVal = !!currentRoleConfig.permissions?.[module]?.[action];
    updatePermissionMatrix(selectedRoleKey, module, action, !currentVal);
  };

  const handleTestPermission = () => {
    const allowed = !!currentRoleConfig.permissions?.[testModule]?.[testAction];
    setTestResult({
      allowed,
      message: allowed
        ? `Access Granted: "${selectedRoleKey}" has permission to "${testAction.toUpperCase()}" on "${testModule}".`
        : `Access Restricted — You don't have permission to perform "${testAction.toUpperCase()}" on "${testModule}".`
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Granular Role & Permissions Matrix
            </h1>
            <Badge variant="cyan">RBAC ACCESS ENGINE</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="primary"
            icon={Save}
            onClick={() => addToast(`Permissions matrix updated & synced across all role profiles!`, "success")}
            style={{ fontSize: "12px", padding: "7px 12px" }}
          >
            Save Matrix Configuration
          </Button>
        </div>
      </div>

      {/* KPI Tickers - 4 Responsive Cards */}
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
          title="Active Role Selected"
          value={ROLES_LIST.find((r) => r.id === selectedRoleKey)?.label.split(" / ")[0] || "Plant Manager"}
          unit="Role"
          trend={{ value: "Granular action rights active", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Governed Modules"
          value={MODULES_LIST.length.toString()}
          unit="Functional Areas"
          trend={{ value: "SKU, BOM, Asset, Line, QA scope", isPositive: true, text: "" }}
          icon={Layers}
          colorVariant="cyan"
        />
        <StatCard
          title="Action Control Scopes"
          value="5 Actions"
          unit="View / Create / Edit / Del / Approve"
          trend={{ value: "Zero-trust action authorization", isPositive: true, text: "" }}
          icon={Lock}
          colorVariant="amber"
        />
        <StatCard
          title="Audit Trail Logging"
          value="100%"
          unit="Certified"
          trend={{ value: "Dual signature verification", isPositive: true, text: "" }}
          icon={FileCheck}
          colorVariant="emerald"
        />
      </div>

      {/* Permission Verification Simulator Box */}
      <Card style={{ padding: "16px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={16} color="#B27E33" />
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
              Frontend Action Permission Tester:
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <select
              value={testModule}
              onChange={(e) => setTestModule(e.target.value)}
              className="form-input"
              style={{ height: "32px", fontSize: "12px" }}
            >
              {MODULES_LIST.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={testAction}
              onChange={(e) => setTestAction(e.target.value)}
              className="form-input"
              style={{ height: "32px", fontSize: "12px" }}
            >
              <option value="view">View</option>
              <option value="create">Create</option>
              <option value="edit">Edit</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
            </select>

            <Button variant="secondary" size="sm" onClick={handleTestPermission} style={{ fontSize: "12px" }}>
              Test Permission Access
            </Button>
          </div>
        </div>

        {testResult && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: testResult.allowed ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
              border: `1px solid ${testResult.allowed ? "rgba(5, 150, 105, 0.3)" : "rgba(220, 38, 38, 0.3)"}`,
              color: testResult.allowed ? "#059669" : "#DC2626",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {testResult.allowed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {testResult.message}
          </div>
        )}
      </Card>

      {/* Main Permissions Matrix Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Role Selector Tabs */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "14px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
          {ROLES_LIST.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRoleKey(role.id);
                setTestResult(null);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid",
                borderColor: selectedRoleKey === role.id ? "#C89547" : "var(--border-subtle)",
                backgroundColor: selectedRoleKey === role.id ? "#C89547" : "var(--bg-card-subtle)",
                color: selectedRoleKey === role.id ? "#FFFFFF" : "var(--text-primary)",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Module / Sub-System</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>View</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Create</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Edit</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Delete</th>
                <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Approve / Lock</th>
              </tr>
            </thead>
            <tbody>
              {MODULES_LIST.map((modName) => {
                const modPerms = currentRoleConfig.permissions?.[modName] || {};
                return (
                  <tr
                    key={modName}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {modName}
                      </div>
                    </td>

                    {["view", "create", "edit", "delete", "approve"].map((action) => {
                      const isChecked = !!modPerms[action];
                      return (
                        <td key={action} style={{ padding: "12px 14px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggle(modName, action)}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "#C89547",
                              cursor: "pointer"
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

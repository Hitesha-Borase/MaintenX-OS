import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info, ArrowLeft, Cpu } from "lucide-react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { useRole } from "../context/RoleContext";

export function PlaceholderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole } = useRole();

  // Try to generate a human-friendly title from the path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const pageTitle = pathParts.length > 0
    ? pathParts[pathParts.length - 1]
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Module Feature";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "40px auto", width: "100%", padding: "0 20px" }}>
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ padding: "4px 8px", fontSize: "12px", marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          {pageTitle}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
          MaintenX OS Enterprise System Module
        </p>
      </div>

      <Card style={{ padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div style={{ padding: "16px", borderRadius: "50%", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>
          <Cpu size={48} />
        </div>

        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF" }}>UI Placeholder</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px", maxWidth: "460px", lineHeight: 1.5 }}>
            The screen for <strong>{pageTitle}</strong> is currently pending implementation in the next phase. Live operational database integrations and hardware telemetry bindings will be configured here.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="secondary" onClick={() => navigate(currentRole?.defaultRoute || "/dashboard")}>
            Go to Default Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

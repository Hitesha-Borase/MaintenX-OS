import React from "react";
import { AlertOctagon, CreditCard, Eye, Headset, LogOut, ShieldAlert, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

export function TrialExpiredLockout() {
  const navigate = useNavigate();
  const { logout, currentRole } = useRole();

  const userRole = currentRole?.id || "";
  const roleName = (currentRole?.user?.role || currentRole?.label || "").toLowerCase();
  const isCompanyAdmin = userRole === "admin" || roleName.includes("admin") || roleName.includes("administrator");

  const companyName = currentRole?.user?.tenant?.name || currentRole?.user?.company || currentRole?.user?.companyName || "Your Company";
  const userDisplayName = currentRole?.user?.name || currentRole?.label || "Team Member";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          padding: "36px 30px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: "#FEF2F2",
            border: "2px solid #FCA5A5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EF4444"
          }}
        >
          {isCompanyAdmin ? <AlertOctagon size={36} /> : <ShieldAlert size={36} />}
        </div>

        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              padding: "3px 10px",
              borderRadius: "12px",
              display: "inline-block",
              marginBottom: "8px"
            }}
          >
            {isCompanyAdmin ? "Access Locked · Subscription Expired" : "Access Paused · Subscription Inactive"}
          </span>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1E293B", margin: 0 }}>
            {isCompanyAdmin ? "Your Free Trial Has Expired" : "Subscription Expired"}
          </h2>
          <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: 1.55, marginTop: "10px" }}>
            {isCompanyAdmin ? (
              "Your organization's 7-day free trial evaluation period has expired. To restore uninterrupted access to your manufacturing workspace and maintain operational workflows, please upgrade to a subscription plan."
            ) : (
              "Your organization's software subscription has expired. Access to operational dashboards and manufacturing modules has been temporarily paused."
            )}
          </p>
        </div>

        {isCompanyAdmin ? (
          <div
            style={{
              width: "100%",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "11.5px",
              color: "#92400E",
              textAlign: "left",
              lineHeight: 1.4
            }}
          >
            <strong>Data Retention:</strong> Your plant configurations, master assets, SKUs, and work order records are safely preserved. Upgrade today to resume real-time production monitoring and execution.
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "12.5px",
              color: "#991B1B",
              textAlign: "left",
              lineHeight: 1.5
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "13px", marginBottom: "6px" }}>
              <Building2 size={16} /> Contact Your System Administrator
            </div>
            <div>
              Software subscription renewals can only be processed by your organization's <strong>System Administrator</strong>. Please contact your company administrator to renew your plan and restore dashboard access.
            </div>
            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(239, 68, 68, 0.3)", fontSize: "11.5px", color: "#7F1D1D" }}>
              <strong>Organization:</strong> {companyName} &nbsp;·&nbsp; <strong>User:</strong> {userDisplayName}
            </div>
          </div>
        )}

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
          {isCompanyAdmin ? (
            <>
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #E2B670 0%, #C89547 100%)",
                  color: "#261603",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(200, 149, 71, 0.3)"
                }}
              >
                <CreditCard size={16} /> Buy Plan Now
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  onClick={() => navigate("/pricing")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#F8FAFC",
                    color: "#334155",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Eye size={14} /> View Plans
                </button>

                <button
                  onClick={() => navigate("/support")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#F8FAFC",
                    color: "#334155",
                    border: "1px solid #E2E8F0",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Headset size={14} /> Contact Support
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={() => navigate("/support")}
                style={{
                  padding: "11px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#F1F5F9",
                  color: "#1E293B",
                  border: "1px solid #CBD5E1",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <Headset size={15} /> Contact Support
              </button>

              <button
                onClick={() => logout()}
                style={{
                  padding: "11px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FEF2F2",
                  color: "#DC2626",
                  border: "1px solid #FECACA",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}

          {isCompanyAdmin && (
            <button
              onClick={() => logout()}
              style={{
                marginTop: "4px",
                background: "none",
                border: "none",
                color: "#EF4444",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "6px"
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

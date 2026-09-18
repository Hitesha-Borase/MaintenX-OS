import React, { useState } from "react";
import { Sparkles, AlertTriangle, ArrowRight, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

export function TrialBanner() {
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const [dismissed, setDismissed] = useState(false);

  // Only show for non-master admins
  if (currentRole?.id === "master_admin") return null;
  if (dismissed) return null;

  // Determine if tenant has paid subscription or is on 7-day trial
  const plan = (currentRole?.user?.tenant?.plan || currentRole?.user?.plan || localStorage.getItem("maintenx_tenant_plan") || "").toLowerCase();
  const hasPaidSub = Boolean(currentRole?.user?.tenant?.hasSubscription || currentRole?.user?.hasSubscription);
  const isEnterprise = plan.includes("enterprise") || plan.includes("complete");

  if (hasPaidSub || isEnterprise) return null;

  // Calculate remaining trial days using backend trial end date or registration date
  const trialEndStr = currentRole?.user?.tenant?.subscription?.currentPeriodEnd || currentRole?.user?.tenant?.subscriptionExpiryDate || localStorage.getItem("maintenx_trial_end");
  const registeredAtStr = currentRole?.user?.tenant?.createdAt || currentRole?.user?.createdAt || localStorage.getItem("maintenx_tenant_created");
  
  const now = new Date();
  let remainingDays = 7;
  let formattedRegDate = "";

  if (registeredAtStr) {
    const regDate = new Date(registeredAtStr);
    if (!isNaN(regDate.getTime())) {
      formattedRegDate = regDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  }

  if (trialEndStr && !isNaN(new Date(trialEndStr).getTime())) {
    const trialEnd = new Date(trialEndStr);
    const diffMs = trialEnd.getTime() - now.getTime();
    remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } else if (registeredAtStr && !isNaN(new Date(registeredAtStr).getTime())) {
    const registeredAt = new Date(registeredAtStr);
    const elapsedDays = Math.floor((now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60 * 24));
    remainingDays = Math.max(0, 7 - elapsedDays);
  }

  // If Day 8+ (expired), TrialExpiredLockout handles it
  if (remainingDays === 0) return null;

  const isUrgent = remainingDays <= 2;

  const userRole = currentRole?.id || "";
  const roleName = (currentRole?.user?.role || currentRole?.label || "").toLowerCase();
  const isCompanyAdmin = userRole === "admin" || roleName.includes("admin") || roleName.includes("administrator");

  return (
    <div
      style={{
        backgroundColor: isUrgent ? "#FEF2F2" : "rgba(200, 149, 71, 0.1)",
        borderBottom: `1px solid ${isUrgent ? "#FECACA" : "rgba(200, 149, 71, 0.25)"}`,
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        fontSize: "12px",
        color: isUrgent ? "#991B1B" : "#78350F",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            backgroundColor: isUrgent ? "#EF4444" : "#C89547",
            color: "#FFFFFF",
            padding: "2px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.02em"
          }}
        >
          {isUrgent ? <AlertTriangle size={12} /> : <Sparkles size={12} />}
          7-DAY TRIAL
        </div>

        <span>
          {isCompanyAdmin ? (
            <>
              You are on a 7-day evaluation trial{formattedRegDate ? ` (Registered: ${formattedRegDate})` : ""} with{" "}
              <strong style={{ color: isUrgent ? "#B91C1C" : "#92400E", textDecoration: "underline" }}>
                {remainingDays === 1 ? "1 day (last day)" : `${remainingDays} days`} remaining
              </strong>.
              {" "}Please upgrade your subscription to ensure continuous plant operations.
            </>
          ) : (
            <>
              Your organization is currently on a 7-day evaluation trial{formattedRegDate ? ` (Registered: ${formattedRegDate})` : ""} with{" "}
              <strong style={{ color: isUrgent ? "#B91C1C" : "#92400E", textDecoration: "underline" }}>
                {remainingDays === 1 ? "1 day (last day)" : `${remainingDays} days`} remaining
              </strong>.
            </>
          )}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {isCompanyAdmin && (
          <>
            <button
              onClick={() => navigate("/pricing")}
              style={{
                padding: "5px 12px",
                borderRadius: "6px",
                backgroundColor: isUrgent ? "#DC2626" : "#C89547",
                color: "#FFFFFF",
                border: "none",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Buy Plan Now <ArrowRight size={12} />
            </button>

            <button
              onClick={() => navigate("/pricing")}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                color: isUrgent ? "#991B1B" : "#8C5B23",
                border: `1px solid ${isUrgent ? "#FCA5A5" : "rgba(200, 149, 71, 0.4)"}`,
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              View Plans
            </button>
          </>
        )}

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "none",
            color: isUrgent ? "#991B1B" : "#8C5B23",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center"
          }}
          title="Dismiss Banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TrialBanner } from "../common/TrialBanner";
import { TrialExpiredLockout } from "../common/TrialExpiredLockout";
import { GlobalSearchModal } from "../common/GlobalSearchModal";
import { QRModal } from "../common/QRModal";
import { QuickActionDrawer } from "../common/QuickActionDrawer";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { useApp } from "../../context/AppContext";
import { useRole } from "../../context/RoleContext";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";

export function AppLayout() {
  const { toasts = [], removeToast } = useApp();
  const { currentRole } = useRole();
  const location = useLocation();

  // Comprehensive Subscription & Trial Expiration Check
  let isSubscriptionExpired = false;
  if (currentRole?.id !== "master_admin") {
    const tenant = currentRole?.user?.tenant;
    const plan = (tenant?.plan || currentRole?.user?.plan || localStorage.getItem("maintenx_tenant_plan") || "").toLowerCase();
    const isEnterprise = plan.includes("enterprise") || plan.includes("complete") || currentRole?.user?.companyName?.includes("BeverageCorp");

    const subStatus = (tenant?.subscription?.status || tenant?.subscriptionStatus || localStorage.getItem("maintenx_subscription_status") || "").toUpperCase();
    const hasPaidSub = Boolean(tenant?.hasSubscription || currentRole?.user?.hasSubscription || subStatus === "ACTIVE") && subStatus !== "TRIAL";
    const subExpiryStr = tenant?.subscriptionExpiryDate || tenant?.subscription?.currentPeriodEnd || localStorage.getItem("maintenx_trial_end");

    // 1. Paid plan expiration check
    const isPaidSubExpired = hasPaidSub && (
      subStatus === "EXPIRED" || 
      subStatus === "CANCELLED" || 
      (subExpiryStr && new Date(subExpiryStr) < new Date())
    );

    // 2. 7-Day Free Trial expiration check
    let isTrialPeriodExpired = false;
    if (!hasPaidSub && !isEnterprise) {
      const registeredAtStr = tenant?.createdAt || currentRole?.user?.createdAt || localStorage.getItem("maintenx_tenant_created");
      if (registeredAtStr) {
        const registeredAt = new Date(registeredAtStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
          isTrialPeriodExpired = true;
        }
      }
    }

    if (isPaidSubExpired || isTrialPeriodExpired) {
      // When subscription or free trial has expired, all operational dashboards and console screens are strictly locked out.
      // Only /pricing (to renew or upgrade plan) and /support (to contact support) remain accessible.
      if (location.pathname.startsWith("/pricing") || location.pathname.startsWith("/support")) {
        isSubscriptionExpired = false;
      } else {
        isSubscriptionExpired = true;
      }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", maxWidth: "100vw", backgroundColor: "var(--bg-main)", overflow: "hidden", position: "relative" }}>
      {/* Global Header - Full Width */}
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      {isSubscriptionExpired && <TrialExpiredLockout />}

      <div className="app-container" style={{ display: "flex", flex: 1, minHeight: 0, width: "100%", maxWidth: "100vw", position: "relative", overflow: "hidden" }}>
        {/* Global Sidebar */}
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>

        {/* Content area beside Sidebar with Trial Banner */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
          <ErrorBoundary>
            <TrialBanner />
          </ErrorBoundary>

          {/* Dynamic Page Content wrapper */}
          <main className="page-content-wrapper" style={{ flex: 1, minWidth: 0, width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal />
      <QRModal />
      <QuickActionDrawer />

      {/* Toast Notification Stack */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 120,
          maxWidth: "360px",
          width: "calc(100vw - 40px)"
        }}
      >
        {toasts.map((t) => {
          const isError = t.type === "error" || t.type === "danger";
          const isWarn = t.type === "warning";
          const iconColor = isError ? "#DC2626" : isWarn ? "#D97706" : "#059669";

          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-highlight)",
                boxShadow: "0 8px 24px rgba(70, 45, 15, 0.15)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                animation: "slideInRight 0.2s ease-out"
              }}
            >
              {isError ? <AlertOctagon size={16} color={iconColor} style={{ flexShrink: 0 }} /> : isWarn ? <AlertTriangle size={16} color={iconColor} style={{ flexShrink: 0 }} /> : <CheckCircle2 size={16} color={iconColor} style={{ flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px"
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

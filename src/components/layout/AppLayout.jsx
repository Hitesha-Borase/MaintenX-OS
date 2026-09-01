import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { GlobalSearchModal } from "../common/GlobalSearchModal";
import { QRModal } from "../common/QRModal";
import { QuickActionDrawer } from "../common/QuickActionDrawer";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from "lucide-react";

export function AppLayout() {
  const { toasts = [], removeToast } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", maxWidth: "100vw", backgroundColor: "var(--bg-main)", overflow: "hidden", position: "relative" }}>
      {/* Global Header - Full Width */}
      <Header />

      <div className="app-container" style={{ display: "flex", flex: 1, minHeight: 0, width: "100%", maxWidth: "100vw", position: "relative", overflow: "hidden" }}>
        {/* Global Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content wrapper */}
        <main className="page-content-wrapper" style={{ flex: 1, minWidth: 0, width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden" }}>
          <Outlet />
        </main>
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

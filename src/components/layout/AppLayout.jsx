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
  const { toasts, removeToast } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100vw", backgroundColor: "var(--bg-main)" }}>
      {/* Global Header - Full Width */}
      <Header />

      <div className="app-container" style={{ display: "flex", flex: 1, minHeight: 0, width: "100%" }}>
        {/* Global Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content wrapper */}
        <main className="page-content-wrapper" style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
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
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 120,
          maxWidth: "380px"
        }}
      >
        {toasts.map((t) => {
          const isError = t.type === "error" || t.type === "danger";
          const isWarn = t.type === "warning";
          const iconColor = isError ? "#EF4444" : isWarn ? "#F59E0B" : "#10B981";

          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: "#0F172A",
                border: `1px solid ${iconColor}`,
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                color: "#FFFFFF",
                fontSize: "13px",
                animation: "fadeIn 0.2s ease"
              }}
            >
              {isError ? (
                <AlertOctagon size={18} color="#EF4444" />
              ) : isWarn ? (
                <AlertTriangle size={18} color="#F59E0B" />
              ) : (
                <CheckCircle2 size={18} color="#10B981" />
              )}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer" }}
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

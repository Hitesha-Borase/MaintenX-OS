import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "540px"
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="drawer-content"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px" }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close Drawer">
            <X size={18} />
          </Button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "var(--bg-card-subtle)"
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

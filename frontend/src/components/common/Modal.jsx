import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "680px"
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
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-card-subtle)"
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close Modal">
            <X size={18} />
          </Button>
        </div>

        <div style={{ padding: "16px", overflowY: "auto", maxHeight: "calc(85vh - 140px)" }}>
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

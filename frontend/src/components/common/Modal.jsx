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
        style={{
          maxWidth,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-card-subtle)",
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
            {subtitle && (
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", marginBottom: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close Modal">
            <X size={18} />
          </Button>
        </div>

        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: "1 1 auto",
            minHeight: 0,
            WebkitOverflowScrolling: "touch"
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "var(--bg-card-subtle)",
              flexShrink: 0
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

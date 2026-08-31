import React from "react";

export function Card({ children, className = "", interactive = false, onClick, style = {} }) {
  return (
    <div
      className={`flow-card ${interactive ? "flow-card-interactive" : ""} ${className}`}
      onClick={onClick}
      style={{ cursor: interactive ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}

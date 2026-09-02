import React from "react";

export function Button({
  children,
  variant = "secondary", // primary, secondary, danger, success, ghost
  size = "md", // sm, md, lg
  icon: Icon,
  iconRight: IconRight,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  title,
  style
}) {
  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    ghost: "btn-ghost"
  }[variant] || "btn-secondary";

  const sizeStyles = {
    sm: { padding: "5px 10px", fontSize: "12px" },
    md: { padding: "8px 16px", fontSize: "13px" },
    lg: { padding: "10px 20px", fontSize: "14px" }
  }[size];

  // Strip duplicate leading "+" text when an Icon component is already provided
  const sanitizeChildren = (child) => {
    if (!Icon) return child;
    if (typeof child === "string") {
      return child.replace(/^\+\s*/, "");
    }
    if (Array.isArray(child)) {
      return child.map((item, idx) =>
        idx === 0 && typeof item === "string" ? item.replace(/^\+\s*/, "") : item
      );
    }
    return child;
  };

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`}
      style={{ ...sizeStyles, ...style }}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {sanitizeChildren(children)}
      {IconRight && <IconRight size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

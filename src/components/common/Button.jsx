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
  title
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

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`}
      style={sizeStyles}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
      {IconRight && <IconRight size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

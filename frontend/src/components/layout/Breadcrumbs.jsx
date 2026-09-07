import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const formatBreadcrumb = (segment) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
      <Link to="/" style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Home size={13} />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} />
            {isLast ? (
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {formatBreadcrumb(value)}
              </span>
            ) : (
              <Link to={to} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                {formatBreadcrumb(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

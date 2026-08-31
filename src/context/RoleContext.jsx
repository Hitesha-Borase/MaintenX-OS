import React, { createContext, useContext, useState, useEffect } from "react";

export const ROLES = [
  { id: "operator", label: "Line Operator", icon: "Activity", defaultRoute: "/operator/dashboard" },
  { id: "line_lead", label: "Line Lead", icon: "Briefcase", defaultRoute: "/production/line-dashboard" },
  { id: "supervisor", label: "Operations Supervisor", icon: "Users", defaultRoute: "/production/operations-dashboard" },
  { id: "planner", label: "Planner / Scheduler", icon: "CalendarRange", defaultRoute: "/planning" },
  { id: "warehouse", label: "Warehouse / Receiver", icon: "Package", defaultRoute: "/inventory" },
  { id: "quality", label: "Quality / QA", icon: "ShieldCheck", defaultRoute: "/quality" },
  { id: "maintenance", label: "Maintenance", icon: "Wrench", defaultRoute: "/maintenance" },
  { id: "ci_engineer", label: "CI / Engineering", icon: "Settings", defaultRoute: "/engineering/dashboard" },
  { id: "plant_manager", label: "Plant Manager", icon: "Building2", defaultRoute: "/command-center" },
  { id: "executive", label: "Executive", icon: "Briefcase", defaultRoute: "/executive/portfolio" },
  { id: "admin", label: "System Administrator", icon: "ShieldAlert", defaultRoute: "/admin/console" }
];

export const NAVIGATION_CONFIG = {
  operator: [
    { label: "Dashboard", path: "/operator/dashboard", icon: "LayoutDashboard" },
    { label: "My Jobs", path: "/operator/my-jobs", icon: "Briefcase" },
    { label: "Work Instructions", path: "/operator/work-instructions", icon: "FileText" },
    { label: "Production Entry", path: "/operator/production-entry", icon: "Factory" },
    { label: "Downtime & Loss", path: "/operator/downtime-loss", icon: "AlertTriangle" },
    { label: "Quality Checks", path: "/operator/quality-checks", icon: "ShieldCheck" },
    { label: "Material Request", path: "/operator/material-request", icon: "Package" },
    { label: "Barcode / QR Scan", path: "/operator/barcode-scan", icon: "Smartphone" },
    { label: "Report Issue", path: "/operator/report-issue", icon: "ShieldAlert" },
    { label: "Shift Handoff", path: "/operator/shift-handoff", icon: "Users" },
    { label: "Notifications", path: "/operator/notifications", icon: "Bell" },
    { label: "Profile", path: "/operator/profile", icon: "User" }
  ],
  line_lead: [
    {
      group: "Production",
      items: [
        { label: "Line Dashboard", path: "/production/line-dashboard", icon: "Factory", isPlaceholder: true },
        { label: "Shift Report", path: "/production/shift-report", icon: "FileText", isPlaceholder: true },
        { label: "Escalations", path: "/exception-control-tower", icon: "AlertTriangle" }
      ]
    },
    {
      group: "Quality",
      items: [
        { label: "Escalations", path: "/exception-control-tower", icon: "AlertTriangle" }
      ]
    }
  ],
  supervisor: [
    {
      group: "Production",
      items: [
        { label: "Operations Dashboard", path: "/production/operations-dashboard", icon: "Factory", isPlaceholder: true },
        { label: "Shift Plan", path: "/production/shift-plan", icon: "CalendarRange", isPlaceholder: true },
        { label: "Shift Report", path: "/production/shift-report", icon: "FileText", isPlaceholder: true }
      ]
    },
    {
      group: "Labour",
      items: [
        { label: "Resource Matrix", path: "/labour", icon: "Users" }
      ]
    },
    {
      group: "CMMS",
      items: [
        { label: "Work Orders", path: "/maintenance/work-orders", icon: "Wrench" }
      ]
    }
  ],
  planner: [
    {
      group: "Planning",
      items: [
        { label: "Planning Dashboard", path: "/planning", icon: "CalendarRange" },
        { label: "Schedule", path: "/planning", icon: "CalendarRange" },
        { label: "MRP", path: "/planning", icon: "Layers" }
      ]
    },
    {
      group: "CMMS",
      items: [
        { label: "PM Scheduling", path: "/maintenance/pm-schedules", icon: "Clock" },
        { label: "Work Orders", path: "/maintenance/work-orders", icon: "Wrench" }
      ]
    }
  ],
  warehouse: [
    {
      group: "Inventory",
      items: [
        { label: "Warehouse Dashboard", path: "/inventory", icon: "Package" },
        { label: "Receiving", path: "/inventory", icon: "Package" },
        { label: "Picking", path: "/inventory", icon: "Package" }
      ]
    },
    {
      group: "CMMS",
      items: [
        { label: "Spare Parts", path: "/maintenance/spare-parts", icon: "Boxes" }
      ]
    }
  ],
  quality: [
    {
      group: "Quality",
      items: [
        { label: "Quality Dashboard", path: "/quality", icon: "ShieldCheck" },
        { label: "Holds", path: "/quality", icon: "ShieldAlert" },
        { label: "CCP", path: "/quality", icon: "FileCheck" }
      ]
    },
    {
      group: "CMMS",
      items: [
        { label: "Calibration", path: "/maintenance/calibration", icon: "Clock" }
      ]
    }
  ],
  maintenance: [
    {
      group: "CMMS",
      items: [
        { label: "Dashboard", path: "/maintenance", icon: "Wrench" },
        { label: "Asset 360°", path: "/maintenance/assets", icon: "Wrench" },
        { label: "Work Orders", path: "/maintenance/work-orders", icon: "Wrench" },
        { label: "PM Scheduling", path: "/maintenance/pm-schedules", icon: "Wrench" },
        { label: "PM Checklists", path: "/maintenance/pm-checklists", icon: "Wrench" },
        { label: "Breakdowns", path: "/maintenance/breakdowns", icon: "Wrench" },
        { label: "Troubleshooting", path: "/maintenance/troubleshooting", icon: "Wrench" },
        { label: "Spare Parts", path: "/maintenance/spare-parts", icon: "Wrench" },
        { label: "Calibration", path: "/maintenance/calibration", icon: "Wrench" },
        { label: "Failure Codes", path: "/maintenance/failure-codes", icon: "Wrench" },
        { label: "Maintenance KPIs", path: "/maintenance/reliability", icon: "Wrench" },
        { label: "Repeat Failures", path: "/maintenance/repeat-failures", icon: "Wrench" },
        { label: "Verified Solutions", path: "/maintenance/verified-solutions", icon: "Wrench" }
      ]
    }
  ],
  ci_engineer: [
    {
      group: "CMMS",
      items: [
        { label: "Dashboard", path: "/maintenance", icon: "Wrench" },
        { label: "Maintenance KPIs", path: "/maintenance", icon: "Wrench" },
        { label: "Repeat Failures", path: "/maintenance/repeat-failures", icon: "Wrench" },
        { label: "Verified Solutions", path: "/maintenance/verified-solutions", icon: "Wrench" },
        { label: "RCA Integration", path: "/rca-capa", icon: "SearchCode" }
      ]
    },
    {
      group: "Analytics",
      items: [
        { label: "Reliability Analytics", path: "/maintenance/reliability", icon: "LineChart" }
      ]
    }
  ],
  plant_manager: [
    {
      group: "Dashboards",
      items: [
        { label: "Command Center", path: "/command-center", icon: "LayoutDashboard" }
      ]
    },
    { label: "Production", path: "/production", icon: "Factory" },
    { label: "Quality", path: "/quality", icon: "ShieldCheck" },
    { label: "Inventory", path: "/inventory", icon: "Package" },
    { label: "Labour", path: "/labour", icon: "Users" },
    { label: "CMMS Dashboard", path: "/maintenance", icon: "Wrench" },
    { label: "Reports", path: "/reports", icon: "FileSpreadsheet" }
  ],
  executive: [
    {
      group: "Dashboards",
      items: [
        { label: "Executive Portfolio", path: "/executive/portfolio", icon: "LayoutDashboard", isPlaceholder: true }
      ]
    },
    { label: "Reports", path: "/reports", icon: "FileSpreadsheet" }
  ],
  admin: [
    {
      group: "Settings",
      items: [
        { label: "Admin Console", path: "/admin/console", icon: "Cpu", isPlaceholder: true },
        { label: "Users", path: "/admin/users", icon: "Users", isPlaceholder: true },
        { label: "Roles & Permissions", path: "/admin/roles", icon: "ShieldCheck", isPlaceholder: true },
        { label: "System Configuration", path: "/admin/config", icon: "Cpu", isPlaceholder: true },
        { label: "Devices / Integrations", path: "/admin/devices", icon: "Cpu", isPlaceholder: true }
      ]
    }
  ]
};

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem("flowstate_current_role");
    if (saved) {
      const parsed = JSON.parse(saved);
      const exists = ROLES.some(r => r.id === parsed.id);
      if (exists) return parsed;
    }
    return ROLES[8]; // Default: Plant Manager
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("flowstate_auth") === "true";
  });

  useEffect(() => {
    localStorage.setItem("flowstate_current_role", JSON.stringify(currentRole));
  }, [currentRole]);

  const login = (roleId) => {
    setRoleById(roleId);
    setIsAuthenticated(true);
    localStorage.setItem("flowstate_auth", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("flowstate_auth");
  };

  const setRoleById = (roleId) => {
    const found = ROLES.find((r) => r.id === roleId);
    if (found) {
      setCurrentRole(found);
    }
  };

  const canAccessPath = (path) => {
    if (currentRole.id === "admin") return true;

    const config = NAVIGATION_CONFIG[currentRole.id];
    if (!config) return false;

    const allowedPaths = [];
    config.forEach((item) => {
      if (item.group) {
        item.items.forEach((subItem) => {
          allowedPaths.push(subItem.path);
        });
      } else {
        allowedPaths.push(item.path);
      }
    });

    if (currentRole.defaultRoute) {
      allowedPaths.push(currentRole.defaultRoute);
    }

    allowedPaths.push("/");

    const cleanPath = path.split("?")[0].split("#")[0];

    return allowedPaths.some((p) => {
      if (p === "/") return cleanPath === "/";
      return cleanPath.startsWith(p);
    });
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        setRoleById,
        ROLES,
        canAccessPath,
        isAuthenticated,
        login,
        logout,
        NAVIGATION_CONFIG
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);

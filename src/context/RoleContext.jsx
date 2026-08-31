import React, { createContext, useContext, useState, useEffect } from "react";

export const ROLES = [
  { id: "executive", label: "Executive / VP Operations", icon: "Briefcase", defaultRoute: "/command-center" },
  { id: "plant_manager", label: "Plant Manager", icon: "Building2", defaultRoute: "/command-center" },
  { id: "dept_manager", label: "Department Manager", icon: "FolderKanban", defaultRoute: "/production" },
  { id: "supervisor", label: "Operations Supervisor", icon: "Users", defaultRoute: "/command-center" },
  { id: "operator", label: "Line Operator", icon: "Activity", defaultRoute: "/shopfloor" },
  { id: "quality", label: "Quality Team (QA/QC)", icon: "ShieldCheck", defaultRoute: "/quality" },
  { id: "maintenance", label: "Maintenance & Reliability", icon: "Wrench", defaultRoute: "/maintenance" },
  { id: "warehouse", label: "Warehouse & Logistics", icon: "Package", defaultRoute: "/inventory" },
  { id: "purchasing", label: "Purchasing & Supply Chain", icon: "ShoppingBag", defaultRoute: "/purchasing" },
  { id: "planner", label: "Planner / Scheduler (APS)", icon: "CalendarRange", defaultRoute: "/planning" },
  { id: "hr", label: "HR / Training Lead", icon: "GraduationCap", defaultRoute: "/labour" },
  { id: "admin", label: "IT / System Administrator", icon: "ShieldAlert", defaultRoute: "/command-center" }
];

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem("flowstate_current_role");
    return saved ? JSON.parse(saved) : ROLES[1]; // default Plant Manager
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

  // Role permissions helper
  const canAccessModule = (moduleKey) => {
    if (currentRole.id === "admin" || currentRole.id === "plant_manager" || currentRole.id === "executive") {
      return true;
    }
    switch (moduleKey) {
      case "dashboards":
        return true;
      case "cmms":
        return ["maintenance", "supervisor", "plant_manager", "operator"].includes(currentRole.id);
      case "production":
        return ["supervisor", "operator", "dept_manager", "planner", "quality"].includes(currentRole.id);
      case "planning":
        return ["planner", "dept_manager", "purchasing"].includes(currentRole.id);
      case "quality":
        return ["quality", "supervisor", "operator"].includes(currentRole.id);
      case "inventory":
        return ["warehouse", "purchasing", "supervisor"].includes(currentRole.id);
      case "purchasing":
        return ["purchasing", "planner", "warehouse"].includes(currentRole.id);
      case "labour":
        return ["hr", "supervisor", "dept_manager"].includes(currentRole.id);
      case "traceability":
      case "costing":
      case "rca":
      case "documents":
      case "reports":
        return true;
      case "shopfloor":
        return ["operator", "maintenance", "quality", "warehouse", "supervisor"].includes(currentRole.id);
      default:
        return true;
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, setRoleById, ROLES, canAccessModule, isAuthenticated, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);

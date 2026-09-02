import React, { createContext, useContext, useState, useEffect } from "react";

export const ROLES = [
  { id: "admin", label: "System Administrator", icon: "ShieldAlert", defaultRoute: "/admin/console", step: "1. Setup" },
  { id: "planner", label: "Planner / Scheduler", icon: "CalendarRange", defaultRoute: "/planner/dashboard", step: "2. Plan" },
  { id: "warehouse", label: "Warehouse / Receiver", icon: "Package", defaultRoute: "/warehouse/dashboard", step: "3. Materials" },
  { id: "maintenance", label: "Maintenance", icon: "Wrench", defaultRoute: "/maintenance", step: "4. Machines" },
  { id: "supervisor", label: "Operations Supervisor", icon: "Users", defaultRoute: "/supervisor/dashboard", step: "5. Shift" },
  { id: "line_lead", label: "Line Lead", icon: "Briefcase", defaultRoute: "/linelead/dashboard", step: "6. Line" },
  { id: "operator", label: "Line Operator", icon: "Activity", defaultRoute: "/operator/dashboard", step: "7. Production" },
  { id: "quality", label: "Quality / QA", icon: "ShieldCheck", defaultRoute: "/quality/dashboard", step: "8. Quality" },
  { id: "ci_engineer", label: "CI / Engineering", icon: "Settings", defaultRoute: "/ci/dashboard", step: "9. Kaizen" },
  { id: "plant_manager", label: "Plant Manager", icon: "Building2", defaultRoute: "/command-center", step: "10. Plant" },
  { id: "executive", label: "Executive", icon: "Briefcase", defaultRoute: "/executive/dashboard", step: "11. Enterprise" }
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
    { label: "Dashboard", path: "/linelead/dashboard", icon: "LayoutDashboard" },
    { label: "H/B Management", path: "/linelead/hb-management", icon: "Clock" },
    { label: "Downtime & Loss", path: "/linelead/downtime-loss", icon: "AlertTriangle" },
    { label: "Changeover", path: "/linelead/changeover", icon: "Layers" },
    { label: "Staffing", path: "/linelead/staffing", icon: "Users" },
    { label: "Production Performance", path: "/linelead/production-performance", icon: "LineChart" },
    { label: "Recovery Management", path: "/linelead/recovery-management", icon: "Zap" },
    { label: "Escalations", path: "/linelead/escalations", icon: "AlertOctagon" },
    { label: "Notifications", path: "/linelead/notifications", icon: "Bell" },
    { label: "Profile", path: "/linelead/profile", icon: "User" }
  ],
  supervisor: [
    { label: "Dashboard", path: "/supervisor/dashboard", icon: "LayoutDashboard" },
    { label: "Department Schedule", path: "/supervisor/dept-schedule", icon: "CalendarRange" },
    { label: "H/B Management", path: "/supervisor/hb-management", icon: "Clock" },
    {
      group: "Production",
      items: [
        { label: "Production Performance", path: "/supervisor/production/performance", icon: "LineChart" }
      ]
    },
    {
      group: "Labour",
      items: [
        { label: "Workforce", path: "/supervisor/labour/workforce", icon: "Users" },
        { label: "Staffing", path: "/supervisor/labour/staffing", icon: "Users" },
        { label: "Labour Time", path: "/supervisor/labour/time", icon: "Clock" },
        { label: "Skills / Training", path: "/supervisor/labour/skills", icon: "Settings" }
      ]
    },
    {
      group: "Quality",
      items: [
        { label: "Holds", path: "/supervisor/quality/holds", icon: "ShieldAlert" }
      ]
    },
    { label: "Recovery", path: "/supervisor/recovery", icon: "Zap" },
    { label: "Shift Handoff", path: "/supervisor/shift-handoff", icon: "Users" },
    { label: "Approvals", path: "/supervisor/approvals", icon: "FileCheck" },
    { label: "Reports", path: "/supervisor/reports", icon: "FileSpreadsheet" },
    { label: "Notifications", path: "/supervisor/notifications", icon: "Bell" },
    { label: "Profile", path: "/supervisor/profile", icon: "User" }
  ],
  planner: [
    { label: "Dashboard", path: "/planner/dashboard", icon: "LayoutDashboard" },
    {
      group: "Demand",
      items: [
        { label: "Customer Orders", path: "/planner/demand/customer-orders", icon: "FileText" },
        { label: "Order Status", path: "/planner/demand/order-status", icon: "ShieldAlert" },
        { label: "Shipments Demand", path: "/planner/demand/shipments", icon: "ShoppingBag" }
      ]
    },
    {
      group: "Forecast",
      items: [
        { label: "Demand History", path: "/planner/forecast/history", icon: "Clock" },
        { label: "Forecast", path: "/planner/forecast/run", icon: "LineChart" },
        { label: "Forecast Overrides", path: "/planner/forecast/overrides", icon: "Settings" },
        { label: "Promotion / Event Uplift", path: "/planner/forecast/promotions", icon: "TrendingUp" }
      ]
    },
    {
      group: "MRP",
      items: [
        { label: "Net Requirements", path: "/planner/mrp/net-requirements", icon: "Layers" },
        { label: "Material Shortages", path: "/planner/mrp/shortages", icon: "AlertTriangle" },
        { label: "Safety Stock", path: "/planner/mrp/safety-stock", icon: "Package" },
        { label: "Supply & Demand", path: "/planner/mrp/supply-demand", icon: "Boxes" },
        { label: "Service Risk", path: "/planner/mrp/service-risk", icon: "ShieldAlert" }
      ]
    },
    {
      group: "APS / Scheduling",
      items: [
        { label: "Capacity Planning", path: "/planner/aps/capacity", icon: "CalendarRange" },
        { label: "APS Scheduler", path: "/planner/aps/scheduler", icon: "BrainCircuit" },
        { label: "Work Center Capacity", path: "/planner/aps/work-centers", icon: "Factory" },
        { label: "Changeovers", path: "/planner/aps/changeovers", icon: "Layers" },
        { label: "Schedule Versions", path: "/planner/aps/versions", icon: "FileText" },
        { label: "Schedule Validation", path: "/planner/aps/validation", icon: "ShieldCheck" },
        { label: "Publish Schedule", path: "/planner/aps/publish", icon: "FileCheck" }
      ]
    },
    { label: "Production Orders", path: "/planner/production-orders", icon: "Factory" },
    { label: "Material Reservation", path: "/planner/material-reservation", icon: "Package" },
    { label: "Planning Reports", path: "/planner/planning-reports", icon: "FileSpreadsheet" },
    { label: "AI Planning Assistant", path: "/planner/ai-assistant", icon: "BrainCircuit" },
    { label: "Notifications", path: "/planner/notifications", icon: "Bell" },
    { label: "Profile", path: "/planner/profile", icon: "User" }
  ],
  warehouse: [
    { label: "Dashboard", path: "/warehouse/dashboard", icon: "LayoutDashboard" },
    {
      group: "Receiving",
      items: [
        { label: "Incoming Deliveries", path: "/warehouse/receiving/incoming", icon: "Clock" },
        { label: "Receive Material", path: "/warehouse/receiving/receive", icon: "FileText" },
        { label: "Barcode / QR Scan", path: "/warehouse/receiving/scan", icon: "Smartphone" }
      ]
    },
    {
      group: "Inventory",
      items: [
        { label: "Raw Materials", path: "/warehouse/inventory/raw", icon: "Package" },
        { label: "Packaging Materials", path: "/warehouse/inventory/packaging", icon: "Layers" },
        { label: "Finished Goods", path: "/warehouse/inventory/finished-goods", icon: "ShoppingBag" },
        { label: "Lots", path: "/warehouse/inventory/lots", icon: "Layers" },
        { label: "Inventory Status", path: "/warehouse/inventory/status", icon: "ShieldAlert" }
      ]
    },
    {
      group: "Locations",
      items: [
        { label: "Warehouses", path: "/warehouse/locations/list", icon: "Factory" },
        { label: "Bins / Racks", path: "/warehouse/locations/bins", icon: "Layers" },
        { label: "Staging", path: "/warehouse/locations/staging", icon: "CalendarRange" },
        { label: "Location Transfers", path: "/warehouse/locations/transfers", icon: "Shuffle" }
      ]
    },
    {
      group: "Inventory Operations",
      items: [
        { label: "Material Movements", path: "/warehouse/ops/movements", icon: "Clock" },
        { label: "Transfers", path: "/warehouse/ops/transfers", icon: "Shuffle" },
        { label: "Cycle Counts", path: "/warehouse/ops/cycle-counts", icon: "CheckCircle" },
        { label: "Adjustments", path: "/warehouse/ops/adjustments", icon: "Settings" }
      ]
    },
    {
      group: "Picking",
      items: [
        { label: "Pick Lists", path: "/warehouse/picking/lists", icon: "FileText" },
        { label: "Picking Execution", path: "/warehouse/picking/execution", icon: "CheckSquare" }
      ]
    },
    { label: "Pallets & Containers", path: "/warehouse/pallets-containers", icon: "Boxes" },
    {
      group: "Shipping",
      items: [
        { label: "Shipment Orders", path: "/warehouse/shipping/orders", icon: "FileText" },
        { label: "Dispatch", path: "/warehouse/shipping/dispatch", icon: "Send" },
        { label: "Shipment Tracking", path: "/warehouse/shipping/tracking", icon: "Clock" }
      ]
    },
    { label: "Traceability", path: "/warehouse/traceability", icon: "SearchCode" },
    { label: "Reports", path: "/warehouse/reports", icon: "FileSpreadsheet" },
    { label: "Notifications", path: "/warehouse/notifications", icon: "Bell" },
    { label: "Profile", path: "/warehouse/profile", icon: "User" }
  ],
  quality: [
    { label: "Dashboard", path: "/quality/dashboard", icon: "LayoutDashboard" },
    {
      group: "Pre-Op & Sanitation",
      items: [
        { label: "Pre-Op Checklist", path: "/quality/sanitation/preop", icon: "CheckSquare" },
        { label: "Sanitation Checklist", path: "/quality/sanitation/checklist", icon: "FileText" },
        { label: "Allergen Checks", path: "/quality/sanitation/allergen", icon: "ShieldCheck" },
        { label: "Line Readiness", path: "/quality/sanitation/readiness", icon: "CalendarRange" },
        { label: "Cleaning Verification", path: "/quality/sanitation/verification", icon: "FileCheck" }
      ]
    },
    {
      group: "Quality Checks",
      items: [
        { label: "CCP Checks", path: "/quality/checks/ccp", icon: "Clock" },
        { label: "Process Checks", path: "/quality/checks/process", icon: "Activity" },
        { label: "Product Checks", path: "/quality/checks/product", icon: "Package" },
        { label: "Quality Specifications", path: "/quality/checks/specs", icon: "Settings" }
      ]
    },
    {
      group: "Quality Events",
      items: [
        { label: "Deviations", path: "/quality/events/deviations", icon: "AlertTriangle" },
        { label: "Non-Conformance", path: "/quality/events/nonconformance", icon: "ShieldAlert" },
        { label: "Quality Holds", path: "/quality/events/holds", icon: "AlertOctagon" },
        { label: "Investigations", path: "/quality/events/investigations", icon: "SearchCode" }
      ]
    },
    {
      group: "Batch Quality",
      items: [
        { label: "Batch Review", path: "/quality/batch/review", icon: "FileText" },
        { label: "Batch History", path: "/quality/batch/history", icon: "Clock" },
        { label: "Quality Records", path: "/quality/batch/records", icon: "FileSpreadsheet" }
      ]
    },
    {
      group: "QA Release",
      items: [
        { label: "Release Queue", path: "/quality/release/queue", icon: "Clock" },
        { label: "Release Review", path: "/quality/release/review", icon: "FileCheck" },
        { label: "Approved Releases", path: "/quality/release/approved", icon: "ShieldCheck" },
        { label: "Blocked / HOLD Batches", path: "/quality/release/blocked", icon: "ShieldAlert" }
      ]
    },
    {
      group: "Disposition",
      items: [
        { label: "Release", path: "/quality/disposition/release", icon: "CheckCircle" },
        { label: "Rework", path: "/quality/disposition/rework", icon: "RefreshCw" },
        { label: "Reject", path: "/quality/disposition/reject", icon: "X" },
        { label: "Downgrade", path: "/quality/disposition/downgrade", icon: "ArrowDown" }
      ]
    },
    { label: "RCA / CAPA", path: "/quality/rca-capa", icon: "SearchCode" },
    { label: "Audit Trail", path: "/quality/audit-trail", icon: "Clock" },
    { label: "Reports", path: "/quality/reports", icon: "FileSpreadsheet" },
    { label: "Notifications", path: "/quality/notifications", icon: "Bell" },
    { label: "Profile", path: "/quality/profile", icon: "User" }
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
    { label: "Dashboard", path: "/ci/dashboard", icon: "LayoutDashboard" },
    {
      group: "RCA 2.0",
      items: [
        { label: "Investigations", path: "/ci/rca/investigations", icon: "SearchCode" },
        { label: "Evidence", path: "/ci/rca/evidence", icon: "FileText" },
        { label: "Hypothesis & Tests", path: "/ci/rca/hypothesis", icon: "Zap" },
        { label: "Occurrence Cause", path: "/ci/rca/occurrence", icon: "AlertTriangle" },
        { label: "Escape Cause", path: "/ci/rca/escape", icon: "AlertOctagon" }
      ]
    },
    {
      group: "CAPA",
      items: [
        { label: "Corrective Actions", path: "/ci/capa/corrective", icon: "CheckCircle" },
        { label: "Preventive Actions", path: "/ci/capa/preventive", icon: "ShieldCheck" },
        { label: "Owners & Due Dates", path: "/ci/capa/owners", icon: "Users" },
        { label: "Effectiveness Verification", path: "/ci/capa/verification", icon: "FileCheck" }
      ]
    },
    {
      group: "Loss Analysis",
      items: [
        { label: "Production Loss", path: "/ci/loss/production", icon: "Factory" },
        { label: "Downtime Loss", path: "/ci/loss/downtime", icon: "Clock" },
        { label: "Quality Loss", path: "/ci/loss/quality", icon: "ShieldAlert" },
        { label: "Yield Loss", path: "/ci/loss/yield", icon: "LineChart" },
        { label: "Scrap / Rework Loss", path: "/ci/loss/scrap", icon: "Trash2" }
      ]
    },
    {
      group: "CI Projects",
      items: [
        { label: "Projects", path: "/ci/projects/list", icon: "Briefcase" },
        { label: "Project Actions", path: "/ci/projects/actions", icon: "CheckSquare" },
        { label: "Savings", path: "/ci/projects/savings", icon: "DollarSign" },
        { label: "Benefits Verification", path: "/ci/projects/benefits", icon: "FileCheck" }
      ]
    },
    { label: "Standards", path: "/ci/standards", icon: "FileText" },
    { label: "Verified Solutions", path: "/ci/verified-solutions", icon: "FileCheck" },
    { label: "Engineering", path: "/ci/engineering", icon: "Settings" },
    { label: "Reliability Insights", path: "/ci/reliability", icon: "Activity" },
    { label: "Reports", path: "/ci/reports", icon: "FileSpreadsheet" },
    { label: "Notifications", path: "/ci/notifications", icon: "Bell" },
    { label: "Profile", path: "/ci/profile", icon: "User" }
  ],
  plant_manager: [
    {
      group: "Dashboards",
      items: [
        { label: "Command Center", path: "/command-center", icon: "LayoutDashboard" }
      ]
    },
    {
      group: "Master Data",
      items: [
        { label: "SKUs Master", path: "/master-data/items", icon: "Package" },
        { label: "BOMs & Recipes", path: "/master-data/bom", icon: "FlaskConical" },
        { label: "Lines Master", path: "/master-data/work-centers", icon: "Layers" },
        { label: "Assets Master", path: "/master-data/machine-capability", icon: "Cpu" },
        { label: "Staff & Skills", path: "/master-data/skills", icon: "Users" },
        { label: "QA Specs", path: "/master-data/quality-specs", icon: "ShieldCheck" }
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
    { label: "Executive Dashboard", path: "/executive/dashboard", icon: "LayoutDashboard" },
    {
      group: "Enterprise Performance",
      items: [
        { label: "Multi-Plant KPIs", path: "/executive/enterprise/kpis", icon: "Gauge" }
      ]
    },
    {
      group: "Financial Intelligence",
      items: [
        { label: "Manufacturing Cost", path: "/executive/finance/manufacturing", icon: "DollarSign" },
        { label: "Cost Variance", path: "/executive/finance/variance", icon: "LineChart" },
        { label: "Material Cost", path: "/executive/finance/material", icon: "Package" },
        { label: "Labour Cost", path: "/executive/finance/labour", icon: "Users" },
        { label: "Machine Cost", path: "/executive/finance/machine", icon: "Settings" },
        { label: "Scrap / Rework Cost", path: "/executive/finance/scrap", icon: "Trash2" },
        { label: "CI Savings", path: "/executive/finance/ci-savings", icon: "TrendingUp" }
      ]
    },
    {
      group: "Business Performance",
      items: [
        { label: "Trends", path: "/executive/business/trends", icon: "TrendingUp" }
      ]
    },
    {
      group: "Risk & Opportunity",
      items: [
        { label: "Risks", path: "/executive/risk/risks", icon: "AlertTriangle" },
        { label: "Opportunities", path: "/executive/risk/opportunities", icon: "Zap" }
      ]
    },
    {
      group: "AI",
      items: [
        { label: "Executive AI Briefing", path: "/executive/ai/briefing", icon: "BrainCircuit" }
      ]
    },
    { label: "Reports", path: "/executive/reports", icon: "FileSpreadsheet" },
    { label: "Notifications", path: "/executive/notifications", icon: "Bell" },
    { label: "Profile", path: "/executive/profile", icon: "User" }
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

    // Direct module aliases across roles
    if (currentRole.id === "maintenance") {
      allowedPaths.push("/work-orders", "/assets", "/breakdowns", "/pm", "/spare-parts", "/calibration", "/troubleshooting", "/cmms", "/ci");
    } else if (currentRole.id === "plant_manager") {
      allowedPaths.push("/work-orders", "/assets", "/breakdowns", "/pm", "/spare-parts", "/calibration", "/troubleshooting", "/planning", "/production", "/quality", "/inventory", "/labour", "/maintenance", "/performance", "/cmms", "/master-data", "/reports", "/governance", "/migration");
    } else if (currentRole.id === "ci_engineer") {
      allowedPaths.push("/ci", "/quality", "/rca", "/capa");
    } else if (currentRole.id === "executive") {
      allowedPaths.push("/production", "/ci/reliability", "/ci/projects/savings", "/quality", "/ci/reports", "/costing");
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

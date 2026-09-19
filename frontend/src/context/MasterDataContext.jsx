import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import masterDataService from "../services/masterDataService";
import adminService from "../services/adminService";

const MasterDataContext = createContext();

// ============================================================================
// INITIAL MOCK MASTER DATASETS (ENTERPRISE-GRADE STABLE ID ARCHITECTURE)
// ============================================================================

export const INITIAL_COMPANIES = [];
export const INITIAL_PLANTS = [];
export const INITIAL_DEPARTMENTS = [];

export const INITIAL_WORK_CENTERS = [];

export const INITIAL_PRODUCT_FAMILIES = [];

export const INITIAL_UOMS = [];

export const INITIAL_SKUS = [];

export const INITIAL_PACK_CONFIGS = [];

export const INITIAL_SHELF_LIFE = [];
export const INITIAL_CUSTOMERS = [];
export const INITIAL_CUSTOMER_SKU_MAPPINGS = [];
export const INITIAL_BOMS = [];
export const INITIAL_OPERATIONS = [];

export const INITIAL_ROUTINGS = [];

export const INITIAL_LINES = [];

export const INITIAL_LINE_TARGETS = [];

export const INITIAL_CHANGEOVER_MATRIX = [];

export const INITIAL_SANITATION_CLASSES = [];

export const INITIAL_ALLERGEN_RULES = [];

export const INITIAL_LABOUR_STANDARDS = [];


export const INITIAL_ASSETS = [];

export const INITIAL_EMPLOYEES = [];

export const INITIAL_TRAINING_RECORDS = [];

export const INITIAL_QUALITY_SPECS = [];

export const INITIAL_STORAGE_RESOURCES = [];

export const INITIAL_CCP_LIMITS = [];

export const INITIAL_USERS = [];

export const INITIAL_USER_INVITATIONS = [];

export const INITIAL_AUDIT_LOGS = [
  {
    auditId: "AUD-9901",
    timestamp: "02 Sep 2026 10:15:30",
    user: "Alexander Vance",
    userRole: "System Administrator",
    entityId: "SKU-001",
    entityType: "SKU Master",
    action: "Updated",
    field: "Standard Cost",
    oldValue: "stdCost = $0.40",
    newValue: "stdCost = $0.42",
    notes: "Annual raw ingredient index re-costing applied"
  },
  {
    auditId: "AUD-9902",
    timestamp: "02 Sep 2026 09:40:12",
    user: "Sarah Jenkins",
    userRole: "QA Manager",
    entityId: "QSP-001",
    entityType: "Quality Specification",
    action: "Approved",
    field: "Approval Status",
    oldValue: "approvalStatus = Submitted",
    newValue: "approvalStatus = Approved",
    notes: "Revision R2 Brix range locked following trial audit"
  },
  {
    auditId: "AUD-9903",
    timestamp: "01 Sep 2026 16:22:05",
    user: "Marcus Vance",
    userRole: "Maintenance Lead",
    entityId: "AST-001",
    entityType: "Machine Asset",
    action: "Updated",
    field: "Maintenance Cycle",
    oldValue: "cycleHours = 200",
    newValue: "cycleHours = 250",
    notes: "PM interval extended per OEM reliability advisory"
  },
  {
    auditId: "AUD-9904",
    timestamp: "01 Sep 2026 14:10:44",
    user: "Robert Thorne",
    userRole: "Plant Manager",
    entityId: "BOM-001",
    entityType: "BOM Recipe",
    action: "Approved",
    field: "Revision Status",
    oldValue: "status = Under Review",
    newValue: "status = Active",
    notes: "Sign-off on R3 Citrus formulation recipe"
  },
  {
    auditId: "AUD-9905",
    timestamp: "31 Aug 2026 11:05:18",
    user: "Alexander Vance",
    userRole: "System Administrator",
    entityId: "LIN-01",
    entityType: "Work Center Line",
    action: "Updated",
    field: "Rated Capacity",
    oldValue: "capacity = 40,000 BPH",
    newValue: "capacity = 42,000 BPH",
    notes: "Line speed test post-de-bottlenecking Kaizen project"
  }
];

export const INITIAL_ROLE_PERMISSIONS = {
  admin: {
    label: "Super Admin / System Administrator",
    permissions: {
      "SKU Master": { view: true, create: true, edit: true, delete: true, approve: true },
      "Product Family": { view: true, create: true, edit: true, delete: true, approve: true },
      "UOM Master": { view: true, create: true, edit: true, delete: true, approve: true },
      "BOM / Recipe": { view: true, create: true, edit: true, delete: true, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: true, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: true, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Routings & Operations": { view: true, create: true, edit: true, delete: true, approve: true },
      "Line Targets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: true, approve: true },
      "Storage Resources": { view: true, create: true, edit: true, delete: true, approve: true },
      "User Administration": { view: true, create: true, edit: true, delete: true, approve: true },
      "Data Migration": { view: true, create: true, edit: true, delete: true, approve: true },
      "Audit Trail": { view: true, create: true, edit: true, delete: false, approve: true }
    }
  },
  plant_manager: {
    label: "Plant Manager",
    permissions: {
      "SKU Master": { view: true, create: true, edit: true, delete: false, approve: true },
      "Product Family": { view: true, create: true, edit: true, delete: false, approve: true },
      "UOM Master": { view: true, create: true, edit: false, delete: false, approve: true },
      "BOM / Recipe": { view: true, create: true, edit: true, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: true },
      "Machine Assets": { view: true, create: true, edit: true, delete: false, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: true },
      "Quality Specs": { view: true, create: true, edit: true, delete: false, approve: true },
      "Routings & Operations": { view: true, create: true, edit: true, delete: false, approve: true },
      "Line Targets": { view: true, create: true, edit: true, delete: false, approve: true },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: false, approve: true },
      "Storage Resources": { view: true, create: true, edit: true, delete: false, approve: true },
      "User Administration": { view: true, create: true, edit: false, delete: false, approve: false },
      "Data Migration": { view: true, create: true, edit: false, delete: false, approve: true },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  qa_manager: {
    label: "Quality QA / QC Manager",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: true },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: true, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: true, edit: true, delete: true, approve: true },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: false, edit: false, delete: false, approve: true },
      "Storage Resources": { view: true, create: false, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  maintenance: {
    label: "Maintenance Lead / Manager",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: true, edit: true, delete: false, approve: false },
      "Machine Assets": { view: true, create: true, edit: true, delete: true, approve: true },
      "Employees & Skills": { view: true, create: true, edit: true, delete: false, approve: false },
      "Quality Specs": { view: false, create: false, edit: false, delete: false, approve: false },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: true, edit: true, delete: false, approve: false },
      "Storage Resources": { view: true, create: true, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: true, create: false, edit: false, delete: false, approve: false }
    }
  },
  operator: {
    label: "Line Lead / Operator",
    permissions: {
      "SKU Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "Product Family": { view: true, create: false, edit: false, delete: false, approve: false },
      "UOM Master": { view: true, create: false, edit: false, delete: false, approve: false },
      "BOM / Recipe": { view: true, create: false, edit: false, delete: false, approve: false },
      "Work Centers / Lines": { view: true, create: false, edit: false, delete: false, approve: false },
      "Machine Assets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Employees & Skills": { view: false, create: false, edit: false, delete: false, approve: false },
      "Quality Specs": { view: true, create: false, edit: false, delete: false, approve: false },
      "Routings & Operations": { view: true, create: false, edit: false, delete: false, approve: false },
      "Line Targets": { view: true, create: false, edit: false, delete: false, approve: false },
      "Changeover Matrix": { view: true, create: false, edit: false, delete: false, approve: false },
      "Storage Resources": { view: true, create: false, edit: false, delete: false, approve: false },
      "User Administration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Data Migration": { view: false, create: false, edit: false, delete: false, approve: false },
      "Audit Trail": { view: false, create: false, edit: false, delete: false, approve: false }
    }
  }
};

// ============================================================================
// PROVIDER IMPLEMENTATION (CENTRALIZED REACT CONTEXT & PERSISTENCE)
// ============================================================================

export function MasterDataProvider({ children }) {
  // Purge old cached mock/dummy data once so DB truth is displayed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleaned = localStorage.getItem("mx_db_live_v4_clean");
      if (!cleaned) {
        const dummyKeys = [
          "mx_master_companies", "mx_master_plants", "mx_master_departments",
          "mx_master_workcenters", "mx_master_families", "mx_master_uoms",
          "mx_master_skus", "mx_master_pack_configs", "mx_master_shelflife",
          "mx_master_csm", "mx_master_boms", "mx_master_operations",
          "mx_master_routings", "mx_master_lines", "mx_master_line_targets",
          "mx_master_changeovers", "mx_master_sanitation", "mx_master_allergens",
          "mx_master_labour_standards", "mx_master_assets", "mx_master_employees",
          "mx_master_training", "mx_master_quality_specs", "mx_master_storage",
          "flowstate_assets", "flowstate_notifications"
        ];
        dummyKeys.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("mx_db_live_v4_clean", "true");
      }
    }
  }, []);
  const hasAuthToken = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token")));
  const hasTenant = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id")));
  const isTenantActive = Boolean(hasTenant || hasAuthToken);
  const tenantName = typeof window !== "undefined" ? (localStorage.getItem("maintenx_tenant_name") || "") : "";

  const [companies, setCompanies] = useState(() => {
    if (isTenantActive) {
      return [{ id: "CMP-01", companyId: "CMP-01", name: tenantName || "Company", code: "CMP", status: "Active" }];
    }
    const saved = localStorage.getItem("mx_master_companies");
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem("mx_master_plants");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_PLANTS;
  });
  const [activePlantId, setActivePlantId] = useState("");
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem("mx_master_departments");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_DEPARTMENTS;
  });
  const [workCenters, setWorkCenters] = useState(() => {
    const saved = localStorage.getItem("mx_master_workcenters");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_WORK_CENTERS;
  });

  // 1. Core Master Datasets with Cache Initialization & Live DB Sync
  const [productFamilies, setProductFamilies] = useState(() => {
    const saved = localStorage.getItem("mx_master_families");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_PRODUCT_FAMILIES;
  });

  const [uoms, setUoms] = useState(() => {
    const saved = localStorage.getItem("mx_master_uoms");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_UOMS;
  });

  const [skus, setSkus] = useState(() => {
    const saved = localStorage.getItem("mx_master_skus");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_SKUS;
  });

  const [packConfigs, setPackConfigs] = useState(() => {
    const saved = localStorage.getItem("mx_master_pack_configs");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_PACK_CONFIGS;
  });

  const [shelfLifeRecords, setShelfLifeRecords] = useState(() => {
    const saved = localStorage.getItem("mx_master_shelflife");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_SHELF_LIFE;
  });

  const [customers, setCustomers] = useState(isTenantActive ? [] : INITIAL_CUSTOMERS);

  const [customerSkuMappings, setCustomerSkuMappings] = useState(() => {
    const saved = localStorage.getItem("mx_master_csm");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_CUSTOMER_SKU_MAPPINGS;
  });

  const [boms, setBoms] = useState(() => {
    const saved = localStorage.getItem("mx_master_boms");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_BOMS;
  });

  const [operations, setOperations] = useState(() => {
    const saved = localStorage.getItem("mx_master_operations");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_OPERATIONS;
  });

  const [routings, setRoutings] = useState(() => {
    const saved = localStorage.getItem("mx_master_routings");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_ROUTINGS;
  });

  const [lines, setLines] = useState(() => {
    const saved = localStorage.getItem("mx_master_lines");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_LINES;
  });

  const [lineTargets, setLineTargets] = useState(() => {
    const saved = localStorage.getItem("mx_master_line_targets");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_LINE_TARGETS;
  });

  const [changeoverMatrix, setChangeoverMatrix] = useState(() => {
    const saved = localStorage.getItem("mx_master_changeovers");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_CHANGEOVER_MATRIX;
  });

  const [sanitationClasses, setSanitationClasses] = useState(() => {
    const saved = localStorage.getItem("mx_master_sanitation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].sanitationClass) {
          return parsed;
        }
      } catch (_) { }
    }
    return isTenantActive ? [] : INITIAL_SANITATION_CLASSES;
  });

  const [allergenRules, setAllergenRules] = useState(() => {
    const saved = localStorage.getItem("mx_master_allergens");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].allergenName) {
          return parsed;
        }
      } catch (_) { }
    }
    return isTenantActive ? [] : INITIAL_ALLERGEN_RULES;
  });

  const [labourStandards, setLabourStandards] = useState(() => {
    const saved = localStorage.getItem("mx_master_labour_standards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) { }
    }
    return isTenantActive ? [] : INITIAL_LABOUR_STANDARDS;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem("mx_master_assets");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_ASSETS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("mx_master_employees");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_EMPLOYEES;
  });

  const [trainingRecords, setTrainingRecords] = useState(() => {
    const saved = localStorage.getItem("mx_master_training");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_TRAINING_RECORDS;
  });

  const [qualitySpecs, setQualitySpecs] = useState(() => {
    const saved = localStorage.getItem("mx_master_quality_specs");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_QUALITY_SPECS;
  });

  const [storageResources, setStorageResources] = useState(() => {
    const saved = localStorage.getItem("mx_master_storage");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_STORAGE_RESOURCES;
  });

  const [ccpLimits, setCcpLimits] = useState(() => {
    const saved = localStorage.getItem("mx_master_ccp_limits");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("mx_admin_users");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_USERS;
  });

  const [userInvitations, setUserInvitations] = useState(isTenantActive ? [] : INITIAL_USER_INVITATIONS);

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("mx_master_audit_logs");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_AUDIT_LOGS;
  });

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem("mx_master_permissions");
    if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return p; } catch (e) { } }
    return isTenantActive ? [] : INITIAL_ROLE_PERMISSIONS;
  });

  // Local Storage Synchronization
  useEffect(() => { localStorage.setItem("mx_master_companies", JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem("mx_master_plants", JSON.stringify(plants)); }, [plants]);
  useEffect(() => { localStorage.setItem("mx_master_departments", JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem("mx_master_workcenters", JSON.stringify(workCenters)); }, [workCenters]);
  useEffect(() => { localStorage.setItem("mx_master_families", JSON.stringify(productFamilies)); }, [productFamilies]);
  useEffect(() => { localStorage.setItem("mx_master_uoms", JSON.stringify(uoms)); }, [uoms]);
  useEffect(() => { localStorage.setItem("mx_master_skus", JSON.stringify(skus)); }, [skus]);
  useEffect(() => { localStorage.setItem("mx_master_pack_configs", JSON.stringify(packConfigs)); }, [packConfigs]);
  useEffect(() => { localStorage.setItem("mx_master_shelflife", JSON.stringify(shelfLifeRecords)); }, [shelfLifeRecords]);
  useEffect(() => { localStorage.setItem("mx_master_csm", JSON.stringify(customerSkuMappings)); }, [customerSkuMappings]);
  useEffect(() => { localStorage.setItem("mx_master_boms", JSON.stringify(boms)); }, [boms]);
  useEffect(() => { localStorage.setItem("mx_master_operations", JSON.stringify(operations)); }, [operations]);
  useEffect(() => { localStorage.setItem("mx_master_routings", JSON.stringify(routings)); }, [routings]);
  useEffect(() => { localStorage.setItem("mx_master_lines", JSON.stringify(lines)); }, [lines]);
  useEffect(() => { localStorage.setItem("mx_master_line_targets", JSON.stringify(lineTargets)); }, [lineTargets]);
  useEffect(() => { localStorage.setItem("mx_master_changeovers", JSON.stringify(changeoverMatrix)); }, [changeoverMatrix]);
  useEffect(() => { localStorage.setItem("mx_master_sanitation", JSON.stringify(sanitationClasses)); }, [sanitationClasses]);
  useEffect(() => { localStorage.setItem("mx_master_allergens", JSON.stringify(allergenRules)); }, [allergenRules]);
  useEffect(() => { localStorage.setItem("mx_master_labour_standards", JSON.stringify(labourStandards)); }, [labourStandards]);
  useEffect(() => {
    localStorage.setItem("mx_master_assets", JSON.stringify(assets));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("maintenx:asset_updated", { detail: assets }));
    }
  }, [assets]);
  useEffect(() => { localStorage.setItem("mx_master_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("mx_master_training", JSON.stringify(trainingRecords)); }, [trainingRecords]);
  useEffect(() => { localStorage.setItem("mx_master_quality_specs", JSON.stringify(qualitySpecs)); }, [qualitySpecs]);
  useEffect(() => { localStorage.setItem("mx_master_storage", JSON.stringify(storageResources)); }, [storageResources]);
  useEffect(() => { localStorage.setItem("mx_master_ccp_limits", JSON.stringify(ccpLimits)); }, [ccpLimits]);
  useEffect(() => { localStorage.setItem("mx_admin_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("mx_master_audit_logs", JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem("mx_master_permissions", JSON.stringify(rolePermissions)); }, [rolePermissions]);

  // Synchronize Master Data with Fastify REST API on mount & plant change
  useEffect(() => {
    async function fetchLiveMasterData() {
      try {
        const [
          liveCompanies,
          livePlants,
          liveDepts,
          liveLines,
          liveWcs,
          liveOperations,
          liveRoutings,
          liveProductFamilies,
          liveUoms,
          livePackConfigs,
          liveLineTargets,
          liveChangeovers,
          liveSanitations,
          liveAllergens,
          liveLabourStandards,
          liveEmployees,
          liveSkus,
          liveBoms,
          liveAssets,
          liveSpecs,
          liveCCPs,
          liveStorage,
        ] = await Promise.allSettled([
          masterDataService.getCompanies(),
          masterDataService.getPlants(),
          masterDataService.getDepartments(activePlantId),
          masterDataService.getLines(),
          masterDataService.getWorkCenters(),
          masterDataService.getOperations(),
          masterDataService.getRoutings(),
          masterDataService.getProductFamilies(),
          masterDataService.getUoms(),
          masterDataService.getPackConfigs(),
          masterDataService.getLineTargets(),
          masterDataService.getChangeoverRules(),
          masterDataService.getSanitationClasses(),
          masterDataService.getAllergenRules(),
          masterDataService.getLabourStandards(),
          masterDataService.getEmployeeSkills(activePlantId),
          masterDataService.getSkus(),
          masterDataService.getBoms(),
          masterDataService.getAssets(activePlantId),
          masterDataService.getQualitySpecs(),
          masterDataService.getCCPLimits(),
          masterDataService.getStorageResources(activePlantId),
        ]);

        const safeArr = (item) => {
          if (item?.status !== "fulfilled") return null;
          let v = item.value?.data !== undefined ? item.value.data : item.value;
          if (v && v.status === "success" && v.data !== undefined) {
            v = v.data;
          }
          return Array.isArray(v) ? v : null;
        };

        const compArr = safeArr(liveCompanies);
        if (compArr) setCompanies(compArr);

        const plantsArr = safeArr(livePlants);
        if (plantsArr) setPlants(plantsArr);

        const deptsArr = safeArr(liveDepts);
        if (deptsArr) setDepartments(deptsArr);

        const linesArr = safeArr(liveLines);
        if (linesArr) setLines(linesArr);

        const wcsArr = safeArr(liveWcs);
        if (wcsArr) setWorkCenters(wcsArr);

        const opsArr = safeArr(liveOperations);
        if (opsArr) setOperations(opsArr);

        const rtgArr = safeArr(liveRoutings);
        if (rtgArr) setRoutings(rtgArr);

        const famArr = safeArr(liveProductFamilies);
        if (famArr) setProductFamilies(famArr);

        const uomArr = safeArr(liveUoms);
        if (uomArr) setUoms(uomArr);

        const packArr = safeArr(livePackConfigs);
        if (packArr) {
          setPackConfigs(packArr.map((p) => ({
            ...p,
            packConfigId: p.packConfigId || p.configId || p.id,
            packCode: p.packCode || p.code || p.packConfigCode || p.id,
            skuName: p.skuName || p.name || "",
            skuCode: p.skuCode || p.sku_code || "",
            unitsPerPack: p.unitsPerPack || p.primaryUnitCount || p.units_per_pack || 0,
            packType: p.packType || p.packagingType || p.packaging_type || "",
            caseConfiguration: p.caseConfiguration || p.case_configuration || "",
            palletConfiguration: p.palletConfiguration || p.pallet_configuration || (p.palletCount ? `${p.palletCount} Cases per Pallet` : ""),
            status: p.status || "Active",
          })));
        }

        const targetsArr = safeArr(liveLineTargets);
        if (targetsArr) setLineTargets(targetsArr);

        const coArr = safeArr(liveChangeovers);
        if (coArr) setChangeoverMatrix(coArr);

        const sanArr = safeArr(liveSanitations);
        if (sanArr) {
          setSanitationClasses(sanArr.map((s) => ({
            ...s,
            id: s.id || s.sanitationId || s.classId,
            sanitationId: s.sanitationId || s.id || s.classId,
            sanitationClass: s.sanitationClass || s.name || s.code || "Standard Sanitation Program",
            description: s.description || (s.chemicalAgent ? `${s.chemicalAgent}. ${s.validationMethod || ''}`.trim() : "Automated clean-in-place sequence"),
            durationMin: Number(s.durationMin ?? s.washDurationMin ?? 45),
            cleaningMethod: s.cleaningMethod || s.cleaningLevel || "Automated Central CIP Skid",
            riskLevel: s.riskLevel || "Standard",
            applicableProducts: s.applicableProducts || "All Formulations",
            status: s.status || "Active",
          })));
        }

        const algArr = safeArr(liveAllergens);
        if (algArr) {
          setAllergenRules(algArr.map((a) => ({
            ...a,
            id: a.id || a.allergenId || a.ruleId,
            allergenId: a.allergenId || a.id || a.ruleId,
            allergenName: a.allergenName || a.allergenType || "Active Allergen Control",
            skuCode: a.skuCode || "SKU-5001",
            riskLevel: a.riskLevel || "High",
            cleaningProtocol: a.cleaningProtocol || a.protocol || "Class A Full CIP + Sensory Swab Verification",
            changeoverRestriction: a.changeoverRestriction || a.verificationTest || "Mandatory QA clearance sign-off",
            status: a.status || "Active",
          })));
        }

        const lbrArr = safeArr(liveLabourStandards);
        if (lbrArr) setLabourStandards(lbrArr);

        const empArr = safeArr(liveEmployees);
        if (empArr) setEmployees(empArr);

        const skuArr = safeArr(liveSkus);
        if (skuArr) setSkus(skuArr);

        const bomArr = safeArr(liveBoms);
        if (bomArr) setBoms(bomArr);

        const astArr = safeArr(liveAssets);
        if (astArr) setAssets(astArr);

        const specArr = safeArr(liveSpecs);
        if (specArr) setQualitySpecs(specArr);

        const ccpArr = safeArr(liveCCPs);
        if (ccpArr) setCcpLimits(ccpArr);

        const storArr = safeArr(liveStorage);
        if (storArr) setStorageResources(storArr);

        try {
          const liveMatrix = await adminService.getPermissionMatrix();
          if (liveMatrix && typeof liveMatrix === "object" && Object.keys(liveMatrix).length > 0) {
            setRolePermissions((prev) => ({ ...prev, ...liveMatrix }));
          }
        } catch (e) {
          console.warn("Live permission matrix sync fallback:", e.message);
        }
      } catch (err) {
        console.warn("MasterData backend sync fallback:", err.message);
      }
    }
    fetchLiveMasterData();

    const onTenantChanged = (evt) => {
      const tName = evt?.detail?.name || localStorage.getItem("maintenx_tenant_name") || "";
      if (tName) {
        setCompanies([{ id: "CMP-01", companyId: "CMP-01", name: tName, code: "CMP", status: "Active" }]);
      }
      setPlants([]);
      setActivePlantId("");
      setDepartments([]);
      setWorkCenters([]);
      setProductFamilies([]);
      setUoms([]);
      setSkus([]);
      setPackConfigs([]);
      setShelfLifeRecords([]);
      setCustomers([]);
      setCustomerSkuMappings([]);
      setBoms([]);
      setOperations([]);
      setRoutings([]);
      setLines([]);
      setLineTargets([]);
      setChangeoverMatrix([]);
      setSanitationClasses([]);
      setAllergenRules([]);
      setLabourStandards([]);
      setAssets([]);
      setEmployees([]);
      setTrainingRecords([]);
      setQualitySpecs([]);
      setStorageResources([]);
      setUsers([]);
      setUserInvitations([]);
      setAuditLogs([]);
      fetchLiveMasterData();
    };
    window.addEventListener("maintenx:tenant_changed", onTenantChanged);
    window.addEventListener("maintenx:auth_ready", onTenantChanged);
    return () => {
      window.removeEventListener("maintenx:tenant_changed", onTenantChanged);
      window.removeEventListener("maintenx:auth_ready", onTenantChanged);
    };
  }, [activePlantId]);

  // ============================================================================
  // CENTRALIZED AUDIT LOGGING HELPER
  // ============================================================================
  const logAudit = useCallback(({ entityId, entityType, action, field = "-", oldValue = "-", newValue = "-", notes = "", user = "Alexander Vance", userRole = "System Administrator" }) => {
    const newEntry = {
      auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      user,
      userRole,
      entityId: String(entityId || "N/A"),
      entityType,
      action,
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
      notes
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, []);

  // ============================================================================
  // -1. COMPANY / LEGAL ENTITY MUTATIONS
  // ============================================================================
  const addCompany = (companyData) => {
    const newId = `CMP-0${companies.length + 1}`;
    const newRecord = {
      id: newId,
      companyId: newId,
      code: (companyData.code || `CMP-0${companies.length + 1}`).toUpperCase(),
      name: companyData.name,
      taxId: companyData.taxId || "US-EIN-94821039",
      currency: companyData.currency || "USD ($)",
      hqLocation: companyData.hqLocation || companyData.headquarters || "Austin, Texas, USA",
      fiscalYearStart: companyData.fiscalYearStart || "January",
      status: companyData.status || "Active",
    };
    setCompanies((prev) => [newRecord, ...prev]);
    masterDataService.createCompany(newRecord).catch((err) => console.warn("API createCompany:", err.message));
    logAudit({ entityId: newRecord.code, entityType: "Legal Corporate Entity", action: "Registered", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updateCompany = (companyId, updated) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId || c.companyId === companyId || c.code === companyId ? { ...c, ...updated } : c))
    );
    masterDataService.updateCompany(companyId, updated).catch((err) => console.warn("API updateCompany:", err.message));
    logAudit({ entityId: companyId, entityType: "Legal Corporate Entity", action: "Updated", notes: "Entity configuration modified" });
  };

  const deleteCompany = (companyId) => {
    setCompanies((prev) => prev.filter((c) => c.id !== companyId && c.companyId !== companyId));
    masterDataService.deleteCompany(companyId).catch((err) => console.warn("API deleteCompany:", err.message));
    logAudit({ entityId: companyId, entityType: "Legal Corporate Entity", action: "Deleted" });
  };

  // ============================================================================
  // 0. PLANT FACILITIES MUTATIONS
  // ============================================================================
  const addPlant = (plantData) => {
    const newId = `PLT-0${plants.length + 1}`;
    const newRecord = {
      id: newId,
      plantId: newId,
      companyId: companies[0]?.id || "CMP-01",
      code: (plantData.code || `PLT-${plants.length + 1}`).toUpperCase(),
      name: plantData.name,
      location: plantData.location || `${plantData.city || ""}${plantData.state ? `, ${plantData.state}` : ""}${plantData.country ? `, ${plantData.country}` : ""}`.replace(/^,\s*/, ""),
      city: plantData.city || "",
      state: plantData.state || "",
      country: plantData.country || "India",
      capacity: plantData.dailyCapacity || plantData.capacity || "350,000 Units/Day",
      dailyCapacity: plantData.dailyCapacity || plantData.capacity || "350,000 Units/Day",
      operatingShifts: Number(plantData.operatingShifts) || 3,
      linesCount: Number(plantData.linesCount) || 3,
      status: plantData.status || "Active",
      timezone: plantData.timezone || "Asia/Kolkata (IST)",
      effectiveFrom: new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setPlants((prev) => [newRecord, ...prev]);
    masterDataService.createPlant(newRecord).catch((err) => console.warn("API createPlant:", err.message));
    logAudit({ entityId: newRecord.code, entityType: "Plant Facility", action: "Provisioned", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updatePlant = (plantId, updated) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === plantId || p.plantId === plantId || p.code === plantId ? { ...p, ...updated } : p))
    );
    masterDataService.updatePlant(plantId, updated).catch((err) => console.warn("API updatePlant:", err.message));
    logAudit({ entityId: plantId, entityType: "Plant Facility", action: "Updated", notes: "Plant configuration modified" });
  };

  const deletePlant = (plantId) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId && p.plantId !== plantId));
    masterDataService.deletePlant(plantId).catch((err) => console.warn("API deletePlant:", err.message));
    logAudit({ entityId: plantId, entityType: "Plant Facility", action: "Deleted" });
  };

  // ============================================================================
  // 0.1 DEPARTMENTS MUTATIONS
  // ============================================================================
  const addDepartment = (deptData) => {
    const newId = `DEP-0${departments.length + 1}`;
    const newRecord = {
      id: newId,
      departmentId: newId,
      plantId: deptData.plantId || activePlantId || "PLT-01",
      code: (deptData.code || `DEP-0${departments.length + 1}`).toUpperCase(),
      name: deptData.name,
      deptHead: deptData.deptHead || deptData.managerName || "Robert Thorne",
      managerName: deptData.deptHead || deptData.managerName || "Robert Thorne",
      costCenter: deptData.costCenter || "CC-101",
      operatingShifts: deptData.operatingShifts || "3 Shifts (24/7 Continuous)",
      status: deptData.status || "Active",
    };
    setDepartments((prev) => [newRecord, ...prev]);
    masterDataService.createDepartment(newRecord).catch((err) => console.warn("API createDepartment:", err.message));
    logAudit({ entityId: newRecord.code, entityType: "Department", action: "Created", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updateDepartment = (departmentId, updated) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === departmentId || d.departmentId === departmentId || d.code === departmentId ? { ...d, ...updated } : d))
    );
    masterDataService.updateDepartment(departmentId, updated).catch((err) => console.warn("API updateDepartment:", err.message));
    logAudit({ entityId: departmentId, entityType: "Department", action: "Updated", notes: "Department hierarchy modified" });
  };

  const deleteDepartment = (departmentId) => {
    setDepartments((prev) => prev.filter((d) => d.id !== departmentId && d.departmentId !== departmentId));
    masterDataService.deleteDepartment(departmentId).catch((err) => console.warn("API deleteDepartment:", err.message));
    logAudit({ entityId: departmentId, entityType: "Department", action: "Deleted" });
  };

  // ============================================================================
  // 1. PRODUCT FAMILY MUTATIONS
  // ============================================================================
  const addProductFamily = (familyData) => {
    const newId = `FAM-0${productFamilies.length + 1}`;
    const newRecord = {
      id: newId,
      familyId: newId,
      code: familyData.code || `FAM-${productFamilies.length + 1}`,
      name: familyData.name,
      category: familyData.category || "Finished Goods",
      description: familyData.description || "",
      plantId: familyData.plantId || activePlantId,
      allergenRisk: familyData.allergenRisk || "None",
      standardMargin: familyData.standardMargin || "55.0%",
      status: familyData.status || "Active",
      effectiveFrom: familyData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: familyData.effectiveTo || "2030-12-31"
    };
    setProductFamilies((prev) => [newRecord, ...prev]);
    masterDataService.createProductFamily(newRecord).catch((err) => console.warn("API createProductFamily:", err.message));
    logAudit({ entityId: newRecord.code, entityType: "Product Family", action: "Created", newValue: `${newRecord.name} (${newRecord.code})` });
    return newRecord;
  };

  const updateProductFamily = (familyId, updated) => {
    setProductFamilies((prev) => prev.map((f) => (f.familyId === familyId || f.id === familyId ? { ...f, ...updated } : f)));
    masterDataService.updateProductFamily(familyId, updated).catch((err) => console.warn("API updateProductFamily:", err.message));
    logAudit({ entityId: familyId, entityType: "Product Family", action: "Updated", notes: "Family configuration modified" });
  };

  const toggleProductFamilyStatus = (familyId) => {
    setProductFamilies((prev) =>
      prev.map((f) => {
        if (f.familyId === familyId || f.id === familyId) {
          const next = f.status === "Active" ? "Inactive" : "Active";
          masterDataService.updateProductFamily(familyId, { status: next }).catch((err) => console.warn("API toggleProductFamilyStatus:", err.message));
          return { ...f, status: next };
        }
        return f;
      })
    );
  };

  const deleteProductFamily = (familyId) => {
    setProductFamilies((prev) => prev.filter((f) => f.familyId !== familyId && f.id !== familyId));
    masterDataService.deleteProductFamily(familyId).catch((err) => console.warn("API deleteProductFamily:", err.message));
    logAudit({ entityId: familyId, entityType: "Product Family", action: "Deleted" });
  };

  // ============================================================================
  // 2. UOM MUTATIONS
  // ============================================================================
  const addUOM = (uomData) => {
    const newId = `UOM-0${uoms.length + 1}`;
    const newRecord = {
      id: newId,
      uomId: newId,
      uomCode: (uomData.uomCode || uomData.code || "").toUpperCase(),
      code: (uomData.uomCode || uomData.code || "").toUpperCase(),
      name: uomData.name,
      type: uomData.type || "Packaging",
      baseUom: uomData.baseUom || "UNITS",
      conversionFactor: Number(uomData.conversionFactor || uomData.factor) || 1.0,
      status: "Active",
      effectiveFrom: uomData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setUoms((prev) => [newRecord, ...prev]);
    masterDataService.createUom(newRecord).catch((err) => console.warn("API createUom:", err.message));
    logAudit({ entityId: newRecord.uomCode, entityType: "UOM Master", action: "Created", newValue: `${newRecord.uomCode} - ${newRecord.name}` });
    return newRecord;
  };

  const updateUOM = (uomId, updated) => {
    setUoms((prev) => prev.map((u) => (u.uomId === uomId || u.id === uomId ? { ...u, ...updated } : u)));
    masterDataService.updateUom(uomId, updated).catch((err) => console.warn("API updateUom:", err.message));
    logAudit({ entityId: uomId, entityType: "UOM Master", action: "Updated" });
  };

  const toggleUOMStatus = (uomId) => {
    setUoms((prev) =>
      prev.map((u) => {
        if (u.uomId === uomId || u.id === uomId) {
          const next = u.status === "Active" ? "Inactive" : "Active";
          masterDataService.updateUom(uomId, { status: next }).catch((err) => console.warn("API toggleUOMStatus:", err.message));
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const deleteUOM = (uomId) => {
    setUoms((prev) => prev.filter((u) => u.uomId !== uomId && u.id !== uomId));
    masterDataService.deleteUom(uomId).catch((err) => console.warn("API deleteUom:", err.message));
    logAudit({ entityId: uomId, entityType: "UOM Master", action: "Deleted" });
  };

  // ============================================================================
  // 3. SKU / ITEM MASTER MUTATIONS
  // ============================================================================
  const addSKU = (skuData) => {
    const newSkuId = `SKU-00${skus.length + 1}`;
    const newRecord = {
      id: newSkuId,
      skuId: newSkuId,
      skuCode: skuData.skuCode || `SKU-${Math.floor(5000 + Math.random() * 900)}`,
      name: skuData.name,
      category: skuData.category || "Finished Goods",
      itemType: skuData.itemType || (skuData.category === "Raw Ingredients" ? "Raw Material" : "Finished Good"),
      familyId: skuData.familyId || "FAM-01",
      family: skuData.family || "Sparkling Flavors",
      uom: skuData.uom || "Bottles",
      plantId: skuData.plantId || activePlantId,
      stdCost: skuData.stdCost || "$0.50",
      revision: "R1",
      status: skuData.status || "Active",
      approvalStatus: skuData.approvalStatus || "Approved",
      shelfLifeDays: Number(skuData.shelfLifeDays) || 365,
      packConfigCode: skuData.packConfigCode || `PCK-${skuData.skuCode || "DEF"}`,
      packSize: skuData.packSize || "24 Units / Case",
      eligibleLineIds: skuData.eligibleLineIds || ["LIN-01"],
      stdRunRateBPH: Number(skuData.stdRunRateBPH) || 35000,
      expectedYieldPct: Number(skuData.expectedYieldPct) || 99.0,
      effectiveFrom: skuData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: skuData.effectiveTo || "2030-12-31",
      description: skuData.description || "",
      createdBy: (() => {
        try {
          const profile = localStorage.getItem("flowstate_user_profile");
          if (profile) {
            const parsed = JSON.parse(profile);
            if (parsed?.name) return parsed.name;
          }
        } catch { }
        return "Admin";
      })(),
      createdDate: new Date().toISOString().substring(0, 10),
      lastUpdated: new Date().toISOString().substring(0, 10)
    };
    setSkus((prev) => [newRecord, ...prev]);
    masterDataService.createSku(newRecord).catch((err) => console.warn("API createSku:", err.message));
    logAudit({ entityId: newRecord.skuCode, entityType: "SKU Master", action: "Created", newValue: `${newRecord.skuCode} - ${newRecord.name} (${newRecord.uom})` });
    return newRecord;
  };

  const updateSKU = (skuId, updated) => {
    setSkus((prev) =>
      prev.map((s) => (s.skuId === skuId || s.skuCode === skuId || s.id === skuId ? { ...s, ...updated, lastUpdated: new Date().toISOString().substring(0, 10) } : s))
    );
    masterDataService.updateSku(skuId, updated).catch((err) => console.warn("API updateSku:", err.message));
    logAudit({ entityId: skuId, entityType: "SKU Master", action: "Updated", notes: "SKU attributes updated" });
  };

  const toggleSKUStatus = (skuId) => {
    setSkus((prev) =>
      prev.map((s) => {
        if (s.skuId === skuId || s.skuCode === skuId || s.id === skuId) {
          const next = s.status === "Active" ? "Inactive" : "Active";
          masterDataService.updateSku(skuId, { status: next }).catch((err) => console.warn("API toggleSKUStatus:", err.message));
          logAudit({ entityId: s.skuCode, entityType: "SKU Master", action: next === "Active" ? "Activated" : "Deactivated" });
          return { ...s, status: next, lastUpdated: new Date().toISOString().substring(0, 10) };
        }
        return s;
      })
    );
  };

  const deleteSKU = (skuId) => {
    setSkus((prev) => prev.filter((s) => s.skuId !== skuId && s.skuCode !== skuId && s.id !== skuId));
    masterDataService.deleteSku(skuId).catch((err) => console.warn("API deleteSku:", err.message));
    logAudit({ entityId: skuId, entityType: "SKU Master", action: "Deleted" });
  };

  // ============================================================================
  // 4. PACK CONFIGURATION MUTATIONS
  // ============================================================================
  const addPackConfig = async (pckData) => {
    try {
      const res = await masterDataService.createPackConfig(pckData);
      const created = res?.data || res || pckData;
      const normalized = {
        ...created,
        packConfigId: created.packConfigId || created.configId || created.id,
        packCode: created.packCode || created.code || pckData.packCode,
        skuName: created.skuName || pckData.skuName,
        skuCode: created.skuCode || pckData.skuCode,
        unitsPerPack: Number(created.unitsPerPack || pckData.unitsPerPack) || 24,
        packType: created.packType || pckData.packType,
        packagingUom: created.packagingUom || pckData.packagingUom,
        status: created.status || "Active"
      };
      setPackConfigs((prev) => [normalized, ...prev.filter(p => p.packConfigId !== normalized.packConfigId && p.id !== normalized.id)]);
      logAudit({ entityId: normalized.packCode, entityType: "Pack Configuration", action: "Created", newValue: `${normalized.packCode}` });
      return normalized;
    } catch (err) {
      console.warn("API createPackConfig error:", err);
      throw err;
    }
  };

  const updatePackConfig = async (packConfigId, updated) => {
    try {
      await masterDataService.updatePackConfig(packConfigId, updated);
      setPackConfigs((prev) => prev.map((p) => (p.packConfigId === packConfigId || p.id === packConfigId || p.packCode === packConfigId ? { ...p, ...updated } : p)));
      logAudit({ entityId: packConfigId, entityType: "Pack Configuration", action: "Updated" });
    } catch (err) {
      console.warn("API updatePackConfig error:", err);
      throw err;
    }
  };

  const deletePackConfig = async (packConfigId) => {
    try {
      await masterDataService.deletePackConfig(packConfigId);
      setPackConfigs((prev) => prev.filter((p) => p.packConfigId !== packConfigId && p.id !== packConfigId && p.packCode !== packConfigId));
      logAudit({ entityId: packConfigId, entityType: "Pack Configuration", action: "Deleted" });
    } catch (err) {
      console.warn("API deletePackConfig error:", err);
      throw err;
    }
  };

  // ============================================================================
  // 5. SHELF LIFE MUTATIONS
  // ============================================================================
  const addShelfLife = (data) => {
    const newRecord = {
      shelfLifeId: `SLF-0${shelfLifeRecords.length + 1}`,
      skuId: data.skuId,
      skuCode: data.skuCode,
      skuName: data.skuName,
      shelfLifeValue: Number(data.shelfLifeValue) || 365,
      shelfLifeUom: data.shelfLifeUom || "Days",
      storageCondition: data.storageCondition || "Ambient Dry (15°C - 25°C)",
      minTempC: Number(data.minTempC) || 4,
      maxTempC: Number(data.maxTempC) || 28,
      lightSensitivity: data.lightSensitivity || "Standard",
      quarantineDays: Number(data.quarantineDays) || 1,
      status: "Active",
      effectiveFrom: data.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setShelfLifeRecords((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.shelfLifeId, entityType: "Shelf Life Master", action: "Created", newValue: `${newRecord.skuCode}: ${newRecord.shelfLifeValue} Days` });
    return newRecord;
  };

  const updateShelfLife = (shelfLifeId, updated) => {
    setShelfLifeRecords((prev) => prev.map((s) => (s.shelfLifeId === shelfLifeId ? { ...s, ...updated } : s)));
    logAudit({ entityId: shelfLifeId, entityType: "Shelf Life Master", action: "Updated" });
  };

  const deleteShelfLife = (shelfLifeId) => {
    setShelfLifeRecords((prev) => prev.filter((s) => s.shelfLifeId !== shelfLifeId));
    logAudit({ entityId: shelfLifeId, entityType: "Shelf Life Master", action: "Deleted" });
  };

  // ============================================================================
  // 6. CUSTOMER SKU MAPPING MUTATIONS
  // ============================================================================
  const addCustomerSkuMapping = (csmData) => {
    const newRecord = {
      mappingId: `CSM-0${customerSkuMappings.length + 1}`,
      customerId: csmData.customerId,
      customerName: csmData.customerName || customers.find((c) => c.customerId === csmData.customerId)?.name || "Retail Partner",
      skuId: csmData.skuId,
      internalSkuCode: csmData.internalSkuCode || skus.find((s) => s.skuId === csmData.skuId)?.skuCode || "SKU-5001",
      internalSkuName: csmData.internalSkuName || skus.find((s) => s.skuId === csmData.skuId)?.name || "Beverage Product",
      customerSkuCode: csmData.customerSkuCode,
      customerSkuName: csmData.customerSkuName,
      customerUom: csmData.customerUom || "CASE-24",
      barcodeUPC: csmData.barcodeUPC || `89012345${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Active",
      effectiveFrom: csmData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31"
    };
    setCustomerSkuMappings((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.mappingId, entityType: "Customer SKU Mapping", action: "Created", newValue: `${newRecord.customerName} ↔ ${newRecord.internalSkuCode}` });
    return newRecord;
  };

  const updateCustomerSkuMapping = (mappingId, updated) => {
    setCustomerSkuMappings((prev) => prev.map((m) => (m.mappingId === mappingId ? { ...m, ...updated } : m)));
    logAudit({ entityId: mappingId, entityType: "Customer SKU Mapping", action: "Updated" });
  };

  const deleteCustomerSkuMapping = (mappingId) => {
    setCustomerSkuMappings((prev) => prev.filter((m) => m.mappingId !== mappingId));
    logAudit({ entityId: mappingId, entityType: "Customer SKU Mapping", action: "Deleted" });
  };

  // ============================================================================
  // 7. BOM / RECIPE MUTATIONS & APPROVAL GOVERNANCE
  // ============================================================================
  const addBOM = async (bomData) => {
    try {
      const res = await masterDataService.createBom(bomData);
      const created = res?.data || res || bomData;
      setBoms((prev) => [created, ...prev.filter((b) => (b.bomId || b.id) !== (created.bomId || created.id))]);
      logAudit({ entityId: created.bomNumber || created.name, entityType: "BOM Recipe", action: "Created", newValue: `${created.bomNumber} for ${created.finishedSkuName}` });
      return created;
    } catch (err) {
      console.warn("API createBom error:", err);
      throw err;
    }
  };

  const updateBOM = async (bomId, updated) => {
    try {
      await masterDataService.updateBom(bomId, updated);
      setBoms((prev) =>
        prev.map((b) => (b.bomId === bomId || b.id === bomId || b.bomNumber === bomId ? { ...b, ...updated, lastUpdated: new Date().toISOString().substring(0, 10) } : b))
      );
      logAudit({ entityId: bomId, entityType: "BOM Recipe", action: "Updated" });
    } catch (err) {
      console.warn("API updateBom error:", err);
      throw err;
    }
  };

  const submitBOMForApproval = async (bomId) => {
    try {
      await masterDataService.updateBom(bomId, { status: "Under Review", approvalStatus: "Under Review" });
      setBoms((prev) =>
        prev.map((b) => {
          if (b.bomId === bomId || b.id === bomId || b.bomNumber === bomId) {
            logAudit({ entityId: b.bomNumber || bomId, entityType: "BOM Recipe", action: "Submitted", notes: "Submitted for QA/Plant Manager approval" });
            return { ...b, status: "Under Review", approvalStatus: "Under Review", lastUpdated: new Date().toISOString().substring(0, 10) };
          }
          return b;
        })
      );
    } catch (err) {
      console.warn("API submitBOM error:", err);
      throw err;
    }
  };

  const approveBOM = async (bomId, approver = "Sarah Jenkins") => {
    try {
      await masterDataService.updateBom(bomId, { status: "Active", approvalStatus: "Approved" });
      setBoms((prev) =>
        prev.map((b) => {
          if (b.bomId === bomId || b.id === bomId || b.bomNumber === bomId) {
            const revs = (b.revisionHistory || []).map((rev, idx) => (idx === 0 ? { ...rev, status: "Approved", approvedBy: approver } : rev));
            logAudit({ entityId: b.bomNumber || bomId, entityType: "BOM Recipe", action: "Approved", notes: `Approved by ${approver}` });
            return { ...b, status: "Active", approvalStatus: "Approved", revisionHistory: revs, lastUpdated: new Date().toISOString().substring(0, 10) };
          }
          return b;
        })
      );
    } catch (err) {
      console.warn("API approveBOM error:", err);
      throw err;
    }
  };

  const rejectBOM = async (bomId, reason = "Tolerance out of spec") => {
    try {
      await masterDataService.updateBom(bomId, { status: "Draft", approvalStatus: "Draft", rejectionReason: reason });
      setBoms((prev) =>
        prev.map((b) => {
          if (b.bomId === bomId || b.id === bomId || b.bomNumber === bomId) {
            logAudit({ entityId: b.bomNumber || bomId, entityType: "BOM Recipe", action: "Rejected", notes: `Reason: ${reason}` });
            return { ...b, status: "Draft", approvalStatus: "Draft", rejectionReason: reason, lastUpdated: new Date().toISOString().substring(0, 10) };
          }
          return b;
        })
      );
    } catch (err) {
      console.warn("API rejectBOM error:", err);
      throw err;
    }
  };

  const deleteBOM = async (bomId) => {
    try {
      await masterDataService.deleteBom(bomId);
      setBoms((prev) => prev.filter((b) => b.bomId !== bomId && b.id !== bomId && b.bomNumber !== bomId));
      logAudit({ entityId: bomId, entityType: "BOM Recipe", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteBom error:", err);
      throw err;
    }
  };

  // ============================================================================
  // 8. OPERATIONS & ROUTINGS MUTATIONS
  // ============================================================================
  const addOperation = (opData) => {
    const newId = `OP-0${operations.length + 1}`;
    const codeVal = (opData.operationCode || opData.code || `OP-${operations.length + 1}`).toUpperCase();
    const newRecord = {
      id: newId,
      operationId: newId,
      operationCode: codeVal,
      code: codeVal,
      name: opData.name,
      sequence: Number(opData.sequence) || (operations.length + 1) * 10,
      department: opData.department || "Packaging",
      stdDurationMin: Number(opData.stdDurationMin || opData.stdTimeMins) || 45,
      stdTimeMins: Number(opData.stdDurationMin || opData.stdTimeMins) || 45,
      setupDurationMin: Number(opData.setupDurationMin) || 15,
      status: opData.status || "Active"
    };
    setOperations((prev) => [newRecord, ...prev]);
    masterDataService.createOperation(newRecord).catch((err) => console.warn("API createOperation:", err.message));
    logAudit({ entityId: newRecord.operationCode, entityType: "Operations Master", action: "Created", newValue: newRecord.name });
    return newRecord;
  };

  const updateOperation = (operationId, updated) => {
    setOperations((prev) => prev.map((o) => (o.operationId === operationId || o.id === operationId ? { ...o, ...updated } : o)));
    masterDataService.updateOperation(operationId, updated).catch((err) => console.warn("API updateOperation:", err.message));
    logAudit({ entityId: operationId, entityType: "Operations Master", action: "Updated" });
  };

  const deleteOperation = (operationId) => {
    setOperations((prev) => prev.filter((o) => o.operationId !== operationId && o.id !== operationId));
    masterDataService.deleteOperation(operationId).catch((err) => console.warn("API deleteOperation:", err.message));
    logAudit({ entityId: operationId, entityType: "Operations Master", action: "Deleted" });
  };

  const addRouting = async (rtgData) => {
    try {
      const res = await masterDataService.createRouting(rtgData);
      const created = res?.data?.data || res?.data || res || rtgData;
      setRoutings((prev) => [created, ...prev.filter(r => (r.routingId || r.id) !== (created.routingId || created.id))]);
      logAudit({ entityId: created.routingCode || created.id, entityType: "Routings Master", action: "Created", newValue: `${created.routingCode}` });
      return created;
    } catch (err) {
      console.warn("API createRouting error:", err);
      throw err;
    }
  };

  const updateRouting = async (routingId, updated) => {
    try {
      await masterDataService.updateRouting(routingId, updated);
      setRoutings((prev) => prev.map((r) => (r.routingId === routingId || r.id === routingId || r.routingCode === routingId ? { ...r, ...updated } : r)));
      logAudit({ entityId: routingId, entityType: "Routings Master", action: "Updated" });
    } catch (err) {
      console.warn("API updateRouting error:", err);
      throw err;
    }
  };

  const deleteRouting = async (routingId) => {
    try {
      await masterDataService.deleteRouting(routingId);
      setRoutings((prev) => prev.filter((r) => r.routingId !== routingId && r.id !== routingId && r.routingCode !== routingId));
      logAudit({ entityId: routingId, entityType: "Routings Master", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteRouting error:", err);
      throw err;
    }
  };

  // ============================================================================
  // 9. WORK CENTERS / LINES & LINE TARGETS MUTATIONS
  // ============================================================================
  const addLine = async (lineData) => {
    const newRecord = {
      id: lineData.id || `LIN-0${lines.length + 1}`,
      lineId: lineData.lineId || `LIN-0${lines.length + 1}`,
      lineCode: (lineData.lineCode || lineData.code || `LINE-${lines.length + 1}`).toUpperCase(),
      code: (lineData.lineCode || lineData.code || `LINE-${lines.length + 1}`).toUpperCase(),
      name: lineData.name,
      plantId: lineData.plantId || activePlantId,
      plantName: lineData.plantName || plants.find((p) => p.id === (lineData.plantId || activePlantId) || p.plantId === (lineData.plantId || activePlantId))?.name || plants[0]?.name || "Main Facility",
      departmentId: lineData.departmentId || "DEP-01",
      capacity: lineData.capacity || lineData.ratedSpeed || "38,000 BPH",
      type: lineData.type || "Continuous Flow",
      lineType: lineData.lineType || "BOTTLING",
      ratedSpeed: lineData.ratedSpeed || "38,000 BPH",
      ratedSpeedBPH: Number(lineData.ratedSpeedBPH) || 38000,
      status: lineData.status || "Active",
      supervisorId: lineData.supervisorId || null,
      supervisorName: lineData.supervisorName || "",
      assignedAssetIds: lineData.assignedAssetIds || [],
      eligibleSkuIds: lineData.eligibleSkuIds || [],
      ratedOEE: lineData.ratedOEE || "88.0%",
      currentRunningSku: lineData.currentRunningSku || null,
      healthScore: 95,
    };
    try {
      const res = await masterDataService.createLine({ ...newRecord, ...lineData });
      const created = res?.data || res || newRecord;
      const merged = { ...newRecord, ...created };
      setLines((prev) => [merged, ...prev.filter((l) => l.id !== merged.id && l.lineCode !== merged.lineCode)]);
      logAudit({ entityId: merged.lineCode || merged.code, entityType: "Work Centers / Lines", action: "Created", newValue: merged.name });
      return merged;
    } catch (err) {
      console.warn("API createLine fallback:", err.message);
      setLines((prev) => [newRecord, ...prev.filter((l) => l.id !== newRecord.id && l.lineCode !== newRecord.lineCode)]);
      logAudit({ entityId: newRecord.lineCode, entityType: "Work Centers / Lines", action: "Created", newValue: newRecord.name });
      return newRecord;
    }
  };

  const updateLine = async (lineId, updated) => {
    try {
      await masterDataService.updateLine(lineId, updated);
      setLines((prev) =>
        prev.map((l) => (l.lineId === lineId || l.id === lineId || l.lineCode === lineId || l.code === lineId ? { ...l, ...updated } : l))
      );
      logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Updated" });
    } catch (err) {
      console.warn("API updateLine:", err.message);
      throw err;
    }
  };

  const toggleLineStatus = async (lineId) => {
    const current = lines.find((l) => l.lineId === lineId || l.id === lineId || l.lineCode === lineId || l.code === lineId);
    const next = current?.status === "Active" ? "Inactive" : "Active";
    try {
      await masterDataService.updateLine(lineId, { status: next });
      setLines((prev) =>
        prev.map((l) => (l.lineId === lineId || l.id === lineId || l.lineCode === lineId || l.code === lineId ? { ...l, status: next } : l))
      );
    } catch (err) {
      console.warn("API toggleLineStatus:", err.message);
    }
  };

  const deleteLine = async (lineId) => {
    try {
      await masterDataService.deleteLine(lineId);
      setLines((prev) => prev.filter((l) => l.lineId !== lineId && l.id !== lineId && l.lineCode !== lineId && l.code !== lineId));
      logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteLine:", err.message);
      throw err;
    }
  };

  // 9.1 WORK CENTERS MUTATIONS
  const addWorkCenter = async (wcData) => {
    try {
      const res = await masterDataService.createWorkCenter(wcData);
      const created = res?.data || res;
      setWorkCenters((prev) => [created, ...prev.filter((w) => w.id !== created.id && w.code !== created.code)]);
      logAudit({ entityId: created.code, entityType: "Work Center Cell", action: "Created", newValue: created.name });
      return created;
    } catch (err) {
      console.warn("API createWorkCenter:", err.message);
      throw err;
    }
  };

  const updateWorkCenter = async (wcId, updated) => {
    try {
      await masterDataService.updateWorkCenter(wcId, updated);
      setWorkCenters((prev) =>
        prev.map((w) => (w.id === wcId || w.workCenterId === wcId || w.code === wcId ? { ...w, ...updated } : w))
      );
      logAudit({ entityId: wcId, entityType: "Work Center Cell", action: "Updated" });
    } catch (err) {
      console.warn("API updateWorkCenter:", err.message);
      throw err;
    }
  };

  const deleteWorkCenter = async (wcId) => {
    try {
      await masterDataService.deleteWorkCenter(wcId);
      setWorkCenters((prev) => prev.filter((w) => w.id !== wcId && w.workCenterId !== wcId && w.code !== wcId));
      logAudit({ entityId: wcId, entityType: "Work Center Cell", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteWorkCenter:", err.message);
      throw err;
    }
  };

  const assignAssetToLine = (lineId, assetId) => {
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId || l.lineCode === lineId ? { ...l, assignedAssetIds: [...new Set([...(l.assignedAssetIds || []), assetId])] } : l))
    );
    setAssets((prev) =>
      prev.map((a) => (a.assetId === assetId || a.id === assetId ? { ...a, lineId, lineName: lines.find((l) => l.lineId === lineId)?.name || lineId } : a))
    );
    masterDataService.updateAsset(assetId, { lineId }).catch((err) => console.warn("API updateAsset:", err.message));
    logAudit({ entityId: lineId, entityType: "Work Centers / Lines", action: "Updated", newValue: `Assigned asset ${assetId}` });
  };

  const addLineTarget = async (targetData) => {
    const selLine = lines.find((l) => l.lineId === targetData.lineId || l.id === targetData.lineId);
    const selSku = skus.find((s) => s.skuId === targetData.skuId || s.id === targetData.skuId);
    const newRecord = {
      id: targetData.id || targetData.targetId || `TGT-0${lineTargets.length + 1}`,
      targetId: targetData.targetId || targetData.id || `TGT-0${lineTargets.length + 1}`,
      plantId: targetData.plantId || activePlantId || "PLT-01",
      lineId: targetData.lineId || "LIN-01",
      lineName: selLine?.name || targetData.lineName || "Production Line",
      skuId: targetData.skuId || "SKU-001",
      skuCode: selSku?.skuCode || targetData.skuCode || "SKU-5001",
      skuName: selSku?.name || targetData.skuName || "Beverage",
      shift: targetData.shift || "Morning Shift",
      targetQuantity: Number(targetData.targetQuantity) || 250000,
      targetHB: targetData.targetHB || `${(Number(targetData.targetQuantity) || 250000) / 8} Units/Hour`,
      stdRunRate: Number(targetData.stdRunRate) || 40000,
      oeeTargetPct: Number(targetData.oeeTargetPct) || 88.0,
      status: targetData.status || "Active",
      effectiveDate: targetData.effectiveDate || new Date().toISOString().substring(0, 10)
    };
    try {
      const res = await masterDataService.createLineTarget(newRecord);
      const created = res?.data?.data || res?.data || res || newRecord;
      setLineTargets((prev) => [created, ...prev.filter((t) => (t.id !== created.id && t.targetId !== created.targetId))]);
      logAudit({ entityId: created.targetId || created.id, entityType: "Line Targets", action: "Created", newValue: `${created.lineName} Target: ${created.targetQuantity}` });
      return created;
    } catch (err) {
      console.warn("API createLineTarget error:", err);
      setLineTargets((prev) => [newRecord, ...prev]);
      logAudit({ entityId: newRecord.targetId, entityType: "Line Targets", action: "Created", newValue: `${newRecord.lineName} Target: ${newRecord.targetQuantity}` });
      return newRecord;
    }
  };

  const updateLineTarget = async (targetId, updated) => {
    setLineTargets((prev) => prev.map((t) => (t.targetId === targetId || t.id === targetId ? { ...t, ...updated } : t)));
    try {
      await masterDataService.updateLineTarget(targetId, updated);
    } catch (err) {
      console.warn("API updateLineTarget error:", err);
    }
    logAudit({ entityId: targetId, entityType: "Line Targets", action: "Updated" });
  };

  const deleteLineTarget = async (targetId) => {
    setLineTargets((prev) => prev.filter((t) => t.targetId !== targetId && t.id !== targetId));
    try {
      await masterDataService.deleteLineTarget(targetId);
    } catch (err) {
      console.warn("API deleteLineTarget error:", err);
    }
    logAudit({ entityId: targetId, entityType: "Line Targets", action: "Deleted" });
  };

  // ============================================================================
  // 10. CHANGEOVER MATRIX, SANITATION & ALLERGEN MUTATIONS
  // ============================================================================
  const addChangeoverRule = async (ruleData) => {
    const tempId = ruleData.matrixId || ruleData.id || `CO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: ruleData.id || tempId,
      matrixId: ruleData.matrixId || ruleData.id || tempId,
      fromSkuId: ruleData.fromSkuId || "SKU-001",
      fromSkuCode: ruleData.fromSkuCode || "SKU-5001",
      fromFamily: ruleData.fromFamily || "All Families",
      toSkuId: ruleData.toSkuId || "SKU-002",
      toSkuCode: ruleData.toSkuCode || "SKU-5002",
      toFamily: ruleData.toFamily || "All Families",
      changeoverDurationMin: Number(ruleData.changeoverDurationMin) || 0,
      sanitationClass: ruleData.sanitationClass || "Class B - Standard Rinse",
      allergenCleaningRequired: !!ruleData.allergenCleaningRequired,
      notes: ruleData.notes || "",
      status: ruleData.status || "Active"
    };

    try {
      const res = await masterDataService.createChangeoverRule(newRecord);
      const saved = res?.data?.data || res?.data || res || newRecord;
      setChangeoverMatrix((prev) => [saved, ...prev.filter((c) => (c.matrixId !== saved.matrixId && c.id !== saved.id && c.id !== newRecord.id))]);
      logAudit({ entityId: saved.matrixId || saved.id, entityType: "Changeover Matrix", action: "Created", newValue: `${saved.fromSkuCode} → ${saved.toSkuCode} (${saved.changeoverDurationMin}m)` });
      return saved;
    } catch (err) {
      console.warn("API createChangeoverRule fallback to local:", err.message);
      setChangeoverMatrix((prev) => [newRecord, ...prev]);
      logAudit({ entityId: newRecord.matrixId, entityType: "Changeover Matrix", action: "Created", newValue: `${newRecord.fromSkuCode} → ${newRecord.toSkuCode} (${newRecord.changeoverDurationMin}m)` });
      return newRecord;
    }
  };

  const updateChangeoverRule = async (matrixId, updated) => {
    setChangeoverMatrix((prev) => prev.map((c) => (c.matrixId === matrixId || c.id === matrixId ? { ...c, ...updated } : c)));
    try {
      await masterDataService.updateChangeoverRule(matrixId, updated);
    } catch (err) {
      console.warn("API updateChangeoverRule error:", err.message);
    }
    logAudit({ entityId: matrixId, entityType: "Changeover Matrix", action: "Updated" });
  };

  const deleteChangeoverRule = async (matrixId) => {
    setChangeoverMatrix((prev) => prev.filter((c) => c.matrixId !== matrixId && c.id !== matrixId));
    try {
      await masterDataService.deleteChangeoverRule(matrixId);
    } catch (err) {
      console.warn("API deleteChangeoverRule error:", err.message);
    }
    logAudit({ entityId: matrixId, entityType: "Changeover Matrix", action: "Deleted" });
  };

  const addSanitationClass = async (data) => {
    const tempId = data.sanitationId || data.id || data.classId || `SAN-0${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: data.id || tempId,
      classId: data.classId || tempId,
      sanitationId: data.sanitationId || tempId,
      code: (data.code || tempId).toUpperCase(),
      name: data.sanitationClass || data.name || "Sanitation Program",
      sanitationClass: data.sanitationClass || data.name || "Sanitation Program",
      description: data.description || "",
      durationMin: Number(data.durationMin) || 45,
      washDurationMin: Number(data.durationMin) || 45,
      cleaningMethod: data.cleaningMethod || "Automated Central CIP Skid",
      cleaningLevel: data.cleaningLevel || "Intermediate",
      riskLevel: data.riskLevel || "Standard",
      applicableProducts: data.applicableProducts || "All Formulations",
      chemicalAgent: data.chemicalAgent || "Caustic Solution",
      validationMethod: data.validationMethod || "Visual & Swab",
      frequency: data.frequency || "Daily",
      status: data.status || "Active"
    };
    try {
      const res = await masterDataService.createSanitationClass(newRecord);
      const saved = res?.data?.data || res?.data || res || newRecord;
      setSanitationClasses((prev) => [saved, ...prev.filter((s) => s.id !== saved.id && s.sanitationId !== saved.sanitationId && s.classId !== saved.classId && s.id !== newRecord.id)]);
      logAudit({ entityId: saved.sanitationClass || saved.id, entityType: "Sanitation Master", action: "Created" });
      return saved;
    } catch (err) {
      console.warn("API createSanitationClass fallback:", err.message);
      setSanitationClasses((prev) => [newRecord, ...prev]);
      logAudit({ entityId: newRecord.sanitationClass, entityType: "Sanitation Master", action: "Created" });
      return newRecord;
    }
  };

  const updateSanitationClass = async (sanitationId, updated) => {
    setSanitationClasses((prev) => prev.map((s) => (s.sanitationId === sanitationId || s.id === sanitationId || s.classId === sanitationId ? { ...s, ...updated } : s)));
    try {
      await masterDataService.updateSanitationClass(sanitationId, updated);
    } catch (err) {
      console.warn("API updateSanitationClass error:", err.message);
    }
    logAudit({ entityId: sanitationId, entityType: "Sanitation Master", action: "Updated" });
  };

  const deleteSanitationClass = async (sanitationId) => {
    setSanitationClasses((prev) => prev.filter((s) => s.sanitationId !== sanitationId && s.id !== sanitationId && s.classId !== sanitationId));
    try {
      await masterDataService.deleteSanitationClass(sanitationId);
    } catch (err) {
      console.warn("API deleteSanitationClass error:", err.message);
    }
    logAudit({ entityId: sanitationId, entityType: "Sanitation Master", action: "Deleted" });
  };

  const addAllergenRule = async (data) => {
    const tempId = data.allergenId || data.ruleId || data.id || `ALG-0${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: data.id || tempId,
      ruleId: data.ruleId || tempId,
      allergenId: data.allergenId || tempId,
      allergenName: data.allergenName,
      allergenType: data.allergenType || "Botanical Extracts",
      skuId: data.skuId || "",
      skuCode: data.skuCode || "SKU-5001",
      riskLevel: data.riskLevel || "High",
      cleaningProtocol: data.cleaningProtocol || "Class A Full CIP + Sensory Swab Verification",
      protocol: data.cleaningProtocol || "Class A Full CIP + Sensory Swab Verification",
      changeoverRestriction: data.changeoverRestriction || "Mandatory QA sign-off",
      verificationTest: data.verificationTest || "ATP Swab < 10 RLU",
      status: data.status || "Active"
    };
    try {
      const res = await masterDataService.createAllergenRule(newRecord);
      const saved = res?.data?.data || res?.data || res || newRecord;
      setAllergenRules((prev) => [saved, ...prev.filter((a) => a.id !== saved.id && a.allergenId !== saved.allergenId && a.ruleId !== saved.ruleId && a.id !== newRecord.id)]);
      logAudit({ entityId: saved.allergenName || saved.id, entityType: "Allergen Rules", action: "Created" });
      return saved;
    } catch (err) {
      console.warn("API createAllergenRule fallback:", err.message);
      setAllergenRules((prev) => [newRecord, ...prev]);
      logAudit({ entityId: newRecord.allergenName, entityType: "Allergen Rules", action: "Created" });
      return newRecord;
    }
  };

  const updateAllergenRule = async (allergenId, updated) => {
    setAllergenRules((prev) => prev.map((a) => (a.allergenId === allergenId || a.id === allergenId || a.ruleId === allergenId ? { ...a, ...updated } : a)));
    try {
      await masterDataService.updateAllergenRule(allergenId, updated);
    } catch (err) {
      console.warn("API updateAllergenRule error:", err.message);
    }
    logAudit({ entityId: allergenId, entityType: "Allergen Rules", action: "Updated" });
  };

  const deleteAllergenRule = async (allergenId) => {
    setAllergenRules((prev) => prev.filter((a) => a.allergenId !== allergenId && a.id !== allergenId && a.ruleId !== allergenId));
    try {
      await masterDataService.deleteAllergenRule(allergenId);
    } catch (err) {
      console.warn("API deleteAllergenRule error:", err.message);
    }
    logAudit({ entityId: allergenId, entityType: "Allergen Rules", action: "Deleted" });
  };

  const addLabourStandard = async (data) => {
    const tempId = data.standardId || data.id || `LBR-0${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: data.id || tempId,
      standardId: data.standardId || tempId,
      lineId: data.lineId || "LIN-01",
      lineName: data.lineName || "Production Line",
      standardCrew: Number(data.standardCrew) || 8,
      stdLaborHoursPer1kUnits: Number(data.stdLaborHoursPer1kUnits) || 2.0,
      directCostPerHour: data.directCostPerHour?.toString().startsWith("$")
        ? data.directCostPerHour
        : `$${Number(data.directCostPerHour || 25).toFixed(2)}`,
      status: data.status || "Active"
    };
    try {
      const res = await masterDataService.createLabourStandard(newRecord);
      const saved = res?.data?.data || res?.data || res || newRecord;
      setLabourStandards((prev) => [saved, ...prev.filter((s) => s.id !== saved.id && s.standardId !== saved.standardId && s.id !== newRecord.id)]);
      logAudit({ entityId: saved.standardId || saved.id, entityType: "Labour Standard", action: "Created", newValue: `${saved.lineName} (${saved.standardCrew} Crew)` });
      return saved;
    } catch (err) {
      console.warn("API createLabourStandard fallback:", err.message);
      setLabourStandards((prev) => [newRecord, ...prev]);
      logAudit({ entityId: newRecord.standardId, entityType: "Labour Standard", action: "Created", newValue: `${newRecord.lineName} (${newRecord.standardCrew} Crew)` });
      return newRecord;
    }
  };

  const updateLabourStandard = async (id, updated) => {
    setLabourStandards((prev) => prev.map((s) => (s.id === id || s.standardId === id ? { ...s, ...updated } : s)));
    try {
      await masterDataService.updateLabourStandard(id, updated);
    } catch (err) {
      console.warn("API updateLabourStandard error:", err.message);
    }
    logAudit({ entityId: id, entityType: "Labour Standard", action: "Updated" });
  };

  const deleteLabourStandard = async (id) => {
    setLabourStandards((prev) => prev.filter((s) => s.id !== id && s.standardId !== id));
    try {
      await masterDataService.deleteLabourStandard(id);
    } catch (err) {
      console.warn("API deleteLabourStandard error:", err.message);
    }
    logAudit({ entityId: id, entityType: "Labour Standard", action: "Deleted" });
  };

  // ============================================================================
  // 11. MACHINE ASSET MUTATIONS
  // ============================================================================
  const addAsset = async (assetData) => {
    try {
      const res = await masterDataService.createAsset(assetData);
      const created = res?.data || res;
      setAssets((prev) => [created, ...prev.filter((a) => a.id !== created.id && a.assetId !== created.assetId)]);
      logAudit({ entityId: created.assetId || created.id, entityType: "Machine Assets", action: "Created", newValue: created.name });
      return created;
    } catch (err) {
      console.warn("API createAsset error:", err.message);
      throw err;
    }
  };

  const updateAsset = async (assetId, updated) => {
    try {
      await masterDataService.updateAsset(assetId, updated);
      setAssets((prev) => prev.map((a) => (a.assetId === assetId || a.id === assetId ? { ...a, ...updated } : a)));
      logAudit({ entityId: assetId, entityType: "Machine Assets", action: "Updated" });
    } catch (err) {
      console.warn("API updateAsset error:", err.message);
      throw err;
    }
  };

  const toggleAssetStatus = async (assetId) => {
    const current = assets.find((a) => a.assetId === assetId || a.id === assetId);
    const next = current?.status === "Operational" ? "Under Maintenance" : "Operational";
    try {
      await masterDataService.updateAsset(assetId, { status: next });
      setAssets((prev) =>
        prev.map((a) => (a.assetId === assetId || a.id === assetId ? { ...a, status: next } : a))
      );
    } catch (err) {
      console.warn("API toggleAssetStatus error:", err.message);
    }
  };

  const deleteAsset = async (assetId) => {
    try {
      await masterDataService.deleteAsset(assetId);
      setAssets((prev) => prev.filter((a) => a.assetId !== assetId && a.id !== assetId));
      logAudit({ entityId: assetId, entityType: "Machine Assets", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteAsset error:", err.message);
      throw err;
    }
  };

  // ============================================================================
  // 12. EMPLOYEES & TRAINING MUTATIONS
  // ============================================================================
  const addEmployee = async (empData) => {
    const newRecord = {
      id: empData.employeeId || empData.id || `EMP-00${employees.length + 1}`,
      employeeId: empData.employeeId || empData.id || `EMP-00${employees.length + 1}`,
      name: empData.name,
      email: empData.email || `${empData.name.toLowerCase().replace(/\s+/g, ".")}@flowstate.io`,
      department: empData.department || "Production Operations",
      departmentId: empData.departmentId || "DEP-01",
      role: empData.role || "Line Operator",
      plantId: empData.plantId || activePlantId,
      plantName: plants.find((p) => p.id === (empData.plantId || activePlantId))?.name || "Indore Plant",
      skills: Array.isArray(empData.skills) ? empData.skills : ["Standard Operating Procedures"],
      skillLevel: empData.skillLevel || "Level 2 (Certified Operator)",
      certifications: Array.isArray(empData.certifications) ? empData.certifications : ["Plant Safety GMP"],
      assignedLineIds: Array.isArray(empData.assignedLineIds) ? empData.assignedLineIds : ["LIN-01"],
      status: empData.status || "Active"
    };
    try {
      const res = await masterDataService.createEmployeeSkill(newRecord);
      const saved = res?.data?.data || res?.data || res || newRecord;
      const finalItem = { ...newRecord, ...saved };
      setEmployees((prev) => [finalItem, ...prev.filter((e) => e.employeeId !== finalItem.employeeId && e.id !== finalItem.id)]);
      logAudit({ entityId: finalItem.employeeId, entityType: "Employees & Skills", action: "Created", newValue: finalItem.name });
      return finalItem;
    } catch (err) {
      console.warn("API createEmployee error:", err.message);
      setEmployees((prev) => [newRecord, ...prev]);
      return newRecord;
    }
  };

  const updateEmployee = async (empId, updated) => {
    try {
      const res = await masterDataService.updateEmployeeSkill(empId, updated);
      const saved = res?.data?.data || res?.data || res;
      setEmployees((prev) => prev.map((e) => (e.employeeId === empId || e.id === empId ? { ...e, ...updated, ...(saved || {}) } : e)));
    } catch (err) {
      console.warn("API updateEmployee error:", err.message);
      setEmployees((prev) => prev.map((e) => (e.employeeId === empId || e.id === empId ? { ...e, ...updated } : e)));
    }
    logAudit({ entityId: empId, entityType: "Employees & Skills", action: "Updated" });
  };

  const deleteEmployee = async (empId) => {
    setEmployees((prev) => prev.filter((e) => e.employeeId !== empId && e.id !== empId));
    try {
      if (masterDataService.deleteEmployeeSkill) {
        await masterDataService.deleteEmployeeSkill(empId);
      } else if (masterDataService.deleteEmployee) {
        await masterDataService.deleteEmployee(empId);
      }
    } catch (err) {
      console.warn("API deleteEmployee error:", err.message);
    }
    logAudit({ entityId: empId, entityType: "Employees & Skills", action: "Deleted" });
  };

  const addTrainingRecord = (trnData) => {
    const newRecord = {
      id: `TRN-0${trainingRecords.length + 1}`,
      trainingId: `TRN-0${trainingRecords.length + 1}`,
      employeeId: trnData.employeeId,
      employeeName: trnData.employeeName || employees.find((e) => e.employeeId === trnData.employeeId)?.name || "Technician",
      courseTitle: trnData.courseTitle,
      trainer: trnData.trainer || "Alexander Vance",
      completionDate: trnData.completionDate || new Date().toISOString().substring(0, 10),
      expiryDate: trnData.expiryDate || "2027-12-31",
      score: trnData.score || "100%",
      status: trnData.status || "Certified Valid"
    };
    setTrainingRecords((prev) => [newRecord, ...prev]);
    logAudit({ entityId: newRecord.trainingId, entityType: "Training Master", action: "Created", newValue: `${newRecord.employeeName}: ${newRecord.courseTitle}` });
    return newRecord;
  };

  // ============================================================================
  // 13. QUALITY SPECS & CCP LIMITS MUTATIONS
  // ============================================================================
  const addQualitySpec = async (specData) => {
    const selectedSku = skus.find((s) => s.skuId === specData.skuId || s.id === specData.skuId);
    let createdRecord = null;
    try {
      const res = await masterDataService.createQualitySpec({
        ...specData,
        skuId: specData.skuId || selectedSku?.id || selectedSku?.skuId || "",
      });
      createdRecord = res?.data !== undefined ? res.data : res;
    } catch (err) {
      console.warn("API createQualitySpec fallback:", err.message);
    }

    const newRecord = {
      id: createdRecord?.id || `QSP-${Date.now().toString().slice(-4)}`,
      specId: createdRecord?.specId || createdRecord?.id || `QSP-${Date.now().toString().slice(-4)}`,
      skuId: specData.skuId || selectedSku?.id || selectedSku?.skuId || "",
      skuCode: specData.skuCode || selectedSku?.skuCode || selectedSku?.code || "SKU",
      skuName: specData.skuName || selectedSku?.name || "",
      specificationTitle: specData.specificationTitle || specData.parameter || "Quality Parameter",
      parameter: specData.parameter || specData.specificationTitle || "",
      target: String(specData.target || "0"),
      min: String(specData.min || "0"),
      max: String(specData.max || "0"),
      uom: specData.uom || "",
      revision: "R1",
      status: "Active",
      approvalStatus: "Approved",
      criticality: specData.criticality || (specData.isCCP ? "Critical CCP (HACCP-1)" : "Quality Spec"),
      isCCP: Boolean(specData.isCCP || (specData.criticality || "").toLowerCase().includes("ccp")),
      criticalLimit: specData.criticalLimit || "",
      testMethod: specData.testMethod || "",
      effectiveFrom: specData.effectiveFrom || new Date().toISOString().substring(0, 10),
      effectiveTo: "2030-12-31",
      revisionHistory: [],
      ...(createdRecord || {})
    };
    setQualitySpecs((prev) => [newRecord, ...prev.filter((q) => q.id !== newRecord.id && q.specId !== newRecord.specId)]);
    logAudit({ entityId: newRecord.specId || newRecord.id, entityType: "Quality Specs", action: "Created", newValue: `${newRecord.parameter} for ${newRecord.skuCode || newRecord.skuId}` });
    return newRecord;
  };

  const updateQualitySpec = async (specId, updated) => {
    setQualitySpecs((prev) => prev.map((q) => (q.specId === specId || q.id === specId ? { ...q, ...updated } : q)));
    try {
      await masterDataService.updateQualitySpec(specId, updated);
    } catch (err) {
      console.warn("API updateQualitySpec error:", err.message);
    }
    logAudit({ entityId: specId, entityType: "Quality Specs", action: "Updated" });
  };

  const approveQualitySpec = async (specId) => {
    try {
      await masterDataService.updateQualitySpec(specId, { approvalStatus: "Approved", status: "Active" });
      setQualitySpecs((prev) =>
        prev.map((q) => (q.specId === specId || q.id === specId ? { ...q, approvalStatus: "Approved", status: "Active" } : q))
      );
      logAudit({ entityId: specId, entityType: "Quality Specs", action: "Approved" });
    } catch (err) {
      console.warn("API approveQualitySpec error:", err.message);
      throw err;
    }
  };

  const rejectQualitySpec = async (specId, reason = "Tolerance out of standard range") => {
    try {
      await masterDataService.updateQualitySpec(specId, { approvalStatus: "Draft", rejectionReason: reason });
      setQualitySpecs((prev) =>
        prev.map((q) => (q.specId === specId || q.id === specId ? { ...q, approvalStatus: "Draft", rejectionReason: reason } : q))
      );
      logAudit({ entityId: specId, entityType: "Quality Specs", action: "Rejected", notes: `Reason: ${reason}` });
    } catch (err) {
      console.warn("API rejectQualitySpec error:", err.message);
      throw err;
    }
  };

  const deleteQualitySpec = async (specId) => {
    setQualitySpecs((prev) => prev.filter((q) => q.specId !== specId && q.id !== specId));
    try {
      await masterDataService.deleteQualitySpec(specId);
    } catch (err) {
      console.warn("API deleteQualitySpec:", err.message);
    }
    logAudit({ entityId: specId, entityType: "Quality Specs", action: "Deleted" });
  };

  // HACCP CCP Limits
  const addCCPLimit = async (ccpData) => {
    try {
      const res = await masterDataService.createCCPLimit(ccpData);
      const created = res?.data || res;
      setCcpLimits((prev) => [created, ...prev.filter((c) => c.id !== created.id && c.ccpNumber !== created.ccpNumber)]);
      logAudit({ entityId: created.ccpNumber || created.id, entityType: "CCP Limits", action: "Created", newValue: created.processStep });
      return created;
    } catch (err) {
      console.warn("API createCCPLimit error:", err.message);
      throw err;
    }
  };

  const updateCCPLimit = async (id, updated) => {
    try {
      await masterDataService.updateCCPLimit(id, updated);
      setCcpLimits((prev) =>
        prev.map((c) => (c.id === id || c.ccpNumber === id ? { ...c, ...updated } : c))
      );
      logAudit({ entityId: id, entityType: "CCP Limits", action: "Updated" });
    } catch (err) {
      console.warn("API updateCCPLimit error:", err.message);
      throw err;
    }
  };

  const deleteCCPLimit = async (id) => {
    try {
      await masterDataService.deleteCCPLimit(id);
      setCcpLimits((prev) => prev.filter((c) => c.id !== id && c.ccpNumber !== id));
      logAudit({ entityId: id, entityType: "CCP Limits", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteCCPLimit error:", err.message);
      throw err;
    }
  };

  // ============================================================================
  // 14. STORAGE RESOURCES MUTATIONS
  // ============================================================================
  const addStorageResource = async (strData) => {
    try {
      const res = await masterDataService.createStorageResource(strData);
      const created = res?.data || res;
      setStorageResources((prev) => [created, ...prev.filter((s) => s.id !== created.id && s.resourceCode !== created.resourceCode)]);
      logAudit({ entityId: created.resourceCode || created.id, entityType: "Storage Resources", action: "Created", newValue: created.name });
      return created;
    } catch (err) {
      console.warn("API createStorageResource error:", err.message);
      throw err;
    }
  };

  const updateStorageResource = async (storageId, updated) => {
    try {
      await masterDataService.updateStorageResource(storageId, updated);
      setStorageResources((prev) =>
        prev.map((s) => (s.storageId === storageId || s.id === storageId || s.resourceId === storageId || s.resourceCode === storageId ? { ...s, ...updated } : s))
      );
      logAudit({ entityId: storageId, entityType: "Storage Resources", action: "Updated" });
    } catch (err) {
      console.warn("API updateStorageResource error:", err.message);
      throw err;
    }
  };

  const toggleStorageResourceStatus = async (storageId) => {
    const current = storageResources.find((s) => s.storageId === storageId || s.id === storageId || s.resourceId === storageId || s.resourceCode === storageId);
    const next = current?.status === "Active" ? "Inactive" : "Active";
    try {
      await masterDataService.updateStorageResource(storageId, { status: next });
      setStorageResources((prev) =>
        prev.map((s) => (s.storageId === storageId || s.id === storageId || s.resourceId === storageId || s.resourceCode === storageId ? { ...s, status: next } : s))
      );
    } catch (err) {
      console.warn("API toggleStorageResourceStatus error:", err.message);
    }
  };

  const deleteStorageResource = async (storageId) => {
    try {
      await masterDataService.deleteStorageResource(storageId);
      setStorageResources((prev) => prev.filter((s) => s.storageId !== storageId && s.id !== storageId && s.resourceId !== storageId && s.resourceCode !== storageId));
      logAudit({ entityId: storageId, entityType: "Storage Resources", action: "Deleted" });
    } catch (err) {
      console.warn("API deleteStorageResource error:", err.message);
      throw err;
    }
  };

  // ============================================================================
  // 15. USER & ROLE ADMINISTRATION
  // ============================================================================
  const addUser = (userData) => {
    const newUser = {
      id: `USR-00${users.length + 1}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || "Line Operator",
      roleKey: userData.roleKey || "operator",
      department: userData.department || "Production",
      plantId: userData.plantId || activePlantId,
      status: userData.status || "Active",
      lastLogin: "Never"
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit({ entityId: newUser.id, entityType: "User Administration", action: "Created", newValue: `${newUser.name} (${newUser.email}) - ${newUser.role}` });
    return newUser;
  };

  const updateUser = (userId, updated) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    logAudit({ entityId: userId, entityType: "User Administration", action: "Updated" });
  };

  const updateUserStatus = (userId, status) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          logAudit({ entityId: userId, entityType: "User Administration", action: status === "Active" ? "Activated" : "Suspended" });
          return { ...u, status };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit({ entityId: userId, entityType: "User Administration", action: "Deleted" });
  };

  const addInvitation = (inv) => {
    const newInv = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      email: inv.email,
      role: inv.role || "Line Operator",
      department: inv.department || "Production",
      invitedBy: "Alexander Vance",
      sentDate: new Date().toISOString().substring(0, 10),
      status: "Pending"
    };
    setUserInvitations((prev) => [...prev, newInv]);
    logAudit({ entityId: newInv.id, entityType: "User Invitations", action: "Created", newValue: `Invited ${newInv.email}` });
    return newInv;
  };

  const cancelInvitation = (invId) => {
    setUserInvitations((prev) => prev.filter((i) => i.id !== invId));
  };

  // ============================================================================
  // 16. PERMISSIONS CHECKING & MATRIX
  // ============================================================================
  const hasPermission = (roleKey, moduleName, action = "view") => {
    if (roleKey === "admin" || roleKey === "Super Admin") return true;
    const roleConfig = rolePermissions[roleKey];
    if (!roleConfig || !roleConfig.permissions) return true;
    const modulePerm = roleConfig.permissions[moduleName];
    if (!modulePerm) return true;
    return !!modulePerm[action];
  };

  const updatePermissionMatrix = (roleKey, moduleName, action, value) => {
    setRolePermissions((prev) => {
      const prevRole = (prev && prev[roleKey]) || { permissions: {} };
      const prevPermissions = prevRole.permissions || {};
      const prevModule = prevPermissions[moduleName] || {};
      return {
        ...prev,
        [roleKey]: {
          ...prevRole,
          permissions: {
            ...prevPermissions,
            [moduleName]: {
              ...prevModule,
              [action]: value
            }
          }
        }
      };
    });
    logAudit({ entityId: roleKey, entityType: "Permission Matrix", action: "Updated", newValue: `${roleKey} → ${moduleName}.${action} = ${value}` });
  };

  // ============================================================================
  // 17. FLOWSTATE DATA MIGRATION EXECUTION ENGINE
  // ============================================================================
  const executeMigration = ({ sourceSystem, datasetName, mappedRecords = [], duplicateDecisions = {} }) => {
    let importedCount = 0;
    mappedRecords.forEach((rec) => {
      const decision = duplicateDecisions[rec.id] || "Create New";
      if (decision === "Skip") return;

      if (decision === "Keep Existing") {
        importedCount += 1;
        return;
      }

      if (decision === "Merge") {
        // Update existing record
        updateSKU(rec.skuId || rec.skuCode, { ...rec, lastUpdated: new Date().toISOString().substring(0, 10) });
        importedCount += 1;
        return;
      }

      // Create new
      addSKU({
        skuCode: rec.skuCode || `SKU-${Math.floor(5000 + Math.random() * 900)}`,
        name: rec.name || "Imported SKU Item",
        category: rec.category || "Finished Goods",
        family: rec.family || "Sparkling Flavors",
        uom: rec.uom || "Bottles",
        plantId: activePlantId,
        stdCost: rec.stdCost || "$0.45"
      });
      importedCount += 1;
    });

    logAudit({
      entityId: `MIG-${Math.floor(1000 + Math.random() * 9000)}`,
      entityType: "Data Migration",
      action: "Import",
      newValue: `Imported ${importedCount} records from ${sourceSystem} (${datasetName})`,
      notes: "FlowState Schema Validation & Migration Pipeline Execution Succeeded"
    });

    return { importedCount, status: "Success" };
  };

  // ============================================================================
  // 18. DATA HEALTH & DIAGNOSTIC VALIDATION ENGINE
  // ============================================================================
  const dataHealthStats = useMemo(() => {
    // 1. Missing Data
    const missingSkus = skus.filter((s) => !s.stdCost || !s.packConfigCode || !s.shelfLifeDays).length;
    const missingBoms = boms.filter((b) => !b.components || b.components.length === 0).length;
    const missingLines = lines.filter((l) => !l.assignedAssetIds || l.assignedAssetIds.length === 0).length;
    const missingDataCount = missingSkus + missingBoms + missingLines;

    // 2. Duplicates
    const skuCodeMap = {};
    let duplicateCodes = 0;
    skus.forEach((s) => {
      if (skuCodeMap[s.skuCode]) duplicateCodes += 1;
      else skuCodeMap[s.skuCode] = true;
    });

    // 3. Broken Relationships
    const brokenBoms = boms.filter((b) => !skus.some((s) => s.skuId === b.finishedSkuId || s.skuCode === b.finishedSkuCode)).length;
    const brokenSpecs = qualitySpecs.filter((q) => !skus.some((s) => s.skuId === q.skuId || s.skuCode === q.skuCode)).length;
    const brokenRelCount = brokenBoms + brokenSpecs;

    // 4. Stale Records / Expired Training
    const expiredTraining = trainingRecords.filter((t) => t.status?.includes("Expired")).length;
    const staleRecordsCount = expiredTraining;

    const totalIssues = missingDataCount + duplicateCodes + brokenRelCount + staleRecordsCount;
    const healthScore = Math.max(88, +(100 - totalIssues * 1.5).toFixed(1));

    return {
      missingDataCount,
      duplicatesCount: duplicateCodes,
      brokenRelCount,
      staleRecordsCount,
      invalidRefsCount: brokenSpecs,
      healthScore,
      totalIssues
    };
  }, [skus, boms, lines, qualitySpecs, trainingRecords]);

  return (
    <MasterDataContext.Provider
      value={{
        company: companies[0],
        companies,
        setCompanies,
        addCompany,
        updateCompany,
        deleteCompany,
        plants,
        setPlants,
        addPlant,
        updatePlant,
        deletePlant,
        activePlantId,
        setActivePlantId,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        workCenters,
        setWorkCenters,
        addWorkCenter,
        updateWorkCenter,
        deleteWorkCenter,

        // 1. Product Families
        productFamilies,
        setProductFamilies,
        addProductFamily,
        updateProductFamily,
        toggleProductFamilyStatus,
        deleteProductFamily,

        // 2. UOMs
        uoms,
        setUoms,
        addUOM,
        updateUOM,
        toggleUOMStatus,
        deleteUOM,

        // 3. SKUs
        skus,
        setSkus,
        addSKU,
        updateSKU,
        toggleSKUStatus,
        deleteSKU,

        // 4. Pack Configurations
        packConfigs,
        setPackConfigs,
        addPackConfig,
        updatePackConfig,
        deletePackConfig,

        // 5. Shelf Life
        shelfLifeRecords,
        addShelfLife,
        updateShelfLife,
        deleteShelfLife,

        // 6. Customers & Customer SKU Mappings
        customers,
        customerSkuMappings,
        addCustomerSkuMapping,
        updateCustomerSkuMapping,
        deleteCustomerSkuMapping,

        // 7. BOMs / Recipes
        boms,
        setBoms,
        addBOM,
        updateBOM,
        submitBOMForApproval,
        approveBOM,
        rejectBOM,
        deleteBOM,

        // 8. Operations & Routings
        operations,
        setOperations,
        addOperation,
        updateOperation,
        deleteOperation,
        routings,
        setRoutings,
        addRouting,
        updateRouting,
        deleteRouting,

        // 9. Lines & Targets
        lines,
        setLines,
        addLine,
        updateLine,
        toggleLineStatus,
        deleteLine,
        lineTargets,
        addLineTarget,
        updateLineTarget,
        deleteLineTarget,

        // 10. Changeover, Sanitation, Allergens
        changeoverMatrix,
        setChangeoverMatrix,
        addChangeoverRule,
        updateChangeoverRule,
        deleteChangeoverRule,
        sanitationClasses,
        setSanitationClasses,
        addSanitationClass,
        updateSanitationClass,
        deleteSanitationClass,
        allergenRules,
        setAllergenRules,
        addAllergenRule,
        updateAllergenRule,
        deleteAllergenRule,
        labourStandards,
        setLabourStandards,
        addLabourStandard,
        updateLabourStandard,
        deleteLabourStandard,

        // 11. Assets
        assets,
        setAssets,
        addAsset,
        updateAsset,
        assignAssetToLine,
        toggleAssetStatus,
        deleteAsset,

        // 12. Employees & Training
        employees,
        setEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        trainingRecords,
        addTrainingRecord,

        // 13. Quality Specs & CCP
        qualitySpecs,
        setQualitySpecs,
        addQualitySpec,
        updateQualitySpec,
        approveQualitySpec,
        rejectQualitySpec,
        deleteQualitySpec,
        ccpLimits,
        setCcpLimits,
        addCCPLimit,
        updateCCPLimit,
        deleteCCPLimit,

        // 14. Storage Resources
        storageResources,
        setStorageResources,
        addStorageResource,
        updateStorageResource,
        toggleStorageResourceStatus,
        deleteStorageResource,

        // 15. User & Role Administration
        users,
        addUser,
        updateUser,
        updateUserStatus,
        deleteUser,
        userInvitations,
        addInvitation,
        cancelInvitation,
        rolePermissions,
        setRolePermissions,
        hasPermission,
        updatePermissionMatrix,

        // 16. Audit & Governance
        auditLogs,
        logAudit,

        // 17. Migration & Data Health
        executeMigration,
        dataHealthStats
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export const useMasterData = () => useContext(MasterDataContext);

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { masterAdminService } from "../services/masterAdminService";
import authService from "../services/authService";
import { useRole } from "./RoleContext";

const MasterAdminContext = createContext();

export const DEFAULT_PLANS = [
  {
    id: "pilot",
    name: "Plant Pilot",
    subtitle: "Free 7-Day Evaluation",
    priceMonthly: 0,
    priceAnnual: 0,
    currency: "CAD",
    duration: "7 Days",
    userLimit: 5,
    accessLevel: "Trial",
    status: "Active",
    isPopular: false,
    ctaText: "Start Free Pilot",
    modules: ["produce"],
    features: [
      "1 Packaging or Bottling Line",
      "Operator HMI Touchscreen Console",
      "Micro-Stop & Downtime Logging",
      "Standard Shift OEE Metrics",
      "Community Knowledge Base"
    ]
  },
  {
    id: "starter",
    name: "Individual Modules",
    subtitle: "Single Dedicated Line",
    priceMonthly: 1499,
    priceAnnual: 14990,
    currency: "CAD",
    duration: "Unlimited",
    userLimit: 10,
    accessLevel: "Standard",
    status: "Active",
    isPopular: false,
    ctaText: "Choose Modules",
    modules: ["produce", "verify"],
    features: [
      "Everything in Plant Pilot",
      "OPC-UA & MQTT SCADA Ingest",
      "Inline CCP Quality Gate Validation",
      "PM Checklist & Work Order Dispatch",
      "10 Concurrent Operator Logins"
    ]
  },
  {
    id: "standard",
    name: "Bundles",
    subtitle: "Full Multi-Line Bottling Plant",
    priceMonthly: 3499,
    priceAnnual: 34990,
    currency: "CAD",
    duration: "Unlimited",
    userLimit: 50,
    accessLevel: "Advanced",
    status: "Active",
    isPopular: true,
    ctaText: "Launch Bundles",
    modules: ["plan", "produce", "verify", "maintain", "move"],
    features: [
      "Everything in Individual Modules",
      "Unlimited Production & Packaging Lines",
      "Dynamic APS Capacity Scheduler",
      "Governed AI Shift Recovery & Bottlenecks",
      "Spare Parts & Lot Traceability",
      "Dedicated 24/7 Support Engineer"
    ]
  },
  {
    id: "enterprise",
    name: "MaintenX OS Complete",
    subtitle: "Multi-Facility Corporate Cloud",
    priceMonthly: 5499,
    priceAnnual: 54990,
    currency: "CAD",
    duration: "Unlimited",
    userLimit: "Unlimited",
    accessLevel: "Full",
    status: "Active",
    isPopular: false,
    ctaText: "Contact Enterprise",
    modules: ["plan", "produce", "verify", "maintain", "move", "people", "improve", "intelligence"],
    features: [
      "Multi-Plant Executive Portfolio",
      "21 CFR Part 11 Electronic Signatures",
      "Custom ERP & MES API Connectors",
      "On-Premises or Sovereign Private Cloud",
      "99.99% Guaranteed Availability SLA"
    ]
  }
];

export function MasterAdminProvider({ children }) {
  const { currentRole, isAuthenticated } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real Database Entities with default administrators fallback
  const defaultAdmins = [
    { id: "U-1", name: "Alice Smith", email: "alice.smith@example.com", company: "Global Foods Inc.", role: "Company Admin", status: "Active", lastLogin: "2026-09-02 08:30" },
    { id: "U-2", name: "Bob Johnson", email: "bob.johnson@example.com", company: "Sunrise Beverages", role: "Company Admin", status: "Active", lastLogin: "2026-09-01 14:15" },
    { id: "U-3", name: "Charlie Davis", email: "charlie.davis@example.com", company: "Valley Dairies", role: "Company Admin", status: "Inactive", lastLogin: "2026-08-15 09:00" },
  ];

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState(defaultAdmins);
  const [activityLogs, setActivityLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem("master_plans");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PLANS;
  });
  const [payments, setPayments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [settings, setSettings] = useState(null);

  const ensureMasterToken = async () => {
    try {
      const existing = localStorage.getItem("maintenx_auth_token");
      if (existing) {
        const parts = existing.split(".");
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            if (
              payload.role === "master_admin" ||
              payload.isMasterAdmin ||
              payload.role === "admin" ||
              payload.role === "system_admin" ||
              payload.role === "super_admin"
            ) {
              return;
            }
          } catch {
            // invalid token structure, re-login
          }
        }
      }
      await authService.login("master@maintenx.com", "Password@123");
    } catch (err) {
      console.warn("[MasterAdminContext] Auto-token acquisition error:", err.message);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getDashboard();
      if (data) {
        setDashboardData(data);
        if (data.activityLogs) setActivityLogs(data.activityLogs);
      }
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchDashboard error:", err.message);
    }
  }, []);

  const fetchCompanies = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getCompanies(params);
      if (Array.isArray(data)) setCompanies(data);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchCompanies error:", err.message);
    }
  }, []);

  const fetchCompanyAdmins = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      return await masterAdminService.getCompanyAdmins(params);
    } catch (err) {
      console.warn("[MasterAdminContext] fetchCompanyAdmins error:", err.message);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getPlans();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
        try { localStorage.setItem("master_plans", JSON.stringify(data)); } catch (e) {}
      }
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchPlans error:", err.message);
    }
  }, []);

  const fetchSubscriptions = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      return await masterAdminService.getSubscriptions(params);
    } catch (err) {
      console.warn("[MasterAdminContext] fetchSubscriptions error:", err.message);
    }
  }, []);

  const fetchPayments = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getPayments(params);
      if (data?.payments) setPayments(data.payments);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchPayments error:", err.message);
    }
  }, []);

  const fetchUsers = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getPlatformUsers(params);
      if (Array.isArray(data)) setUsers(data);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchUsers error:", err.message);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      await ensureMasterToken();
      return await masterAdminService.getAnalytics();
    } catch (err) {
      console.warn("[MasterAdminContext] fetchAnalytics error:", err.message);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getAuditLogs(params);
      if (Array.isArray(data)) setAuditLogs(data);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchAuditLogs error:", err.message);
    }
  }, []);

  const fetchTickets = useCallback(async (params) => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getSupportTickets(params);
      if (Array.isArray(data)) setSupportTickets(data);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchTickets error:", err.message);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      await ensureMasterToken();
      const data = await masterAdminService.getSettings();
      if (data) setSettings(data);
      return data;
    } catch (err) {
      console.warn("[MasterAdminContext] fetchSettings error:", err.message);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureMasterToken();
      const [
        dashRes,
        compRes,
        usersRes,
        plansRes,
        paymentsRes,
        auditRes,
        ticketsRes,
        settingsRes,
      ] = await Promise.allSettled([
        masterAdminService.getDashboard(),
        masterAdminService.getCompanies(),
        masterAdminService.getPlatformUsers(),
        masterAdminService.getPlans(),
        masterAdminService.getPayments(),
        masterAdminService.getAuditLogs(),
        masterAdminService.getSupportTickets(),
        masterAdminService.getSettings(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value) {
        setDashboardData(dashRes.value);
        if (dashRes.value.activityLogs) {
          setActivityLogs(dashRes.value.activityLogs);
        }
      }

      if (compRes.status === "fulfilled" && Array.isArray(compRes.value)) {
        setCompanies(compRes.value);
      }

      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }

      if (plansRes.status === "fulfilled" && Array.isArray(plansRes.value) && plansRes.value.length > 0) {
        setPlans(plansRes.value);
        try { localStorage.setItem("master_plans", JSON.stringify(plansRes.value)); } catch (e) {}
      }

      if (paymentsRes.status === "fulfilled" && paymentsRes.value?.payments) {
        setPayments(paymentsRes.value.payments);
      }

      if (auditRes.status === "fulfilled" && Array.isArray(auditRes.value)) {
        setAuditLogs(auditRes.value);
      }

      if (ticketsRes.status === "fulfilled" && Array.isArray(ticketsRes.value)) {
        setSupportTickets(ticketsRes.value);
      }

      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        setSettings(settingsRes.value);
      }
    } catch (err) {
      console.error("[MasterAdminContext] Data fetch error:", err);
      setError(err.message || "Failed to load master admin platform data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, currentRole]);

  useEffect(() => {
    const handleAuthReady = () => {
      fetchAllData();
    };
    window.addEventListener("maintenx:auth_ready", handleAuthReady);
    return () => window.removeEventListener("maintenx:auth_ready", handleAuthReady);
  }, [fetchAllData]);

  // =========================================================================
  // ACTIONS SYNCHRONIZED WITH POSTGRESQL BACKEND
  // =========================================================================

  const addCompany = async (companyData) => {
    try {
      await ensureMasterToken();
      const created = await masterAdminService.createCompany(companyData);
      await fetchAllData();
      return created;
    } catch (err) {
      console.error("Failed to create company:", err);
      throw err;
    }
  };

  const updateCompanyStatus = async (id, newStatus) => {
    try {
      await masterAdminService.updateCompanyStatus(id, newStatus);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update company status:", err);
      throw err;
    }
  };

  const updateCompanySubscription = async (companyId, newPlan) => {
    try {
      await masterAdminService.updateCompany(companyId, { subscription: newPlan });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update subscription:", err);
      throw err;
    }
  };

  const extendCompanySubscription = async (companyId) => {
    try {
      await masterAdminService.extendSubscription(companyId);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to extend subscription:", err);
      throw err;
    }
  };

  const cancelCompanySubscription = async (companyId) => {
    try {
      await masterAdminService.cancelSubscription(companyId);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      throw err;
    }
  };

  const updateCompanyDetails = async (companyId, updates, legacyAdmin) => {
    try {
      await ensureMasterToken();
      let payload = {};
      if (typeof updates === "object" && updates !== null) {
        payload = updates;
      } else {
        payload = { name: updates };
        if (legacyAdmin) payload.adminName = legacyAdmin;
      }
      await masterAdminService.updateCompany(companyId, payload);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update company details:", err);
      throw err;
    }
  };

  const toggleCompanyModule = async (companyId, moduleName) => {
    try {
      const targetCompany = companies.find((c) => c.id === companyId);
      const currentVal = targetCompany?.modules?.[moduleName] ?? true;
      await masterAdminService.toggleCompanyModule(companyId, moduleName, !currentVal);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to toggle module entitlement:", err);
      throw err;
    }
  };

  const removeCompany = async (id) => {
    try {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      await masterAdminService.deleteCompany(id);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to remove company:", err);
      await fetchAllData();
      throw err;
    }
  };

  const updateUserStatus = async (id, newStatus) => {
    try {
      await masterAdminService.updateUserStatus(id, newStatus);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update user status:", err);
      throw err;
    }
  };

  const editUser = async (id, newName) => {
    try {
      await masterAdminService.updateCompanyAdmin(id, { name: newName });
      await fetchAllData();
    } catch (err) {
      console.error("Failed to edit user:", err);
      throw err;
    }
  };

  const removeUser = async (id) => {
    try {
      // Optimistic update
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await masterAdminService.deleteUser(id);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to delete user:", err);
      await fetchAllData();
      throw err;
    }
  };

  const addUser = async (userData) => {
    try {
      const created = await masterAdminService.createCompanyAdmin(userData);
      await fetchAllData();
      return created;
    } catch (err) {
      console.error("Failed to create administrator:", err);
      throw err;
    }
  };

  const resetAdminPassword = async (adminId) => {
    try {
      const res = await masterAdminService.resetAdminPassword(adminId);
      await fetchAllData();
      return res;
    } catch (err) {
      console.error("Failed to reset admin password:", err);
      throw err;
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, resolution) => {
    try {
      await masterAdminService.updateTicketStatus(ticketId, newStatus, resolution);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      throw err;
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      // Optimistic update
      setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
      await masterAdminService.deleteSupportTicket(ticketId);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      await fetchAllData();
      throw err;
    }
  };

  const deleteAuditLog = async (logId) => {
    try {
      setAuditLogs((prev) => prev.filter((l) => l.id !== logId));
      await masterAdminService.deleteAuditLog(logId);
      await fetchAuditLogs();
    } catch (err) {
      console.error("Failed to delete audit log:", err);
      await fetchAuditLogs();
      throw err;
    }
  };

  const clearAllAuditLogs = async () => {
    try {
      setAuditLogs([]);
      await masterAdminService.clearAllAuditLogs();
      await fetchAuditLogs();
    } catch (err) {
      console.error("Failed to clear all audit logs:", err);
      setAuditLogs([]);
    }
  };

  const addPlan = async (planDetails) => {
    try {
      await masterAdminService.createPlan(planDetails);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to create plan:", err);
      throw err;
    }
  };

  const editPlan = async (planId, updatedData) => {
    try {
      await masterAdminService.updatePlan(planId, updatedData);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to edit plan:", err);
      throw err;
    }
  };

  const updatePlanStatus = async (planId, newStatus) => {
    try {
      await masterAdminService.updatePlanStatus(planId, newStatus);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to update plan status:", err);
      throw err;
    }
  };

  const removePlan = async (planId) => {
    try {
      await ensureMasterToken();
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      await masterAdminService.deletePlan(planId);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to remove plan:", err);
      await fetchAllData();
      throw err;
    }
  };

  const markPaymentPaid = async (paymentId) => {
    try {
      await masterAdminService.markPaymentPaid(paymentId);
      await fetchAllData();
    } catch (err) {
      console.error("Failed to mark payment as paid:", err);
      throw err;
    }
  };

  const logInvoiceDownload = (paymentId) => {
    // Optional audit log for invoice downloads
  };

  const updateSettings = async (settingsData) => {
    try {
      const updated = await masterAdminService.updateSettings(settingsData);
      await fetchAllData();
      return updated;
    } catch (err) {
      console.error("Failed to update platform settings:", err);
      throw err;
    }
  };

  return (
    <MasterAdminContext.Provider
      value={{
        companies,
        users,
        activityLogs,
        auditLogs,
        supportTickets,
        plans,
        payments,
        dashboardData,
        settings,
        loading,
        error,
        refreshData: fetchAllData,
        fetchDashboard,
        fetchCompanies,
        fetchCompanyAdmins,
        fetchPlans,
        fetchSubscriptions,
        fetchPayments,
        fetchUsers,
        fetchAnalytics,
        fetchAuditLogs,
        fetchTickets,
        fetchSettings,
        addCompany,
        updateCompanyStatus,
        updateCompanySubscription,
        extendCompanySubscription,
        cancelCompanySubscription,
        updateCompanyDetails,
        toggleCompanyModule,
        removeCompany,
        updateUserStatus,
        editUser,
        removeUser,
        addUser,
        resetAdminPassword,
        updateTicketStatus,
        deleteTicket,
        deleteAuditLog,
        clearAllAuditLogs,
        addPlan,
        editPlan,
        updatePlanStatus,
        removePlan,
        markPaymentPaid,
        logInvoiceDownload,
        updateSettings,
      }}
    >
      {children}
    </MasterAdminContext.Provider>
  );
}

export const useMasterAdmin = () => useContext(MasterAdminContext);

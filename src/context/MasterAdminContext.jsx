import React, { createContext, useContext, useState, useEffect } from "react";

const MasterAdminContext = createContext();

export function MasterAdminProvider({ children }) {
  // Initial Mock Data
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem("master_companies");
    return saved ? JSON.parse(saved) : [
      {
        id: "C-1001",
        name: "Global Foods Inc.",
        status: "Active",
        subscription: "Enterprise",
        admin: "Alice Smith",
        adminEmail: "alice@globalfoods.com",
        usersCount: 145,
        createdAt: "2024-01-15",
        expiryDate: "2025-01-15",
        lastActivity: "2026-09-02 10:30",
        modules: {
          production: true,
          quality: true,
          maintenance: true,
          warehouse: true,
          ci: true
        }
      },
      {
        id: "C-1002",
        name: "Sunrise Beverages",
        status: "Active",
        subscription: "Professional",
        admin: "Bob Johnson",
        adminEmail: "bob@sunrisebev.com",
        usersCount: 42,
        createdAt: "2024-03-22",
        expiryDate: "2025-03-22",
        lastActivity: "2026-09-01 14:15",
        modules: {
          production: true,
          quality: true,
          maintenance: false,
          warehouse: true,
          ci: false
        }
      },
      {
        id: "C-1003",
        name: "Valley Dairies",
        status: "Suspended",
        subscription: "Basic",
        admin: "Charlie Davis",
        adminEmail: "charlie@valleydairies.com",
        usersCount: 18,
        createdAt: "2023-11-05",
        expiryDate: "2024-11-05",
        lastActivity: "2026-08-15 09:00",
        modules: {
          production: true,
          quality: false,
          maintenance: false,
          warehouse: false,
          ci: false
        }
      }
    ];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("master_users");
    return saved ? JSON.parse(saved) : [
      { id: "U-5001", name: "Alice Smith", role: "Company Admin", company: "Global Foods Inc.", status: "Active", lastLogin: "2026-09-02 08:30" },
      { id: "U-5002", name: "Bob Johnson", role: "Company Admin", company: "Sunrise Beverages", status: "Active", lastLogin: "2026-09-01 14:15" },
      { id: "U-5003", name: "Charlie Davis", role: "Company Admin", company: "Valley Dairies", status: "Inactive", lastLogin: "2026-08-15 09:00" },
      { id: "U-5004", name: "David Miller", role: "Plant Manager", company: "Global Foods Inc.", status: "Active", lastLogin: "2026-09-02 10:45" },
      { id: "U-5005", name: "Eva Wilson", role: "Quality QA", company: "Sunrise Beverages", status: "Active", lastLogin: "2026-09-02 07:15" }
    ];
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem("master_activity");
    return saved ? JSON.parse(saved) : [
      { id: 1, action: "User Added", details: "David Miller added to Global Foods Inc.", date: "2026-09-02 10:30:00" },
      { id: 2, action: "Subscription Updated", details: "Sunrise Beverages upgraded to Professional", date: "2026-09-01 15:45:00" },
      { id: 3, action: "Company Suspended", details: "Valley Dairies account suspended due to billing", date: "2026-08-15 11:20:00" }
    ];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("master_audit");
    return saved ? JSON.parse(saved) : [
      { id: "AL-901", user: "System", event: "Billing Suspension", target: "Valley Dairies", date: "2026-08-15 11:20:00", ip: "192.168.1.1" },
      { id: "AL-902", user: "Master Admin", event: "Change Plan", target: "Sunrise Beverages", date: "2026-09-01 15:45:00", ip: "10.0.0.5" },
      { id: "AL-903", user: "Alice Smith", event: "Create User", target: "David Miller", date: "2026-09-02 10:30:00", ip: "172.16.0.12" }
    ];
  });

  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem("master_tickets");
    return saved ? JSON.parse(saved) : [
      { id: "TKT-1042", company: "Global Foods Inc.", subject: "Cannot access CI module", status: "Open", priority: "High", date: "2024-09-02 10:30" },
      { id: "TKT-1043", company: "Sunrise Beverages", subject: "Billing issue with pro plan", status: "In Progress", priority: "Medium", date: "2024-09-01 14:15" },
      { id: "TKT-1044", company: "Valley Dairies", subject: "Requesting more user seats", status: "Resolved", priority: "Low", date: "2024-08-28 09:00" },
      { id: "TKT-1045", company: "TechCorp", subject: "API Integration Help", status: "Open", priority: "High", date: "2024-09-03 08:45" }
    ];
  });

  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem("master_plans");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Trial", priceMonthly: 0, priceAnnual: 0, duration: "14 Days", userLimit: 5, accessLevel: "Basic", status: "Active", features: ["Core Modules", "Community Support"] },
      { id: 2, name: "Basic", priceMonthly: 49, priceAnnual: 490, duration: "Unlimited", userLimit: 10, accessLevel: "Standard", status: "Active", features: ["Production", "Inventory", "Email Support"] },
      { id: 3, name: "Professional", priceMonthly: 199, priceAnnual: 1990, duration: "Unlimited", userLimit: 50, accessLevel: "Advanced", status: "Active", features: ["All Basic", "Quality", "Maintenance", "Priority Support"] },
      { id: 4, name: "Enterprise", priceMonthly: 499, priceAnnual: 4990, duration: "Unlimited", userLimit: "Unlimited", accessLevel: "Full", status: "Active", features: ["All Professional", "CI", "Custom API", "24/7 Support", "Dedicated Success Manager"] }
    ];
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem("master_payments");
    return saved ? JSON.parse(saved) : [
      { id: "INV-2024-001", company: "Global Foods Inc.", amount: 4990, date: "2024-01-15", status: "Paid", method: "Credit Card (ending 4242)", plan: "Enterprise Annual" },
      { id: "INV-2024-002", company: "Sunrise Beverages", amount: 1990, date: "2024-03-22", status: "Paid", method: "Wire Transfer", plan: "Professional Annual" },
      { id: "INV-2024-003", company: "Valley Dairies", amount: 49, date: "2024-08-05", status: "Overdue", method: "Credit Card (ending 1111)", plan: "Basic Monthly" },
      { id: "INV-2024-004", company: "Global Foods Inc.", amount: 4990, date: "2023-01-15", status: "Paid", method: "Credit Card (ending 4242)", plan: "Enterprise Annual" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("master_companies", JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem("master_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("master_activity", JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem("master_audit", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("master_tickets", JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem("master_plans", JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem("master_payments", JSON.stringify(payments));
  }, [payments]);

  // Actions
  const addActivity = (action, details) => {
    const newLog = {
      id: Date.now(),
      action,
      details,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addAuditLog = (user, event, target) => {
    const newAudit = {
      id: `AL-${Math.floor(Math.random() * 1000) + 1000}`,
      user,
      event,
      target,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip: "10.0.0." + Math.floor(Math.random() * 255)
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const addCompany = (companyData) => {
    const newCompany = {
      ...companyData,
      id: `C-${Math.floor(Math.random() * 1000) + 2000}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCompanies(prev => [...prev, newCompany]);
    
    // Also add the admin as a user
    const newUser = {
      id: `U-${Math.floor(Math.random() * 1000) + 6000}`,
      name: companyData.admin,
      role: "Company Admin",
      company: companyData.name,
      status: "Active",
      lastLogin: "Never"
    };
    setUsers(prev => [...prev, newUser]);

    addActivity("Company Created", `${companyData.name} was added to the platform.`);
    addAuditLog("Master Admin", "Create Company", companyData.name);
  };

  const updateCompanyStatus = (id, newStatus) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    const company = companies.find(c => c.id === id);
    addActivity(`Company ${newStatus}`, `${company?.name} status changed to ${newStatus}.`);
    addAuditLog("Master Admin", "Change Status", company?.name);
  };

  const updateCompanySubscription = (companyId, newPlan) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, subscription: newPlan } : c));
    const company = companies.find(c => c.id === companyId);
    addActivity("Plan Changed", `${company?.name} plan updated to ${newPlan}.`);
    addAuditLog("Master Admin", "Change Plan", company?.name);
  };

  const extendCompanySubscription = (companyId) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const currentExpiry = c.expiryDate ? new Date(c.expiryDate) : new Date();
        currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
        return { ...c, expiryDate: currentExpiry.toISOString().split('T')[0] };
      }
      return c;
    }));
    const company = companies.find(c => c.id === companyId);
    addActivity("Subscription Extended", `${company?.name} subscription extended by 1 year.`);
    addAuditLog("Master Admin", "Extend Subscription", company?.name);
  };

  const cancelCompanySubscription = (companyId) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: "Suspended", subscription: "Trial" } : c));
    const company = companies.find(c => c.id === companyId);
    addActivity("Subscription Cancelled", `${company?.name} subscription was cancelled.`);
    addAuditLog("Master Admin", "Cancel Subscription", company?.name);
  };

  const updateCompanyDetails = (companyId, newName, newAdmin) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, name: newName, admin: newAdmin } : c));
    addActivity("Company Details Updated", `Details updated for ${newName}.`);
    addAuditLog("Master Admin", "Edit Company", newName);
  };

  const toggleCompanyModule = (companyId, moduleName) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          modules: { ...c.modules, [moduleName]: !c.modules[moduleName] }
        };
      }
      return c;
    }));
    const company = companies.find(c => c.id === companyId);
    const isEnabled = !company?.modules[moduleName];
    addActivity("Module Toggled", `${moduleName} ${isEnabled ? 'enabled' : 'disabled'} for ${company?.name}.`);
    addAuditLog("Master Admin", "Toggle Module", company?.name);
  };

  const removeCompany = (id) => {
    const company = companies.find(c => c.id === id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    addActivity("Company Removed", `${company?.name} was removed from the platform.`);
    addAuditLog("Master Admin", "Remove Company", company?.name);
  };

  const updateUserStatus = (id, newStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    const user = users.find(u => u.id === id);
    addActivity(`User ${newStatus}`, `${user?.name} status changed to ${newStatus}.`);
    addAuditLog("Master Admin", "Change User Status", user?.name);
  };

  const editUser = (id, newName) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name: newName } : u));
    addActivity(`User Updated`, `User name updated to ${newName}.`);
    addAuditLog("Master Admin", "Edit User", newName);
  };

  const removeUser = (id) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addActivity("User Removed", `${user?.name} was removed from the platform.`);
    addAuditLog("Master Admin", "Remove User", user?.name);
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: `U-${Math.floor(Math.random() * 1000) + 6000}`,
      status: "Active",
      lastLogin: "Never"
    };
    setUsers(prev => [...prev, newUser]);
    addActivity("User Added", `${userData.name} added to ${userData.company}.`);
    addAuditLog("Master Admin", "Create User", userData.name);
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    const ticket = supportTickets.find(t => t.id === ticketId);
    addActivity("Ticket Updated", `Ticket ${ticketId} from ${ticket?.company} marked as ${newStatus}.`);
    addAuditLog("Master Admin", "Update Ticket", ticketId);
  };

  const addPlan = (planDetails) => {
    const newPlan = { ...planDetails, id: Date.now(), status: "Active" };
    setPlans(prev => [...prev, newPlan]);
    addActivity("Plan Created", `New subscription plan ${planDetails.name} created.`);
    addAuditLog("Master Admin", "Create Plan", planDetails.name);
  };

  const editPlan = (planId, newPrice) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, priceMonthly: newPrice } : p));
    addActivity("Plan Updated", `Price updated for plan ID ${planId}.`);
    addAuditLog("Master Admin", "Edit Plan", String(planId));
  };
  
  const updatePlanStatus = (planId, newStatus) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
    addActivity("Plan Status Updated", `Plan ID ${planId} status changed to ${newStatus}.`);
    addAuditLog("Master Admin", "Update Plan Status", String(planId));
  };

  const removePlan = (planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    addActivity("Plan Removed", `Plan ID ${planId} was removed.`);
    addAuditLog("Master Admin", "Remove Plan", String(planId));
  };

  const markPaymentPaid = (paymentId) => {
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: "Paid" } : p));
    addActivity("Payment Received", `Invoice ${paymentId} was marked as paid.`);
    addAuditLog("Master Admin", "Mark Payment Paid", paymentId);
  };

  const logInvoiceDownload = (paymentId) => {
    addAuditLog("Master Admin", "Download Invoice", paymentId);
  };

  return (
    <MasterAdminContext.Provider value={{
      companies,
      users,
      activityLogs,
      auditLogs,
      supportTickets,
      plans,
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
      updateTicketStatus,
      addPlan,
      editPlan,
      updatePlanStatus,
      removePlan,
      payments,
      markPaymentPaid,
      logInvoiceDownload
    }}>
      {children}
    </MasterAdminContext.Provider>
  );
}

export const useMasterAdmin = () => useContext(MasterAdminContext);

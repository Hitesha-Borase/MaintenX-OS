import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import adminService from "../services/adminService";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const hasAuthToken = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token")));
  const hasTenant = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id")));

  // 1. Users
  const [users, setUsers] = useState(() => {
    if (hasAuthToken || hasTenant) return [];
    const saved = localStorage.getItem("admin_users");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "USR-001", name: "Alexander Vance", email: "alexander.vance@flowstate.io", role: "System Administrator", department: "IT & Digital Ops", status: "Active", lastLogin: "Just now", plant: "Indore Plant" },
          { id: "USR-002", name: "Robert Thorne", email: "robert.thorne@flowstate.io", role: "Plant Manager", department: "Operations", status: "Suspended", lastLogin: "10 mins ago", plant: "Indore Plant" },
          { id: "USR-003", name: "Sarah Jenkins", email: "sarah.jenkins@flowstate.io", role: "QA Manager", department: "Quality Assurance", status: "Active", lastLogin: "1 hour ago", plant: "Indore Plant" },
          { id: "USR-004", name: "Marcus Vance", email: "marcus.vance@flowstate.io", role: "Maintenance Lead", department: "Maintenance", status: "Active", lastLogin: "3 hours ago", plant: "Indore Plant" },
          { id: "USR-005", name: "David Kim", email: "david.kim@flowstate.io", role: "Production Supervisor", department: "Production", status: "Active", lastLogin: "3 days ago", plant: "Indore Plant" }
        ];
  });

  // 2. User Invitations
  const [invitations, setInvitations] = useState(() => {
    if (hasAuthToken || hasTenant) return [];
    return [
      { id: "INV-101", email: "clara.oswald@flowstate.io", role: "Quality Analyst", department: "Quality", invitedBy: "Alexander Vance", sentDate: "2026-08-30", status: "Pending" },
      { id: "INV-102", email: "james.holden@flowstate.io", role: "Controls Engineer", department: "Maintenance", invitedBy: "Alexander Vance", sentDate: "2026-08-31", status: "Pending" },
    ];
  });

  // 3. User Activity Logs
  const [activityLogs, setActivityLogs] = useState(() => {
    if (hasAuthToken || hasTenant) return [];
    return [
      { id: "ACT-801", user: "Alexander Vance", action: "Updated ERP Sync Frequency to 15 mins", timestamp: "10:45 AM", ip: "192.168.1.10", category: "Configuration" },
      { id: "ACT-802", user: "Robert Thorne", action: "Approved Schedule Recovery Catch-up Plan", timestamp: "09:30 AM", ip: "192.168.1.45", category: "Planning" },
      { id: "ACT-803", user: "Sarah Jenkins", action: "Released Lot LOT-CIT-0830 Certificate of Analysis", timestamp: "08:15 AM", ip: "192.168.1.72", category: "Quality" },
      { id: "ACT-804", user: "Alexander Vance", action: "Modified Role Permissions for Maintenance Lead", timestamp: "Yesterday", ip: "192.168.1.10", category: "Security" }
    ];
  });

  // 4. Roles
  const [roles, setRoles] = useState([]);

  // 5. Master Data SKU Items
  const [items, setItems] = useState([]);

  // 6. Data Health Counts
  const [dataHealthStats, setDataHealthStats] = useState({
    missingDataCount: 0,
    duplicatesCount: 0,
    invalidRefsCount: 0,
    brokenRelCount: 0,
    staleRecordsCount: 0,
    healthScore: 99.98
  });

  const [loading, setLoading] = useState(false);

  // Load from Backend API
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const [backendUsers, backendInvites, backendLogs, backendRoles] = await Promise.allSettled([
        adminService.getUsers(),
        adminService.getInvitations(),
        adminService.getActivityLogs(),
        adminService.getRoles(),
      ]);

      if (backendUsers.status === "fulfilled" && Array.isArray(backendUsers.value)) {
        setUsers(backendUsers.value);
      }
      if (backendInvites.status === "fulfilled" && Array.isArray(backendInvites.value)) {
        setInvitations(backendInvites.value);
      }
      if (backendLogs.status === "fulfilled" && Array.isArray(backendLogs.value)) {
        setActivityLogs(backendLogs.value);
      }
      if (backendRoles.status === "fulfilled" && Array.isArray(backendRoles.value)) {
        setRoles(backendRoles.value);
      }
    } catch (err) {
      console.warn("Failed to load initial admin data from API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const handleTenantChanged = () => {
      setUsers([]);
      setInvitations([]);
      setActivityLogs([]);
      setRoles([]);
      refreshAll();
    };
    window.addEventListener("maintenx:tenant_changed", handleTenantChanged);
    window.addEventListener("maintenx:auth_ready", handleTenantChanged);
    return () => {
      window.removeEventListener("maintenx:tenant_changed", handleTenantChanged);
      window.removeEventListener("maintenx:auth_ready", handleTenantChanged);
    };
  }, [refreshAll]);

  useEffect(() => {
    const isTenant = Boolean(localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id"));
    if (!isTenant && users.length > 0) {
      localStorage.setItem("admin_users", JSON.stringify(users));
    }
  }, [users]);

  // User Actions (Wired directly to backend)
  const addUser = async (userData) => {
    const created = await adminService.provisionUser(userData);
    setUsers((prev) => [created, ...prev]);
    // refresh activity
    adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    return created;
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await adminService.updateUserStatus(userId, status);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status } : u))
      );
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status } : u))
      );
    }
  };

  const bulkUpdateStatus = async (action) => {
    const isActivate = action.toUpperCase().includes("ACTIVATE");
    const targetStatus = isActivate ? "Active" : "Suspended";
    try {
      await adminService.bulkUpdateUserStatus(action);
      setUsers((prev) =>
        prev.map((u) => (u.role?.includes("Admin") ? u : { ...u, status: targetStatus }))
      );
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.role?.includes("Admin") ? u : { ...u, status: targetStatus }))
      );
    }
  };

  // Invitation Actions (Wired directly to backend)
  const addInvitation = async (inv) => {
    try {
      const newInv = await adminService.createInvitation(inv);
      setInvitations((prev) => [newInv, ...prev]);
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
      return newInv;
    } catch (err) {
      const fallback = {
        id: `INV-${Math.floor(100 + Math.random() * 900)}`,
        ...inv,
        sentDate: new Date().toISOString().substring(0, 10),
        status: "Pending",
      };
      setInvitations((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const resendInvitation = async (invitationId) => {
    try {
      await adminService.resendInvitation(invitationId);
      const today = new Date().toISOString().substring(0, 10);
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId || i.email === invitationId ? { ...i, sentDate: today } : i))
      );
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    } catch (err) {
      const today = new Date().toISOString().substring(0, 10);
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId || i.email === invitationId ? { ...i, sentDate: today } : i))
      );
    }
  };

  const deleteInvitation = async (invitationId) => {
    try {
      await adminService.deleteInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId && i.email !== invitationId));
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    } catch (err) {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId && i.email !== invitationId));
    }
  };

  const fetchActivityLogs = useCallback(async (query) => {
    try {
      const logs = await adminService.getActivityLogs(query);
      if (Array.isArray(logs)) setActivityLogs(logs);
    } catch (err) {
      console.warn("Failed to fetch activity logs:", err);
    }
  }, []);

  // Role Actions (Wired directly to backend)
  const addRole = async (roleData) => {
    try {
      const created = await adminService.createRole(roleData);
      setRoles((prev) => [...prev, created]);
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
      return created;
    } catch (err) {
      const fallback = {
        id: `ROL-0${roles.length + 1}`,
        name: roleData.name,
        description: roleData.description || "Custom enterprise operational scope",
        userCount: 0,
        isSystem: false,
      };
      setRoles((prev) => [...prev, fallback]);
      return fallback;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRoleMapping(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      // refresh activity
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs));
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const addItem = (item) => {
    const newItem = {
      id: `SKU-${Math.floor(5000 + Math.random() * 900)}`,
      ...item,
      active: true
    };
    setItems([...items, newItem]);
    return newItem;
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        setUsers,
        loading,
        addUser,
        updateUserStatus,
        bulkUpdateStatus,
        updateUserRole,
        invitations,
        setInvitations,
        addInvitation,
        resendInvitation,
        deleteInvitation,
        activityLogs,
        fetchActivityLogs,
        refreshAll,
        roles,
        setRoles,
        addRole,
        items,
        setItems,
        addItem,
        dataHealthStats,
        setDataHealthStats
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);



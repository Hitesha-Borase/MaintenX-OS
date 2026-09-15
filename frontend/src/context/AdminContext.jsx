import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import adminService from "../services/adminService";

const defaultAdminContext = {
  users: [],
  setUsers: () => {},
  loading: false,
  addUser: async () => {},
  editUser: async () => {},
  deleteUser: async () => {},
  updateUserStatus: async () => {},
  bulkUpdateStatus: async () => {},
  updateUserRole: async () => {},
  invitations: [],
  setInvitations: () => {},
  addInvitation: async () => {},
  updateInvitation: async () => {},
  resendInvitation: async () => {},
  deleteInvitation: async () => {},
  activityLogs: [],
  fetchActivityLogs: async () => {},
  refreshAll: async () => {},
  roles: [],
  setRoles: () => {},
  addRole: async () => {},
  updateRole: async () => {},
  deleteRole: async () => {},
  items: [],
  setItems: () => {},
  addItem: async () => {},
  dataHealthStats: {
    missingDataCount: 0,
    duplicatesCount: 0,
    invalidRefsCount: 0,
    brokenRelCount: 0,
    staleRecordsCount: 0,
    healthScore: 100
  },
  setDataHealthStats: () => {}
};

const AdminContext = createContext(defaultAdminContext);

export function AdminProvider({ children }) {
  const hasAuthToken = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_auth_token") || localStorage.getItem("flowstate_token")));
  const hasTenant = Boolean(typeof window !== "undefined" && (localStorage.getItem("maintenx_tenant_name") || localStorage.getItem("maintenx_tenant_id")));

  // 1. Users (Directly synchronized with PostgreSQL users table with offline/mock fallback)
  const [users, setUsers] = useState(() => {
    if (hasAuthToken || hasTenant) return [];
    const saved = typeof window !== "undefined" ? localStorage.getItem("admin_users") : null;
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
        localStorage.setItem("admin_users", JSON.stringify(backendUsers.value));
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
    if (created && created.id) {
      setUsers((prev) => {
        const filtered = prev.filter(
          (u) => u.id !== created.id && u.email?.toLowerCase() !== created.email?.toLowerCase()
        );
        return [created, ...filtered];
      });
    }
    // Live resync with DB
    adminService.getUsers().then((liveUsers) => {
      if (Array.isArray(liveUsers)) {
        setUsers(liveUsers);
      }
    }).catch(() => {});
    // refresh activity
    adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    return created;
  };

  const editUser = async (userId, userData) => {
    const updated = await adminService.editUser(userId, userData);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId || u.email?.toLowerCase() === updated.email?.toLowerCase() ? { ...u, ...updated } : u))
    );
    // Live resync with DB
    adminService.getUsers().then((liveUsers) => {
      if (Array.isArray(liveUsers)) {
        setUsers(liveUsers);
      }
    }).catch(() => {});
    // refresh activity
    adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    return updated;
  };

  const deleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId && u.email !== userId));
      localStorage.removeItem("admin_users");
      // Live resync with DB
      const liveUsers = await adminService.getUsers();
      if (Array.isArray(liveUsers)) {
        setUsers(liveUsers);
        localStorage.setItem("admin_users", JSON.stringify(liveUsers));
      }
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    } catch (err) {
      console.error("deleteUser failed:", err);
      throw err;
    }
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
      if (newInv && newInv.id) {
        setInvitations((prev) => [newInv, ...prev.filter((i) => i.id !== newInv.id && i.email !== newInv.email)]);
      }
      // Resync from DB to ensure UI matches database exactly
      const dbInvites = await adminService.getInvitations();
      if (Array.isArray(dbInvites)) setInvitations(dbInvites);
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
      return newInv;
    } catch (err) {
      throw err;
    }
  };

  const updateInvitation = async (invitationId, updateData) => {
    try {
      const res = await adminService.updateInvitation(invitationId, updateData);
      const dbInvites = await adminService.getInvitations();
      if (Array.isArray(dbInvites)) setInvitations(dbInvites);
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
      return res;
    } catch (err) {
      console.warn("updateInvitation error:", err);
      throw err;
    }
  };

  const resendInvitation = async (invitationId) => {
    try {
      await adminService.resendInvitation(invitationId);
      // Resync from DB
      const dbInvites = await adminService.getInvitations();
      if (Array.isArray(dbInvites)) setInvitations(dbInvites);
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    } catch (err) {
      console.warn("resendInvitation error:", err);
    }
  };

  const deleteInvitation = async (invitationId) => {
    const cleanTargetId = String(invitationId || "").trim().toLowerCase();
    const cleanTargetIdNoSpace = cleanTargetId.replace(/\s+/g, "");
    try {
      await adminService.deleteInvitation(invitationId);
      // Immediately remove from UI state
      setInvitations((prev) =>
        prev.filter((i) => {
          const iId = String(i.id || "").trim().toLowerCase();
          const iEmail = String(i.email || "").trim().toLowerCase();
          return (
            iId !== cleanTargetId &&
            iId.replace(/\s+/g, "") !== cleanTargetIdNoSpace &&
            iEmail !== cleanTargetId
          );
        })
      );
      // Resync from DB to confirm deletion
      const dbInvites = await adminService.getInvitations();
      if (Array.isArray(dbInvites)) {
        setInvitations(dbInvites);
      }
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    } catch (err) {
      console.warn("deleteInvitation error:", err);
      setInvitations((prev) =>
        prev.filter((i) => {
          const iId = String(i.id || "").trim().toLowerCase();
          const iEmail = String(i.email || "").trim().toLowerCase();
          return (
            iId !== cleanTargetId &&
            iId.replace(/\s+/g, "") !== cleanTargetIdNoSpace &&
            iEmail !== cleanTargetId
          );
        })
      );
      throw err;
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

  const deleteActivityLog = async (logId) => {
    try {
      await adminService.deleteActivityLog(logId);
      setActivityLogs((prev) => prev.filter((l) => l.id !== logId && l.dbId !== logId));
      const logs = await adminService.getActivityLogs();
      if (Array.isArray(logs)) setActivityLogs(logs);
    } catch (err) {
      console.warn("deleteActivityLog error:", err);
      setActivityLogs((prev) => prev.filter((l) => l.id !== logId && l.dbId !== logId));
    }
  };

  const createActivityLog = async (data) => {
    try {
      const newLog = await adminService.createActivityLog(data);
      const logs = await adminService.getActivityLogs();
      if (Array.isArray(logs)) setActivityLogs(logs);
      return newLog;
    } catch (err) {
      console.warn("createActivityLog error:", err);
      throw err;
    }
  };

  const updateActivityLog = async (logId, data) => {
    try {
      await adminService.updateActivityLog(logId, data);
      const logs = await adminService.getActivityLogs();
      if (Array.isArray(logs)) setActivityLogs(logs);
    } catch (err) {
      console.warn("updateActivityLog error:", err);
      throw err;
    }
  };

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

  const updateRole = async (roleId, roleData) => {
    try {
      if (adminService.updateRole) {
        await adminService.updateRole(roleId, roleData);
      }
      setRoles((prev) =>
        prev.map((r) =>
          r.id === roleId || r.dbId === roleId || r.code === roleId
            ? { ...r, ...roleData }
            : r
        )
      );
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    } catch (err) {
      console.warn("updateRole service error:", err);
      throw err;
    }
  };

  const deleteRole = async (roleId) => {
    try {
      if (adminService.deleteRole) {
        await adminService.deleteRole(roleId);
      }
    } catch (err) {
      console.warn("deleteRole service call:", err);
    }
    setRoles((prev) => prev.filter((r) => r.id !== roleId && r.code !== roleId));
    adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
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
        editUser,
        deleteUser,
        updateUserStatus,
        bulkUpdateStatus,
        updateUserRole,
        invitations,
        setInvitations,
        addInvitation,
        updateInvitation,
        resendInvitation,
        deleteInvitation,
        activityLogs,
        setActivityLogs,
        fetchActivityLogs,
        deleteActivityLog,
        createActivityLog,
        updateActivityLog,
        refreshAll,
        roles,
        setRoles,
        addRole,
        updateRole,
        deleteRole,
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

export const useAdmin = () => useContext(AdminContext) || defaultAdminContext;



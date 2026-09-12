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
  // 1. Users (Directly synchronized with PostgreSQL users table)
  const [users, setUsers] = useState([]);

  // 2. User Invitations (loaded from PostgreSQL via API)
  const [invitations, setInvitations] = useState([]);

  // 3. User Activity Logs
  const [activityLogs, setActivityLogs] = useState([
    { id: "ACT-801", user: "Alexander Vance", action: "Updated ERP Sync Frequency to 15 mins", timestamp: "10:45 AM", ip: "192.168.1.10", category: "Configuration" },
    { id: "ACT-802", user: "Robert Thorne", action: "Approved Schedule Recovery Catch-up Plan", timestamp: "09:30 AM", ip: "192.168.1.45", category: "Planning" },
    { id: "ACT-803", user: "Sarah Jenkins", action: "Released Lot LOT-CIT-0830 Certificate of Analysis", timestamp: "08:15 AM", ip: "192.168.1.72", category: "Quality" },
    { id: "ACT-804", user: "Alexander Vance", action: "Modified Role Permissions for Maintenance Lead", timestamp: "Yesterday", ip: "192.168.1.10", category: "Security" }
  ]);

  // 4. Roles
  const [roles, setRoles] = useState([
    { id: "ROL-01", name: "System Administrator", description: "Full system governance, master data, security, user administration", userCount: 2, isSystem: true },
    { id: "ROL-02", name: "Plant Manager", description: "Executive plant operations, OEE, planning, recovery, cross-functional oversight", userCount: 4, isSystem: true },
    { id: "ROL-03", name: "Maintenance Lead", description: "CMMS, asset condition monitoring, work order dispatch, spare parts", userCount: 8, isSystem: false },
    { id: "ROL-04", name: "QA Manager", description: "Quality inspection logs, holds, CoA release, statistical process control", userCount: 5, isSystem: false },
    { id: "ROL-05", name: "Operator / Line Tech", description: "Shop floor execution, hour-by-hour logging, downtime reporting", userCount: 42, isSystem: false }
  ]);

  // 5. Master Data SKU Items
  const [items, setItems] = useState([
    { id: "SKU-5001", name: "500ml Sparkling Citrus Soda", category: "Finished Goods", family: "Sparkling Flavors", uom: "Bottles", stdCost: "$0.42", active: true },
    { id: "SKU-5002", name: "1L Tonic Water Natural", category: "Finished Goods", family: "Tonics & Mixers", uom: "Bottles", stdCost: "$0.68", active: true },
    { id: "SKU-5003", name: "330ml Organic Ginger Beer", category: "Finished Goods", family: "Ginger Beers", uom: "Cans", stdCost: "$0.38", active: true },
    { id: "ING-1001", name: "Liquid Cane Sugar 67°Bx", category: "Raw Ingredients", family: "Sweeteners", uom: "Liters", stdCost: "$1.20", active: true },
    { id: "PKG-2001", name: "28mm Tamper-Evident Cap", category: "Packaging", family: "Caps & Closures", uom: "Units", stdCost: "$0.02", active: true }
  ]);

  // 6. Data Health Counts
  const [dataHealthStats, setDataHealthStats] = useState({
    missingDataCount: 3,
    duplicatesCount: 2,
    invalidRefsCount: 1,
    brokenRelCount: 2,
    staleRecordsCount: 4,
    healthScore: 96.2
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
    localStorage.setItem("admin_users", JSON.stringify(users));
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
    try {
      await adminService.deleteInvitation(invitationId);
      // Immediately remove from UI state
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId && i.email !== invitationId));
      // Resync from DB to confirm deletion
      const dbInvites = await adminService.getInvitations();
      if (Array.isArray(dbInvites)) {
        setInvitations(dbInvites);
      }
      adminService.getActivityLogs().then((logs) => Array.isArray(logs) && setActivityLogs(logs)).catch(() => {});
    } catch (err) {
      console.warn("deleteInvitation error:", err);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId && i.email !== invitationId));
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
        fetchActivityLogs,
        refreshAll,
        roles,
        setRoles,
        addRole,
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



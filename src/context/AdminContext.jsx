import React, { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // 1. Users
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("admin_users");
    return saved
      ? JSON.parse(saved)
      : [
          { id: "USR-001", name: "Alexander Vance", email: "alexander.vance@flowstate.io", role: "System Administrator", department: "IT & Digital Ops", status: "Active", lastLogin: "Just now", plant: "All Plants" },
          { id: "USR-002", name: "Robert Thorne", email: "robert.thorne@flowstate.io", role: "Plant Manager", department: "Operations", status: "Active", lastLogin: "10 mins ago", plant: "Plant 1 (Austin)" },
          { id: "USR-003", name: "Sarah Jenkins", email: "sarah.jenkins@flowstate.io", role: "QA Manager", department: "Quality Assurance", status: "Active", lastLogin: "1 hour ago", plant: "Plant 1 (Austin)" },
          { id: "USR-004", name: "Marcus Vance", email: "marcus.vance@flowstate.io", role: "Maintenance Lead", department: "Maintenance", status: "Active", lastLogin: "3 hours ago", plant: "Plant 1 (Austin)" },
          { id: "USR-005", name: "David Kim", email: "david.kim@flowstate.io", role: "Production Supervisor", department: "Production", status: "Suspended", lastLogin: "3 days ago", plant: "Plant 2 (Dallas)" }
        ];
  });

  // 2. User Invitations
  const [invitations, setInvitations] = useState([
    { id: "INV-101", email: "clara.oswald@flowstate.io", role: "Quality Analyst", department: "Quality", invitedBy: "Alexander Vance", sentDate: "2026-08-30", status: "Pending" },
    { id: "INV-102", email: "james.holden@flowstate.io", role: "Controls Engineer", department: "Maintenance", invitedBy: "Alexander Vance", sentDate: "2026-08-31", status: "Pending" }
  ]);

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

  useEffect(() => {
    localStorage.setItem("admin_users", JSON.stringify(users));
  }, [users]);

  // Helpers
  const addUser = (userData) => {
    const newUser = {
      id: `USR-00${users.length + 1}`,
      ...userData,
      lastLogin: "Never"
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const updateUserStatus = (userId, status) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
  };

  const addInvitation = (inv) => {
    const newInv = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      ...inv,
      sentDate: new Date().toISOString().substring(0, 10),
      status: "Pending"
    };
    setInvitations([...invitations, newInv]);
    return newInv;
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
        addUser,
        updateUserStatus,
        invitations,
        addInvitation,
        activityLogs,
        roles,
        setRoles,
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

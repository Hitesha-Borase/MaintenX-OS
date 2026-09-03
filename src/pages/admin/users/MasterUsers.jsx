import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Eye, Ban, CheckCircle, Filter } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { UserProfileModal } from "./UserProfileModal";

export function MasterUsers() {
  const { users, updateUserStatus } = useMasterAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { addToast } = useApp();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.company.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = (user) => {
    updateUserStatus(user.id, "Suspended");
    addToast(`${user.name} has been suspended`, "warning");
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({ ...selectedUser, status: "Suspended" });
    }
  };

  const handleActivate = (user) => {
    updateUserStatus(user.id, "Active");
    addToast(`${user.name} has been activated`, "success");
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({ ...selectedUser, status: "Active" });
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (user) => {
    if (user.status === "Active") {
      handleSuspend(user);
    } else {
      handleActivate(user);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Platform Users</h1>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by name, role, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>User Name</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 500, color: "var(--text-secondary)" }}>{user.company}</td>
                  <td style={{ padding: "16px 20px", fontSize: "14px", color: "var(--text-primary)" }}>{user.role}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={user.status === "Active" ? "emerald" : "secondary"}>{user.status}</Badge>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewProfile(user)} title="View Profile"><Eye size={16} /></Button>
                      {user.status === "Active" ? (
                        <Button variant="ghost" size="sm" onClick={() => handleSuspend(user)} title="Suspend User"><Ban size={16} color="#EF4444" /></Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleActivate(user)} title="Activate User"><CheckCircle size={16} color="#10B981" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No users found matching criteria.
            </div>
          )}
        </div>
      </Card>

      <UserProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}

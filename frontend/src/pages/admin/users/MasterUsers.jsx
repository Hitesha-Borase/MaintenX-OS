import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Eye, Ban, CheckCircle, Filter, Trash2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { UserProfileModal } from "./UserProfileModal";

export function MasterUsers() {
  const { users, updateUserStatus, removeUser, fetchUsers } = useMasterAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { addToast } = useApp();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    fetchUsers?.();
  }, [fetchUsers]);

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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
    try {
      await removeUser(user.id);
      addToast(`User ${user.name} deleted permanently`, "success");
      if (selectedUser?.id === user.id) setIsModalOpen(false);
    } catch (e) {
      addToast("Failed to delete user", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
          Platform Users
        </h1>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "260px", minWidth: "180px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by name, role, or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "150px", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side User Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              style={{ 
                padding: "12px", 
                backgroundColor: "var(--bg-card-subtle)", 
                borderRadius: "10px", 
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "8px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flex: 1 }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "13px", backgroundColor: "rgba(37, 99, 235, 0.12)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", flexShrink: 0 }}>
                      {user.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                  </div>
                  <Badge variant={user.status === "Active" ? "emerald" : "secondary"} style={{ fontSize: "9.5px", padding: "2px 5px" }}>{user.status}</Badge>
                </div>

                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🏢 {user.company}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    👤 {user.role}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleViewProfile(user)} title="View Profile" style={{ padding: "4px" }}><Eye size={13} /></Button>
                {user.status === "Active" ? (
                  <Button variant="ghost" size="sm" onClick={() => handleSuspend(user)} title="Suspend User" style={{ padding: "4px" }}><Ban size={13} color="#EF4444" /></Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => handleActivate(user)} title="Activate User" style={{ padding: "4px" }}><CheckCircle size={13} color="#10B981" /></Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} title="Delete User Permanently" style={{ padding: "4px" }}><Trash2 size={13} color="#EF4444" /></Button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No users found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>User Name</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Company</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Role</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-subtle)" }} className="hover-row">
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--text-primary)", fontSize: "12px" }}>
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{user.company}</td>
                  <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{user.role}</td>
                  <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                    <Badge variant={user.status === "Active" ? "emerald" : "secondary"}>{user.status}</Badge>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewProfile(user)} title="View Profile"><Eye size={16} /></Button>
                      {user.status === "Active" ? (
                        <Button variant="ghost" size="sm" onClick={() => handleSuspend(user)} title="Suspend User"><Ban size={16} color="#EF4444" /></Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleActivate(user)} title="Activate User"><CheckCircle size={16} color="#10B981" /></Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} title="Delete User Permanently"><Trash2 size={16} color="#EF4444" /></Button>
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

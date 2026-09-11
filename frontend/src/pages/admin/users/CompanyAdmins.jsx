import React, { useState, useMemo } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { ShieldCheck, Search, Filter, Plus, Edit2, Play, Pause, Trash2, Eye, Key } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { AdminModal } from "./AdminModal";

export function CompanyAdmins() {
  const { companies, users, updateUserStatus, removeUser, addUser, editUser, resetAdminPassword, fetchCompanyAdmins, fetchUsers, fetchCompanies } = useMasterAdmin();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);

  React.useEffect(() => {
    fetchCompanyAdmins?.();
    fetchUsers?.();
    fetchCompanies?.();
  }, [fetchCompanyAdmins, fetchUsers, fetchCompanies]);

  const allAdmins = users.filter(u => (u.role === "Company Admin" || u.role === "System Administrator" || u.role?.toLowerCase().includes("admin")) && u.role !== "Master Admin");
  
  // Get available companies from registered companies or existing admins
  const availableCompanies = useMemo(() => {
    if (companies && companies.length > 0) {
      return companies.map(c => c.name);
    }
    const comps = new Set(allAdmins.map(a => a.company));
    return Array.from(comps);
  }, [companies, allAdmins]);

  const filteredAdmins = allAdmins.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === "All" || u.company === companyFilter;
    const matchesStatus = statusFilter === "All" || u.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleToggleStatus = (admin) => {
    const isActive = admin.status?.toLowerCase() === "active";
    const nextStatus = isActive ? "Suspended" : "Active";
    updateUserStatus(admin.id, nextStatus);
    addToast(`${admin.name} ${isActive ? "suspended" : "activated"}`, isActive ? "warning" : "success");
  };

  const handleResetPassword = async (admin) => {
    if (window.confirm(`Trigger password reset for ${admin.name}? A temporary credential will be generated.`)) {
      try {
        await resetAdminPassword(admin.id);
        addToast(`Password reset triggered successfully for ${admin.name}`, "success");
      } catch (err) {
        addToast("Failed to reset administrator password", "error");
      }
    }
  };

  const handleRemove = (admin) => {
    if (window.confirm(`Are you sure you want to remove ${admin.name}?`)) {
      removeUser(admin.id);
      addToast("Administrator removed successfully", "destructive");
    }
  };

  const handleAddAdmin = () => {
    setAdminToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setAdminToEdit(admin);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Company Administrators
          </h1>
        </div>
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={handleAddAdmin}
          style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}
        >
          Add Administrator
        </Button>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "260px", minWidth: "180px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "7px 10px 7px 32px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", fontSize: "12px", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={companyFilter} 
              onChange={(e) => setCompanyFilter(e.target.value)}
              style={{ width: "160px", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)", fontSize: "12px", outline: "none", cursor: "pointer" }}
            >
              <option value="All">All Companies</option>
              {availableCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "130px", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)", fontSize: "12px", outline: "none", cursor: "pointer" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Admin Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredAdmins.map(user => (
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
                gap: "10px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "14px", backgroundColor: "rgba(37, 99, 235, 0.12)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                      {user.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                    </div>
                  </div>
                  <Badge variant={user.status === "Active" ? "emerald" : "secondary"} style={{ fontSize: "10px", padding: "2px 6px" }}>{user.status}</Badge>
                </div>

                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    🏢 {user.company}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email || `${user.name.toLowerCase().replace(" ", ".")}@example.com`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)} title="Reset Password" style={{ padding: "4px" }}><Key size={13} color="#F59E0B" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleEditAdmin(user)} title="Edit Admin" style={{ padding: "4px" }}><Edit2 size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} title={user.status?.toLowerCase() === "active" ? "Suspend Admin" : "Activate Admin"} style={{ padding: "4px" }}>
                  {user.status?.toLowerCase() === "active" ? <Pause size={13} color="#EF4444" /> : <Play size={13} color="#10B981" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(user)} title="Remove Admin" style={{ padding: "4px" }}><Trash2 size={13} color="#EF4444" /></Button>
              </div>
            </div>
          ))}
          {filteredAdmins.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No administrators found.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Admin Name & Email</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Last Login</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map(user => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "16px", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{user.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap" }}>{user.email || `${user.name.toLowerCase().replace(" ", ".")}@example.com`}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.company}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={user.status === "Active" ? "emerald" : "secondary"}>{user.status}</Badge>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{user.lastLogin}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Created: {user.createdAt || "2025-01-01"}</div>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)} title="Reset Password"><Key size={16} color="#F59E0B" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditAdmin(user)} title="Edit Admin"><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} title={user.status?.toLowerCase() === "active" ? "Suspend Admin" : "Activate Admin"}>
                        {user.status?.toLowerCase() === "active" ? <Pause size={16} color="#EF4444" /> : <Play size={16} color="#10B981" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(user)} title="Remove Admin"><Trash2 size={16} color="#EF4444" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAdmins.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No administrators found.
            </div>
          )}
        </div>
      </Card>
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        adminToEdit={adminToEdit}
        availableCompanies={availableCompanies}
      />
    </div>
  );
}

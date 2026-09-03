import React, { useState, useMemo } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { ShieldCheck, Search, Filter, Plus, Edit2, Play, Pause, Trash2, Eye } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { AdminModal } from "./AdminModal";

export function CompanyAdmins() {
  const { users, updateUserStatus, removeUser, addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);

  const allAdmins = users.filter(u => u.role === "Company Admin");
  
  // Get unique companies from admins for filter
  const uniqueCompanies = useMemo(() => {
    const comps = new Set(allAdmins.map(a => a.company));
    return Array.from(comps);
  }, [allAdmins]);

  const filteredAdmins = allAdmins.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === "All" || u.company === companyFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleToggleStatus = (admin) => {
    updateUserStatus(admin.id, admin.status === "Active" ? "Inactive" : "Active");
    addToast(`${admin.name} ${admin.status === "Active" ? "deactivated" : "activated"}`, admin.status === "Active" ? "warning" : "success");
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Company Administrators</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Manage primary admin accounts for all tenant companies</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="primary" icon={Plus} onClick={handleAddAdmin}>Add Administrator</Button>
        </div>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={companyFilter} 
              onChange={(e) => setCompanyFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)", maxWidth: "150px" }}
            >
              <option value="All">All Companies</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
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
                  <td style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "16px", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{user.name.toLowerCase().replace(" ", ".")}@example.com</div>
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
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Created: 2024-01-15</div>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleEditAdmin(user)} title="Edit Admin"><Edit2 size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} title={user.status === "Active" ? "Deactivate" : "Activate"}>
                        {user.status === "Active" ? <Pause size={16} color="#EF4444" /> : <Play size={16} color="#10B981" />}
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
        availableCompanies={uniqueCompanies}
      />
    </div>
  );
}

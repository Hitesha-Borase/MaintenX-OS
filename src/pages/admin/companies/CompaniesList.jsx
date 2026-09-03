import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Plus, Filter, Eye, Play, Pause, Trash2 } from "lucide-react";
import { AddCompanyModal } from "./AddCompanyModal";
import { CompanyDetailsModal } from "./CompanyDetailsModal";

import { useApp } from "../../../context/AppContext";

export function CompaniesList() {
  const { companies, updateCompanyStatus, removeCompany } = useMasterAdmin();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  const filtered = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.admin.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "All") {
      if (statusFilter === "Expired") {
        matchesStatus = new Date(c.expiryDate) < new Date();
      } else {
        matchesStatus = c.status === statusFilter || c.subscription === statusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Companies</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Manage all registered tenant companies</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Company</Button>
        </div>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies or admins..." 
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
              <option value="Inactive">Inactive</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired Subscription</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company Name</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Admin & Email</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Plan & Users</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Dates</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(company => (
                <tr key={company.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{company.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>ID: {company.id}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>{company.admin}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{company.adminEmail}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : company.subscription === "Trial" ? "warning" : "secondary"}>
                      {company.subscription}
                    </Badge>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 600 }}>{company.usersCount} Users</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Created: <span style={{color: "var(--text-primary)", fontWeight: 500}}>{company.createdAt}</span></div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Expiry: <span style={{color: "var(--text-primary)", fontWeight: 500}}>{company.expiryDate || "N/A"}</span></div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Active: <span style={{color: "var(--text-primary)", fontWeight: 500}}>{company.lastActivity || "N/A"}</span></div>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(company)} title="View Details"><Eye size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => updateCompanyStatus(company.id, company.status === "Active" ? "Suspended" : "Active")} title={company.status === "Active" ? "Suspend Company" : "Activate Company"}>
                        {company.status === "Active" ? <Pause size={16} color="#EF4444" /> : <Play size={16} color="#10B981" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(window.confirm('Are you sure you want to remove this company?')) { removeCompany(company.id); addToast('Company removed successfully', 'destructive'); } }} title="Remove Company"><Trash2 size={16} color="#EF4444" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No companies found matching criteria.
            </div>
          )}
        </div>
      </Card>
      
      <AddCompanyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <CompanyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        company={selectedCompany}
      />
    </div>
  );
}

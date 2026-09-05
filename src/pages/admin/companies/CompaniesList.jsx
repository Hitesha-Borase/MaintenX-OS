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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
            Companies
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px", margin: 0 }}>
            Manage all registered tenant companies
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "13px", padding: "8px 14px", fontWeight: 700 }}>
          Add Company
        </Button>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ flex: "1 1 100%", minWidth: "180px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies or admins..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}
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

        {/* Mobile View: 2-Column Side-by-Side Company Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filtered.map(company => (
            <div 
              key={company.id} 
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
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
                  <Badge variant={company.status === "Active" ? "emerald" : "destructive"} style={{ fontSize: "10px", padding: "2px 6px" }}>{company.status}</Badge>
                </div>

                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : company.subscription === "Trial" ? "warning" : "secondary"} style={{ fontSize: "10px", padding: "1px 5px" }}>
                      {company.subscription}
                    </Badge>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{company.usersCount} Users</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    👤 {company.admin}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(company)} title="View Details" style={{ padding: "4px" }}><Eye size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => updateCompanyStatus(company.id, company.status === "Active" ? "Suspended" : "Active")} title={company.status === "Active" ? "Suspend" : "Activate"} style={{ padding: "4px" }}>
                  {company.status === "Active" ? <Pause size={13} color="#EF4444" /> : <Play size={13} color="#10B981" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { if(window.confirm('Are you sure you want to remove this company?')) { removeCompany(company.id); addToast('Company removed successfully', 'destructive'); } }} title="Remove Company" style={{ padding: "4px" }}><Trash2 size={13} color="#EF4444" /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No companies found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company Name</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Admin & Email</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Plan & Users</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>Dates</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
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
                  <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
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

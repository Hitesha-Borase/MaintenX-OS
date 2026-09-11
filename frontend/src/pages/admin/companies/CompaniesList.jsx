import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Search, Plus, Filter, Eye, Play, Pause, Trash2, Phone } from "lucide-react";
import { AddCompanyModal } from "./AddCompanyModal";
import { CompanyDetailsModal } from "./CompanyDetailsModal";

import { useApp } from "../../../context/AppContext";

export function CompaniesList() {
  const { companies, updateCompanyStatus, removeCompany, fetchCompanies } = useMasterAdmin();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  React.useEffect(() => {
    fetchCompanies?.();
  }, [fetchCompanies]);

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to remove "${company.name}"?`)) {
      try {
        await removeCompany(company.id);
        addToast('Company removed successfully', 'destructive');
      } catch (err) {
        addToast(err?.message || 'Failed to remove company', 'destructive');
      }
    }
  };

  const filtered = companies.filter(c => {
    if (statusFilter !== "Deactivated" && c.status?.toLowerCase() === "deactivated") {
      return false;
    }
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

  const formatPlanName = (planStr) => {
    if (!planStr) return "—";
    let clean = planStr.replace(/\(.*\)/g, "").trim();
    const lower = clean.toLowerCase();
    if (lower.includes("complete")) return "MaintenX OS Complete";
    if (lower.includes("bundle")) return "Bundles";
    if (lower.includes("pilot")) return "Plant Pilot";
    if (lower.includes("individual")) return "Individual Modules";
    return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

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
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ width: "260px", minWidth: "180px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies or admins..." 
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
              style={{ width: "160px", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Trial">Trial / Pilot</option>
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
                    <Badge variant={company.subscription?.toLowerCase().includes("complete") ? "indigo" : company.subscription?.toLowerCase().includes("bundle") ? "amber" : company.subscription?.toLowerCase().includes("pilot") ? "cyan" : "slate"} style={{ fontSize: "10px", padding: "1px 5px", textTransform: "none", letterSpacing: "normal" }}>
                      {formatPlanName(company.subscription)}
                    </Badge>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{company.usersCount} Users</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    👤 {company.admin}
                  </div>
                  {company.adminPhone && (
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={10} /> {company.adminPhone}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(company)} title="View Details" style={{ padding: "4px" }}><Eye size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => updateCompanyStatus(company.id, company.status === "Active" ? "Suspended" : "Active")} title={company.status === "Active" ? "Suspend" : "Activate"} style={{ padding: "4px" }}>
                  {company.status === "Active" ? <Pause size={13} color="#EF4444" /> : <Play size={13} color="#10B981" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company)} title="Remove Company" style={{ padding: "4px" }}><Trash2 size={13} color="#EF4444" /></Button>
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
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Company Name</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Admin Name</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Email</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Mobile Number</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Plan</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Status</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Dates</th>
                <th style={{ padding: "13px 18px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr
                  key={company.id}
                  style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Company Name */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{company.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {company.usersCount ?? 1} user{(company.usersCount ?? 1) !== 1 ? "s" : ""} · {company.plants ?? 1} plant{(company.plants ?? 1) !== 1 ? "s" : ""}
                    </div>
                  </td>

                  {/* Admin Name */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "13px" }}>{company.admin || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Company Admin</div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    {company.adminEmail
                      ? <a href={`mailto:${company.adminEmail}`} style={{ fontSize: "13px", color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>{company.adminEmail}</a>
                      : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>
                    }
                  </td>

                  {/* Mobile Number */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    {company.adminPhone
                      ? <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                          <Phone size={13} color="var(--text-muted)" />{company.adminPhone}
                        </div>
                      : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>
                    }
                  </td>

                  {/* Plan */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <Badge 
                      variant={
                        company.subscription?.toLowerCase().includes("complete") ? "indigo"
                        : company.subscription?.toLowerCase().includes("bundle") ? "amber"
                        : company.subscription?.toLowerCase().includes("pilot") ? "cyan"
                        : "slate"
                      }
                      style={{ textTransform: "none", letterSpacing: "normal", fontSize: "12px", padding: "4px 8px" }}
                    >
                      {formatPlanName(company.subscription)}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status || "—"}</Badge>
                  </td>

                  {/* Dates */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Created: <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{company.createdAt}</span></div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Expiry: <span style={{ color: new Date(company.expiryDate) < new Date() ? "#EF4444" : "var(--text-primary)", fontWeight: 500 }}>{company.expiryDate || "N/A"}</span></div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(company)} title="View Details"><Eye size={15} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => updateCompanyStatus(company.id, company.status === "Active" ? "Suspended" : "Active")} title={company.status === "Active" ? "Suspend Company" : "Activate Company"}>
                        {company.status === "Active" ? <Pause size={15} color="#EF4444" /> : <Play size={15} color="#10B981" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company)} title="Remove Company"><Trash2 size={15} color="#EF4444" /></Button>
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

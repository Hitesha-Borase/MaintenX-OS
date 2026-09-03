import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { CreditCard, Eye, Trash2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

export function ManageSubscriptions() {
  const { companies, updateCompanySubscription, extendCompanySubscription, cancelCompanySubscription } = useMasterAdmin();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const plans = [
    { name: "Enterprise", count: companies.filter(c => c.subscription === "Enterprise").length, color: "#2563EB" },
    { name: "Professional", count: companies.filter(c => c.subscription === "Professional").length, color: "#10B981" },
    { name: "Basic", count: companies.filter(c => c.subscription === "Basic").length, color: "#6B7280" },
    { name: "Trial", count: companies.filter(c => c.subscription === "Trial").length, color: "#F59E0B" }
  ];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "All" || c.subscription === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleRenew = (company) => {
    extendCompanySubscription(company.id);
    addToast(`Subscription renewed for ${company.name}`, "success");
  };

  const handleCancel = (company) => {
    if (window.confirm(`Are you sure you want to cancel the subscription for ${company.name}? This will suspend the company.`)) {
      cancelCompanySubscription(company.id);
      addToast(`Subscription cancellation initiated for ${company.name}`, "warning");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Manage Subscriptions</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>Overview of platform subscription plans across all tenants</p>
      </div>

      {/* Plan Metric Cards - 2x2 on mobile, 4 on desktop */}
      <div className="kpi-grid-responsive grid-4">
        {plans.map(p => (
          <Card key={p.name} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", borderTop: `3px solid ${p.color}`, minWidth: 0 }}>
            <div style={{ padding: "10px", backgroundColor: `${p.color}15`, borderRadius: "10px", color: p.color, flexShrink: 0 }}>
              <CreditCard size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginTop: "2px" }}>
                {p.count} <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Active</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          <div style={{ flex: "1 1 100%", minWidth: "180px", position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600 }}
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Professional">Professional</option>
              <option value="Basic">Basic</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Company Subscription Cards (Aamne-Samne) */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filteredCompanies.map(company => (
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
                gap: "8px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                  <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
                  <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : company.subscription === "Trial" ? "warning" : "secondary"} style={{ fontSize: "10px", padding: "2px 6px" }}>
                    {company.subscription}
                  </Badge>
                </div>

                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                    👥 {company.usersCount} Users
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                    Expires: {company.expiryDate || "2025-01-01"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/master/companies`)} title="View Company" style={{ padding: "4px" }}><Eye size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleCancel(company)} title="Cancel Subscription" style={{ padding: "4px" }}><Trash2 size={13} color="#EF4444" /></Button>
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No subscriptions found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company Name</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Current Plan</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Expiry Date</th>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600 }}>{company.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{company.usersCount} Users</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : company.subscription === "Trial" ? "warning" : "secondary"}>
                      {company.subscription}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{company.expiryDate || "2025-01-01"}</div>
                    {new Date(company.expiryDate) < new Date() && <div style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600 }}>Expired</div>}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/master/companies`)} title="View Company"><Eye size={16} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(company)} title="Cancel Subscription"><Trash2 size={16} color="#EF4444" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCompanies.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No subscriptions found matching criteria.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

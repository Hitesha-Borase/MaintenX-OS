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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {plans.map(p => (
          <Card key={p.name} style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", borderTop: `4px solid ${p.color}` }}>
            <div style={{ padding: "12px", backgroundColor: `${p.color}15`, borderRadius: "12px", color: p.color }}>
              <CreditCard size={24} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>{p.name}</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>{p.count} <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>Active</span></div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 10px 10px 40px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)" }}
            >
              <option value="All">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Professional">Professional</option>
              <option value="Basic">Basic</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
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
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/master/companies/${company.id}`)} title="View Company"><Eye size={16} /></Button>
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

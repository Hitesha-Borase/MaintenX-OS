import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Layers, Check, X, Search, Filter } from "lucide-react";

export function ManageModules() {
  const { companies, toggleCompanyModule } = useMasterAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");

  const moduleKeys = [
    { key: "plan",         label: "Plan",          color: "#6366F1" },
    { key: "produce",      label: "Produce",        color: "#F59E0B" },
    { key: "verify",       label: "Verify",         color: "#10B981" },
    { key: "maintain",     label: "Maintain",       color: "#3B82F6" },
    { key: "move",         label: "Move",           color: "#8B5CF6" },
    { key: "people",       label: "Manage People",  color: "#EC4899" },
    { key: "improve",      label: "Improve",        color: "#14B8A6" },
    { key: "intelligence",label: "Intelligence",   color: "#F97316" },
  ];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "All" || c.subscription === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Modules & Features</h1>
      </div>

      <Card style={{ padding: "0" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 100%", minWidth: "200px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px 10px 8px 36px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", fontSize: "13px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <Filter size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", color: "var(--text-primary)", fontSize: "12px" }}
            >
              <option value="All">All Plans</option>
              <option value="MaintenX OS Complete">MaintenX OS Complete</option>
              <option value="Bundles">Bundles</option>
              <option value="Individual Modules">Individual Modules</option>
              <option value="Plant Pilot">Plant Pilot (Trial)</option>
            </select>
          </div>
        </div>

        {/* Mobile View: 2-Column Side-by-Side Company Module Cards (Aamne-Samne) */}
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
                gap: "10px",
                minWidth: 0
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</div>
                <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : "secondary"} style={{ marginTop: "4px", fontSize: "10px", padding: "2px 6px" }}>
                  {company.subscription}
                </Badge>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                {moduleKeys.map(mod => (
                  <div key={mod.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>{mod.label}</span>
                    <div
                      style={{ position: "relative", width: "32px", height: "18px", backgroundColor: (company.modules || {})[mod.key] ? mod.color : "#D1D5DB", borderRadius: "9px", cursor: "pointer", transition: "0.2s" }}
                      onClick={() => toggleCompanyModule(company.id, mod.key)}
                    >
                      <div style={{ position: "absolute", top: "2px", left: (company.modules || {})[mod.key] ? "16px" : "2px", width: "14px", height: "14px", backgroundColor: "white", borderRadius: "50%", transition: "0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>
              No companies found matching criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Company Name</th>
                {moduleKeys.map(mod => (
                  <th key={mod.key} style={{ padding: "16px 20px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "center" }}>
                    {mod.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => (
                <tr key={company.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{company.name}</div>
                    <Badge variant={company.subscription === "Enterprise" ? "primary" : company.subscription === "Professional" ? "emerald" : "secondary"} style={{ marginTop: "4px" }}>
                      {company.subscription}
                    </Badge>
                  </td>
                  {moduleKeys.map(mod => (
                    <td key={mod.key} style={{ padding: "16px 20px", textAlign: "center" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }} title={`Toggle ${mod.label} for ${company.name}`}>
                        <div 
                          style={{ 
                            position: "relative", 
                            width: "40px", 
                            height: "24px", 
                            backgroundColor: (company.modules || {})[mod.key] ? mod.color || "#10B981" : "#D1D5DB", 
                            borderRadius: "12px", 
                            transition: "0.3s" 
                          }} 
                          onClick={() => toggleCompanyModule(company.id, mod.key)}
                        >
                          <div 
                            style={{ 
                              position: "absolute", 
                              top: "2px", 
                              left: (company.modules || {})[mod.key] ? "18px" : "2px", 
                              width: "20px", 
                              height: "20px", 
                              backgroundColor: "white", 
                              borderRadius: "50%", 
                              transition: "0.3s" 
                            }} 
                          />
                        </div>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCompanies.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No companies found matching criteria.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

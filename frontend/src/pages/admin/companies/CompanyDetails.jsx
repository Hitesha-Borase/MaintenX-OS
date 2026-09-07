import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, ArrowLeft, ShieldAlert, CreditCard, Layers, Activity, Settings, Users, UserCog, LineChart, Clock, Trash2, Calendar, MapPin, Plus } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, updateCompanyStatus, updateCompanySubscription, toggleCompanyModule, removeCompany, updateCompanyDetails, extendCompanySubscription, addUser, editUser } = useMasterAdmin();
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  const company = companies.find(c => c.id === id);

  if (!company) {
    return <div>Company not found</div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "plants", label: "Plants & Sites", icon: MapPin },
    { id: "admins", label: "Administrators", icon: UserCog },
    { id: "users", label: "Users", icon: Users },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "modules", label: "Modules", icon: Layers },
    { id: "usage", label: "Usage Summary", icon: LineChart },
    { id: "activity", label: "Recent Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const handleStatusToggle = () => {
    updateCompanyStatus(company.id, company.status === "Active" ? "Suspended" : "Active");
    addToast(`Company ${company.status === "Active" ? "suspended" : "activated"}`, company.status === "Active" ? "warning" : "success");
  };

  const handleRemoveCompany = () => {
    if (window.confirm("Are you sure you want to completely remove this company?")) {
      removeCompany(company.id);
      addToast("Company removed successfully", "destructive");
      navigate("/master/companies");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => navigate("/master/companies")}>
        <ArrowLeft size={16} />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Back to Companies</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{company.name}</h1>
            <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>ID: {company.id} | Primary Admin: {company.admin} ({company.adminEmail})</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outline" icon={ShieldAlert} onClick={handleStatusToggle} style={{ color: company.status === "Active" ? "#EF4444" : "#10B981", borderColor: company.status === "Active" ? "#EF4444" : "#10B981" }}>
            {company.status === "Active" ? "Suspend Account" : "Activate Account"}
          </Button>
          <Button variant="outline" icon={Trash2} onClick={handleRemoveCompany} style={{ color: "#EF4444", borderColor: "#EF4444" }}>
            Remove
          </Button>
        </div>
      </div>

      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "3px solid #2563EB" : "3px solid transparent",
                color: activeTab === tab.id ? "#2563EB" : "var(--text-secondary)",
                fontWeight: activeTab === tab.id ? 700 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px" }}>
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Company Information</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newName = window.prompt("Enter new company name:", company.name);
                      if (newName && newName !== company.name) {
                        updateCompanyDetails(company.id, newName, company.admin);
                        addToast("Company name updated", "success");
                      }
                    }}>Edit Details</Button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Created Date:</span>
                    <span style={{ fontWeight: 500 }}>{company.createdAt}</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Status:</span>
                    <span><Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge></span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Total Users:</span>
                    <span style={{ fontWeight: 500 }}>{company.usersCount}</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Subscription Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Current Plan:</span>
                    <span><Badge variant="primary">{company.subscription}</Badge></span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Expiry Date:</span>
                    <span style={{ fontWeight: 500 }}>{company.expiryDate || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "plants" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Manufacturing Facilities & Plants</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Active plant sites configured under {company.name}.
                  </p>
                </div>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate("/organization/plants")}>
                  Manage / Provision Plants
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {[
                  { id: "PLT-01", name: "Indore Facility (Site 1)", code: "IND-01", location: "Indore, MP, India", lines: 4, capacity: "320,000 Units/Day", status: "Operational" },
                  { id: "PLT-02", name: "Austin Plant (Site 2)", code: "ATX-02", location: "Austin, Texas, USA", lines: 3, capacity: "240,000 Units/Day", status: "Operational" },
                  ...(company.plants > 2 ? [{ id: "PLT-03", name: "Pune Expansion (Site 3)", code: "PUN-03", location: "Pune, Maharashtra, India", lines: 2, capacity: "180,000 Units/Day", status: "Operational" }] : [])
                ].slice(0, Math.max(1, company.plants || 1)).map((plant) => (
                  <div key={plant.id} style={{ padding: "18px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-card-subtle)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ padding: "8px", backgroundColor: "rgba(37, 99, 235, 0.1)", borderRadius: "8px", color: "#2563EB" }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>{plant.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Code: {plant.code}</div>
                        </div>
                      </div>
                      <Badge variant="emerald">{plant.status}</Badge>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Location:</span>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>{plant.location}</div>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Lines / Cells:</span>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>{plant.lines} Active Lines</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Rated Capacity:</span>
                      <span style={{ fontWeight: 700, color: "#10B981" }}>{plant.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Company Administrators</h3>
                <Button variant="primary" size="sm" onClick={() => {
                  const newAdminName = window.prompt("Enter new admin name:");
                  if (newAdminName) {
                    addUser({ name: newAdminName, company: company.name, role: "Company Admin" });
                    addToast(`Admin ${newAdminName} added`, "success");
                  }
                }}>Add Admin</Button>
              </div>
              <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "10px", backgroundColor: "var(--bg-body)", borderRadius: "50%", border: "1px solid var(--border-color)" }}>
                    <UserCog size={20} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{company.admin}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{company.adminEmail}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Last Login: {company.lastActivity || "N/A"}</span>
                  <Badge variant="emerald">Primary Admin</Badge>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const newName = window.prompt("Enter new admin name:", company.admin);
                    if (newName && newName !== company.admin) {
                      updateCompanyDetails(company.id, company.name, newName);
                      addToast("Admin name updated", "success");
                    }
                  }}>Edit</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Platform Users ({company.usersCount})</h3>
              <div style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                User directory for this company will be displayed here.
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Manage Subscription</h3>
                <Button variant="outline" icon={Calendar} onClick={() => {
                  extendCompanySubscription(company.id);
                  addToast("Subscription extended by 1 year", "success");
                }}>Extend Subscription</Button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {["Plant Pilot", "Individual Modules", "Bundles", "MaintenX OS Complete", "Custom"].map(plan => (
                  <div key={plan} onClick={() => { updateCompanySubscription(company.id, plan); addToast(`${plan} Plan Assigned`, "success"); }} style={{ border: `2px solid ${company.subscription === plan ? "#2563EB" : "var(--border-color)"}`, borderRadius: "12px", padding: "16px", cursor: "pointer", backgroundColor: company.subscription === plan ? "rgba(37, 99, 235, 0.05)" : "transparent", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>{plan}</div>
                    {company.subscription === plan && <Badge variant="primary" style={{ alignSelf: "flex-start" }}>Current Plan</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "modules" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Feature & Module Access</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Toggle platform modules on or off for this specific company. This overrides default plan settings.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {Object.keys(company.modules).map(mod => (
                  <div key={mod} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                    <div>
                      <div style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--text-primary)" }}>{mod} Module</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{company.modules[mod] ? "Access Enabled" : "Access Disabled"}</div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <div style={{ position: "relative", width: "44px", height: "24px", backgroundColor: company.modules[mod] ? "#10B981" : "#D1D5DB", borderRadius: "12px", transition: "0.3s" }} onClick={() => toggleCompanyModule(company.id, mod)}>
                        <div style={{ position: "absolute", top: "2px", left: company.modules[mod] ? "22px" : "2px", width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", transition: "0.3s" }} />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
              Usage metrics (storage, API calls, active users) will appear here.
            </div>
          )}

          {activeTab === "activity" && (
            <div style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
              Audit logs and recent activity specifically for {company.name} will appear here.
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ color: "var(--text-secondary)", padding: "40px", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
              Company specific platform settings (SSO, IP Whitelisting, Custom Domain) will appear here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

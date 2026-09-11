import React, { useState, useEffect } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { masterAdminService } from "../../../services/masterAdminService";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  ShieldAlert,
  CreditCard,
  Layers,
  Activity,
  Settings,
  Users,
  UserCog,
  LineChart,
  Trash2,
  Calendar,
  MapPin,
  Plus,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    companies,
    updateCompanyStatus,
    updateCompanySubscription,
    toggleCompanyModule,
    removeCompany,
    updateCompanyDetails,
    extendCompanySubscription,
    addUser,
  } = useMasterAdmin();
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  const [detailedCompany, setDetailedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        const data = await masterAdminService.getCompanyById(id);
        if (isMounted) setDetailedCompany(data);
      } catch (err) {
        console.warn("Could not fetch detailed company from API, using context fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (id) loadDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const fallbackCompany = companies.find((c) => c.id === id);
  const company = detailedCompany || fallbackCompany;

  if (loading && !company) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Loading company details from PostgreSQL...</div>;
  }

  if (!company) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--text-primary)" }}>Company Not Found</h2>
        <Button variant="outline" onClick={() => navigate("/master/companies")} style={{ marginTop: "16px" }}>
          Back to Companies
        </Button>
      </div>
    );
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
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleStatusToggle = async () => {
    const nextStatus = company.status === "Active" ? "Suspended" : "Active";
    await updateCompanyStatus(company.id, nextStatus);
    addToast(`Company ${nextStatus === "Active" ? "activated" : "suspended"}`, nextStatus === "Active" ? "success" : "warning");
    if (detailedCompany) {
      setDetailedCompany({ ...detailedCompany, status: nextStatus });
    }
  };

  const handleRemoveCompany = async () => {
    if (window.confirm("Are you sure you want to deactivate this company? This is a safe production deactivation.")) {
      await removeCompany(company.id);
      addToast("Company deactivated successfully", "destructive");
      navigate("/master/companies");
    }
  };

  const modules = company.modules || {
    plan: true,
    produce: true,
    verify: true,
    maintain: true,
    move: true,
    people: true,
    improve: true,
    intelligence: true,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "var(--text-secondary)" }}
        onClick={() => navigate("/master/companies")}
      >
        <ArrowLeft size={16} />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Back to Companies</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{company.name}</h1>
            <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            ID: {company.id} | Slug: {company.slug || "beverage-corp"} | Primary Admin: {company.admin} ({company.adminEmail})
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="outline"
            icon={ShieldAlert}
            onClick={handleStatusToggle}
            style={{
              color: company.status === "Active" ? "#EF4444" : "#10B981",
              borderColor: company.status === "Active" ? "#EF4444" : "#10B981",
            }}
          >
            {company.status === "Active" ? "Suspend Account" : "Activate Account"}
          </Button>
          <Button variant="outline" icon={Trash2} onClick={handleRemoveCompany} style={{ color: "#EF4444", borderColor: "#EF4444" }}>
            Deactivate
          </Button>
        </div>
      </div>

      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
          {tabs.map((tab) => (
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
                whiteSpace: "nowrap",
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px" }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Company Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const newName = window.prompt("Enter new company name:", company.name);
                      if (newName && newName !== company.name) {
                        await updateCompanyDetails(company.id, newName, company.admin);
                        addToast("Company name updated in PostgreSQL", "success");
                        if (detailedCompany) setDetailedCompany({ ...detailedCompany, name: newName });
                      }
                    }}
                  >
                    Edit Details
                  </Button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Created Date:</span>
                  <span style={{ fontWeight: 500 }}>{company.createdAt}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Status:</span>
                  <span>
                    <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status}</Badge>
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Total Users:</span>
                  <span style={{ fontWeight: 500 }}>{company.usersCount || company.usersList?.length || 1}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Active Plants:</span>
                  <span style={{ fontWeight: 500 }}>{company.plants || company.plantsList?.length || 1}</span>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Subscription Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "16px", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Current Plan:</span>
                  <span>
                    <Badge variant="primary">{company.subscription}</Badge>
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Expiry Date:</span>
                  <span style={{ fontWeight: 500 }}>{company.expiryDate || "N/A"}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Currency:</span>
                  <span style={{ fontWeight: 500 }}>{company.currency || "CAD"}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANTS & SITES */}
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
                {(company.plantsList || [
                  { id: "PLT-01", name: "Primary Production Facility", code: "INDORE-01", location: "Indore, MP, India", lines: 3, capacity: "250,000 Units/Day", status: "Operational" },
                ]).map((plant) => (
                  <div
                    key={plant.id}
                    style={{
                      padding: "18px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "var(--bg-card-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
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
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>{plant.lines || 3} Active Lines</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Rated Capacity:</span>
                      <span style={{ fontWeight: 700, color: "#10B981" }}>{plant.capacity || "250,000 Units/Day"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADMINISTRATORS */}
          {activeTab === "admins" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Company Administrators</h3>
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USERS (REAL POSTGRESQL LIST) */}
          {activeTab === "users" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                  Platform Users Directory ({company.usersList?.length || company.usersCount || 1})
                </h3>
              </div>
              <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Name</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Email</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Status</th>
                      <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(company.usersList || [
                      { id: "1", name: company.admin, email: company.adminEmail, status: "Active", lastLogin: company.lastActivity || "Never" },
                    ]).map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-secondary)" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={u.status === "Active" ? "emerald" : "destructive"}>{u.status}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-secondary)" }}>{u.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTION */}
          {activeTab === "subscription" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Manage Subscription</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Active Plan: <strong>{company.subscription}</strong> (Expires: {company.expiryDate || "N/A"})
                  </p>
                </div>
                <Button
                  variant="outline"
                  icon={Calendar}
                  onClick={async () => {
                    await extendCompanySubscription(company.id);
                    addToast("Subscription extended by 1 year in PostgreSQL", "success");
                    const updated = await masterAdminService.getCompanyById(company.id);
                    setDetailedCompany(updated);
                  }}
                >
                  Extend Subscription (+1 Year)
                </Button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {["Plant Pilot", "Individual Modules", "Bundles", "MaintenX OS Complete"].map((plan) => (
                  <div
                    key={plan}
                    onClick={async () => {
                      await updateCompanySubscription(company.id, plan);
                      addToast(`${plan} Plan Assigned in PostgreSQL`, "success");
                      const updated = await masterAdminService.getCompanyById(company.id);
                      setDetailedCompany(updated);
                    }}
                    style={{
                      border: `2px solid ${company.subscription === plan ? "#2563EB" : "var(--border-color)"}`,
                      borderRadius: "12px",
                      padding: "16px",
                      cursor: "pointer",
                      backgroundColor: company.subscription === plan ? "rgba(37, 99, 235, 0.05)" : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>{plan}</div>
                    {company.subscription === plan && <Badge variant="primary" style={{ alignSelf: "flex-start" }}>Current Plan</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MODULES */}
          {activeTab === "modules" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Feature & Module Entitlements</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Toggle platform modules on or off for this specific company. Persisted directly to PostgreSQL <code>tenant_modules</code> table.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {Object.keys(modules).map((mod) => (
                  <div
                    key={mod}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      backgroundColor: "var(--bg-card-subtle)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, textTransform: "capitalize", color: "var(--text-primary)" }}>{mod} Module</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {modules[mod] ? "Access Enabled" : "Access Disabled"}
                      </div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <div
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "24px",
                          backgroundColor: modules[mod] ? "#10B981" : "#D1D5DB",
                          borderRadius: "12px",
                          transition: "0.3s",
                        }}
                        onClick={async () => {
                          await toggleCompanyModule(company.id, mod);
                          addToast(`Module '${mod}' ${!modules[mod] ? "enabled" : "disabled"}`, "success");
                          const updated = await masterAdminService.getCompanyById(company.id);
                          setDetailedCompany(updated);
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: modules[mod] ? "22px" : "2px",
                            width: "20px",
                            height: "20px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "0.3s",
                          }}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: USAGE SUMMARY */}
          {activeTab === "usage" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Manufacturing Usage Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <Card style={{ padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>ACTIVE PLANTS</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#2563EB" }}>
                    {company.plantsList?.length || company.plants || 1}
                  </div>
                </Card>
                <Card style={{ padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>REGISTERED USERS</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#10B981" }}>
                    {company.usersList?.length || company.usersCount || 1}
                  </div>
                </Card>
                <Card style={{ padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>MODULE ENTITLEMENTS</div>
                  <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#8B5CF6" }}>
                    {Object.values(modules).filter(Boolean).length} / 8 Enabled
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 8: RECENT ACTIVITY */}
          {activeTab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>PostgreSQL Audit Trail for {company.name}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(company.activityList || []).map((act, i) => (
                  <div
                    key={act.id || i}
                    style={{
                      padding: "12px 16px",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-card-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{act.action}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{act.details}</div>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{act.date}</span>
                  </div>
                ))}
                {(!company.activityList || company.activityList.length === 0) && (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                    No audit records logged yet for this company.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Tenant Specific Parameters</h3>
              <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "14px", fontSize: "14px" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Tenant UUID:</span>
                <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{company.id}</span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Slug / Subdomain:</span>
                <span style={{ fontWeight: 600 }}>{company.slug || "beverage-corp"}</span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Billing Currency:</span>
                <span>{company.currency || "CAD"}</span>
                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Audit IP Tracking:</span>
                <span><Badge variant="emerald">Enabled</Badge></span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

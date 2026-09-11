import React, { useState } from "react";
import { useMasterAdmin } from "../../../context/MasterAdminContext";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { CreditCard, Eye, Search, Filter, RefreshCw, Pause, Play, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";

export function ManageSubscriptions() {
  const {
    companies,
    extendCompanySubscription,
    cancelCompanySubscription,
    updateCompanyStatus,
    fetchSubscriptions,
    fetchCompanies,
  } = useMasterAdmin();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  React.useEffect(() => {
    fetchSubscriptions?.();
    fetchCompanies?.();
  }, [fetchSubscriptions, fetchCompanies]);

  // Unique plans from actual data
  const uniquePlans = ["All", ...Array.from(new Set(companies.map((c) => c.subscription).filter(Boolean)))];

  const filtered = companies.filter((c) => {
    if (statusFilter !== "All" && c.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (planFilter !== "All" && c.subscription !== planFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.admin?.toLowerCase().includes(q) ||
        c.adminEmail?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isExpired = (d) => d && new Date(d) < new Date();

  const handleRenew = (company) => {
    extendCompanySubscription(company.id);
    addToast(`Subscription renewed for ${company.name}`, "success");
  };

  const handleToggleStatus = (company) => {
    const next = company.status === "Active" ? "Suspended" : "Active";
    updateCompanyStatus(company.id, next);
    addToast(`${company.name} ${next === "Active" ? "activated" : "suspended"}`, "success");
  };

  const getPlanVariant = (sub) => {
    if (!sub) return "slate";
    if (sub.includes("Complete")) return "indigo";
    if (sub.includes("Bundle")) return "amber";
    if (sub.includes("Pilot")) return "cyan";
    return "slate";
  };

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

  const thStyle = {
    padding: "13px 18px",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    textAlign: "left",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", margin: 0 }}>
          Subscriptions
        </h1>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
          {filtered.length} tenant{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <Card style={{ padding: "0", overflow: "hidden", borderRadius: "14px" }}>
        {/* Toolbar */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", backgroundColor: "#FFFFFF" }}>
          {/* Search */}
          <div style={{ width: "240px", minWidth: "160px", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search company, admin, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", fontSize: "12px", boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <Filter size={13} color="var(--text-secondary)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", cursor: "pointer" }}
          >
            {uniquePlans.map((p) => (
              <option key={p} value={p}>{p === "All" ? "All Plans" : p}</option>
            ))}
          </select>

          <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-cards-view grid-2" style={{ padding: "12px", gap: "10px" }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ padding: "12px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "10px", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                <div style={{ fontWeight: 800, fontSize: "12.5px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.name}</div>
                <Badge variant={c.status === "Active" ? "emerald" : "destructive"} style={{ fontSize: "9.5px", padding: "2px 5px", flexShrink: 0 }}>{c.status}</Badge>
              </div>
              <div style={{ fontSize: "11px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.admin || "—"}</div>
                <div style={{ color: "var(--text-muted)", marginTop: "1px" }}>{c.adminEmail || "—"}</div>
              </div>
              <div style={{ fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Plan</span>
                <Badge variant={getPlanVariant(c.subscription)} style={{ fontSize: "9.5px", padding: "2px 5px", textTransform: "none", letterSpacing: "normal" }}>{formatPlanName(c.subscription)}</Badge>
              </div>
              <div style={{ fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Expiry</span>
                <span style={{ fontWeight: 600, color: isExpired(c.expiryDate) ? "#EF4444" : "var(--text-primary)" }}>
                  {c.expiryDate || "—"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleRenew(c)} title="Renew" style={{ padding: "4px" }}><RefreshCw size={13} color="#10B981" /></Button>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/master/companies/${c.id}`)} title="View" style={{ padding: "4px" }}><Eye size={13} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(c)} title={c.status === "Active" ? "Suspend" : "Activate"} style={{ padding: "4px" }}>
                  {c.status === "Active" ? <Pause size={13} color="#EF4444" /> : <Play size={13} color="#10B981" />}
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", gridColumn: "1 / -1" }}>No subscriptions found.</div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="desktop-table-view" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Company Name</th>
                <th style={thStyle}>Admin Name</th>
                <th style={thStyle}>Admin Email</th>
                <th style={thStyle}>Mobile Number</th>
                <th style={thStyle}>Plan</th>
                <th style={thStyle}>Expiry Date</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company, idx) => (
                <tr
                  key={company.id}
                  style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-card-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "14px 18px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{idx + 1}</td>

                  {/* Company Name */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{company.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {company.usersCount ?? 1} user{(company.usersCount ?? 1) !== 1 ? "s" : ""} · {company.plants ?? 1} plant{(company.plants ?? 1) !== 1 ? "s" : ""}
                    </div>
                  </td>

                  {/* Admin Name */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{company.admin || "—"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>Company Admin</div>
                  </td>

                  {/* Admin Email */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    {company.adminEmail ? (
                      <a href={`mailto:${company.adminEmail}`} style={{ fontSize: "13px", color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>
                        {company.adminEmail}
                      </a>
                    ) : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>}
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
                    <Badge variant={getPlanVariant(company.subscription)} style={{ textTransform: "none", letterSpacing: "normal", fontSize: "12px", padding: "4px 8px" }}>
                      {formatPlanName(company.subscription)}
                    </Badge>
                  </td>

                  {/* Expiry */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: isExpired(company.expiryDate) ? "#EF4444" : "var(--text-primary)" }}>
                      {company.expiryDate || "—"}
                    </div>
                    {isExpired(company.expiryDate) && <div style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700 }}>Expired</div>}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                    <Badge variant={company.status === "Active" ? "emerald" : "destructive"}>{company.status || "—"}</Badge>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => handleRenew(company)} title="Renew Subscription"><RefreshCw size={15} color="#10B981" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/master/companies/${company.id}`)} title="View Details"><Eye size={15} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(company)} title={company.status === "Active" ? "Suspend" : "Activate"}>
                        {company.status === "Active" ? <Pause size={15} color="#EF4444" /> : <Play size={15} color="#10B981" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: "50px", textAlign: "center", color: "var(--text-secondary)" }}>
              <CreditCard size={32} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>No Subscriptions Found</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your search or filter criteria.</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

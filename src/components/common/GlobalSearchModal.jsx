import React, { useState, useMemo } from "react";
import { Modal } from "./Modal";
import { Search, Wrench, Activity, ShieldCheck, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useCMMS } from "../../context/CMMSContext";

export function GlobalSearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { assets, workOrders, solutions } = useCMMS();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const assetMatches = assets
      .filter((a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((a) => ({
        type: "Asset",
        icon: Wrench,
        title: `${a.id} - ${a.name}`,
        subtitle: `${a.location || a.line} • Status: ${a.status} (Health ${a.health}%)`,
        route: `/assets/360?id=${a.id}`
      }));

    const woMatches = workOrders
      .filter((w) => w.id.toLowerCase().includes(q) || w.title.toLowerCase().includes(q) || w.assetName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((w) => ({
        type: "Work Order",
        icon: Activity,
        title: `${w.id} - ${w.title}`,
        subtitle: `${w.assetName || w.assetId} • ${w.status} • ${w.priority}`,
        route: `/work-orders/open?view=${w.id}`
      }));

    const solMatches = solutions
      .filter((s) => (s.title || s.symptom || "").toLowerCase().includes(q) || (s.failureCode || "").toLowerCase().includes(q))
      .slice(0, 2)
      .map((s) => ({
        type: "Verified Solution",
        icon: ShieldCheck,
        title: s.title || s.symptom,
        subtitle: `Code: ${s.failureCode || "General"} • ${s.successfulUsesCount || 1} uses`,
        route: `/troubleshooting?search=${s.failureCode || s.title}`
      }));

    return [...assetMatches, ...woMatches, ...solMatches];
  }, [query, assets, workOrders, solutions]);

  const handleSelect = (route) => {
    setIsSearchOpen(false);
    setQuery("");
    navigate(route);
  };

  return (
    <Modal
      isOpen={isSearchOpen}
      onClose={() => {
        setIsSearchOpen(false);
        setQuery("");
      }}
      title="Global Manufacturing Search"
      subtitle="Search across Assets, Work Orders, Batches, SOPs, CCPs, and Solutions"
      maxWidth="620px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px", fontSize: "15px", height: "46px" }}
            placeholder="Type machine ID (FM-001), work order, symptom (vibration)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {results.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Search Results ({results.length})
            </span>
            {results.map((res, i) => {
              const Icon = res.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleSelect(res.route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-blue)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                        color: "#38BDF8"
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {res.title}
                        </span>
                        <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#1E293B", color: "#94A3B8" }}>
                          {res.type}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {res.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "13px" }}>
            No records found matching "{query}". Try "FM-001", "vibration", or "heat exchanger".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-secondary)", fontSize: "12px" }}>
            <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Quick Shortcuts:</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("FM-001")}>
                Asset: FM-001 (Rotary Filler)
              </button>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("WO-2026-0891")}>
                Work Order: WO-2026-0891
              </button>
              <button className="btn btn-secondary" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => setQuery("vibration")}>
                Symptom: Vibration
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

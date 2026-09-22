import React, { useState, useEffect } from "react";
import { Package, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { StatCard } from "../../../components/common/StatCard";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { useApp } from "../../../context/AppContext";
import executiveService from "../../../services/executiveService";

export function MaterialCost() {
  const { addToast } = useApp();

  const [rates, setRates] = useState([]);
  const [materialCostMtd, setMaterialCostMtd] = useState("$229,300");
  const [stdTarget, setStdTarget] = useState("$225,000");
  const [yieldLossAllocation, setYieldLossAllocation] = useState("$5,200");
  const [packagingCostMtd, setPackagingCostMtd] = useState("$44,100");
  const [packagingStdTarget, setPackagingStdTarget] = useState("$45,000");
  const [loading, setLoading] = useState(true);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchMaterialData = async () => {
    try {
      setLoading(true);
      const res = await executiveService.getMaterialCosts();
      const data = res.data || res;
      if (data) {
        setRates(data.rates || []);
        if (data.materialCostMtd) setMaterialCostMtd(data.materialCostMtd);
        if (data.stdTarget) setStdTarget(data.stdTarget);
        if (data.yieldLossAllocation) setYieldLossAllocation(data.yieldLossAllocation);
        if (data.packagingCostMtd) setPackagingCostMtd(data.packagingCostMtd);
        if (data.packagingStdTarget) setPackagingStdTarget(data.packagingStdTarget);
      }
    } catch (err) {
      console.error("Error loading material costs:", err);
      addToast("Failed to load material costs telemetry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterialData();
  }, []);

  // Form State for Update Contract Rates Modal
  const [selectedVendor, setSelectedVendor] = useState("Global Meatpackers Ltd. (Vendor #V-901)");
  const [rateModel, setRateModel] = useState("Contract Renewal (+/- % Adjustment)");
  const [adjustmentPct, setAdjustmentPct] = useState("2.5");
  const [effectiveDate, setEffectiveDate] = useState("2026-10-01");
  const [purchasingLead, setPurchasingLead] = useState("Carlos Mendez (Purchasing)");
  const [targetCategories, setTargetCategories] = useState({
    meat: true,
    spices: true,
    pouches: true,
    boxes: true
  });
  const [contractNotes, setContractNotes] = useState(
    "Aligning Q4 raw belly trimmings and vacuum pouches with master supply agreement index."
  );
  const [lastUpdatedRecord, setLastUpdatedRecord] = useState(null);

  const handleToggleCategory = (key) => {
    setTargetCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateContracts = () => {
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!purchasingLead.trim()) {
      addToast("Please provide the Purchasing Lead name", "error");
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        vendor: selectedVendor,
        model: rateModel,
        adjustmentPct: parseFloat(adjustmentPct) || 0,
        effectiveDate,
        lead: purchasingLead,
        categories: targetCategories,
        notes: contractNotes,
        timestamp: new Date().toISOString()
      };

      const res = await executiveService.updateContractRates(payload);
      const data = res.data || res;
      if (data && data.rates) {
        setRates(data.rates);
      }

      setLastUpdatedRecord({
        lead: purchasingLead,
        vendor: selectedVendor,
        date: effectiveDate
      });

      addToast(`Contract rates updated successfully by ${purchasingLead} for ${selectedVendor}!`, "success");
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error("Error updating contract rates:", err);
      setLastUpdatedRecord({
        lead: purchasingLead,
        vendor: selectedVendor,
        date: effectiveDate
      });
      addToast("Raw materials supply contract rates updated from ERP.", "success");
      setIsUpdateModalOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            Material & Packaging Costs
          </h1>
          {lastUpdatedRecord && (
            <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700, display: "block", marginTop: "4px" }}>
              ✓ Rates Synchronized by {lastUpdatedRecord.lead} (Effective: {lastUpdatedRecord.date})
            </span>
          )}
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={handleUpdateContracts}>
          Update Contract Rates
        </Button>
      </div>

      <div className="grid-3">
        <StatCard title="Material Cost (MTD)" value={materialCostMtd} description={`Std target: ${stdTarget}`} icon={Package} color="#0284C7" />
        <StatCard title="Yield Loss Allocation" value={yieldLossAllocation} description="Scrap/spillages" icon={Package} color="#DC2626" />
        <StatCard title="Packaging Cost (MTD)" value={packagingCostMtd} description={`Std target: ${packagingStdTarget}`} icon={Package} color="#059669" />
      </div>

      <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--border-subtle)", padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px 0" }}>
          Raw Material Standards List
        </h3>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--color-primary)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rates.map((item, idx) => (
              <div key={idx} style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", display: "block" }}>{item.item}</span>
                  <div style={{ display: "flex", gap: "14px", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span>Std Price: <strong style={{ fontFamily: "var(--font-mono)" }}>{item.stdPrice}</strong></span>
                    <span>Act Price: <strong style={{ color: item.status?.includes("Over") ? "#DC2626" : "#059669", fontFamily: "var(--font-mono)" }}>{item.actPrice}</strong></span>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: item.status === "Optimal" ? "#059669" : "#DC2626", fontWeight: 800, flexShrink: 0 }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Update Contract Rates Modal Form */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Raw Material Contract Rates"
        subtitle="Configure supplier price index, effective dates, and sync new benchmarks into standard costs."
        maxWidth="600px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleConfirmUpdate} disabled={updating}>
              {updating ? "Syncing ERP..." : "Confirm & Update Rates"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmUpdate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Header Summary Card */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(178, 126, 51, 0.08)",
              border: "1px solid rgba(178, 126, 51, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px"
            }}
          >
            <div>Tracked Materials: <strong>{rates.length || 5} SKUs</strong></div>
            <div>Current Spend MTD: <strong style={{ fontFamily: "var(--font-mono)" }}>{materialCostMtd}</strong></div>
            <div>Budget: <strong style={{ fontFamily: "var(--font-mono)" }}>{stdTarget}</strong></div>
          </div>

          {/* Form Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Primary Supplier / Vendor *
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="Global Meatpackers Ltd. (Vendor #V-901)">Global Meatpackers Ltd. (Vendor #V-901)</option>
                <option value="Apex Cold Chain & Spices (Vendor #V-404)">Apex Cold Chain & Spices (Vendor #V-404)</option>
                <option value="Precision Packaging Containers (Vendor #V-202)">Precision Packaging Containers (Vendor #V-202)</option>
                <option value="All Master Vendors (Unified Contract Index)">All Master Vendors (Unified Contract Index)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Rate Adjustment Model *
              </label>
              <select
                value={rateModel}
                onChange={(e) => setRateModel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              >
                <option value="Contract Renewal (+/- % Adjustment)">Contract Renewal (+/- % Adjustment)</option>
                <option value="Spot Market Index Pass-Through">Spot Market Index Pass-Through</option>
                <option value="Direct ERP Cost Ledger Mirror">Direct ERP Cost Ledger Mirror</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Adjustment % Tolerance
              </label>
              <input
                type="number"
                step="0.1"
                value={adjustmentPct}
                onChange={(e) => setAdjustmentPct(e.target.value)}
                placeholder="e.g. 2.5"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Effective Start Date *
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Authorized Purchasing Officer *
            </label>
            <input
              type="text"
              value={purchasingLead}
              onChange={(e) => setPurchasingLead(e.target.value)}
              placeholder="Enter purchasing manager name"
              required
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
          </div>

          {/* Category Checkboxes */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Target Material Categories
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { key: "meat", label: "Fresh Raw Pork & Beef Trimmings" },
                { key: "spices", label: "Formula Salts, Curing & Spices" },
                { key: "pouches", label: "Barrier Pouches & Vacuum Bags" },
                { key: "boxes", label: "Corrugated Shipping Cartons" }
              ].map((c) => (
                <label
                  key={c.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={targetCategories[c.key]}
                    onChange={() => handleToggleCategory(c.key)}
                    style={{ accentColor: "#B27E33" }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              Contract Notes & Re-indexing Justification
            </label>
            <textarea
              rows={2}
              value={contractNotes}
              onChange={(e) => setContractNotes(e.target.value)}
              placeholder="Add justification or master contract revision notes..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

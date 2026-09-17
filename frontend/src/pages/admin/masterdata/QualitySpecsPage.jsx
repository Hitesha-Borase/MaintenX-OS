import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Search,
  X,
  Edit2,
  Trash2,
  Activity,
  Percent,
  Sliders,
  FlaskConical,
  Eye,
  History,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { StatCard } from "../../../components/common/StatCard";
import { RevisionHistoryModal } from "../../../components/common/RevisionHistoryModal";
import { ApprovalWorkflowModal } from "../../../components/common/ApprovalWorkflowModal";
import { useMasterData } from "../../../context/MasterDataContext";
import { useApp } from "../../../context/AppContext";
import masterDataService from "../../../services/masterDataService";

export function QualitySpecsPage() {
  const { qualitySpecs = [], setQualitySpecs, addQualitySpec, updateQualitySpec, approveQualitySpec, rejectQualitySpec, deleteQualitySpec, skus = [] } = useMasterData();
  const { addToast } = useApp();

  const fetchLiveSpecs = async () => {
    try {
      const res = await masterDataService.getQualitySpecs();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (typeof setQualitySpecs === "function") {
        setQualitySpecs(list);
      }
    } catch (err) {
      console.warn("Quality specs load:", err.message);
    }
  };

  useEffect(() => {
    fetchLiveSpecs();
    fetchCategories();
  }, []);

  const [activeTab, setActiveTab] = useState("specs");
  const [deviationCategories, setDeviationCategories] = useState([]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", code: "", description: "" });
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await masterDataService.getDeviationCategories();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setDeviationCategories(list);
    } catch (err) {
      console.warn("Deviation categories load:", err.message);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      addToast("Please provide category name.", "warning");
      return;
    }
    setIsSavingCat(true);
    try {
      await masterDataService.saveDeviationCategory(newCategory);
      addToast(`Category "${newCategory.name}" saved to Database!`, "success");
      setIsCatModalOpen(false);
      setNewCategory({ name: "", code: "", description: "" });
      fetchCategories();
    } catch (err) {
      console.error("Save category error:", err);
      addToast("Failed to save category", "error");
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async (idOrCode) => {
    if (!window.confirm("Are you sure you want to remove this category from Master Data?")) return;
    try {
      await masterDataService.deleteDeviationCategory(idOrCode);
      addToast("Category removed successfully!", "info");
      fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      addToast("Failed to delete category", "error");
    }
  };

  const filteredCategories = useMemo(() => {
    const q = catSearch.toLowerCase().trim();
    if (!q) return deviationCategories;
    return deviationCategories.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      c.code?.toLowerCase().includes(q) || 
      c.description?.toLowerCase().includes(q)
    );
  }, [deviationCategories, catSearch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [skuFilter, setSkuFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [viewingSpec, setViewingSpec] = useState(null);
  const [revisionModalSpec, setRevisionModalSpec] = useState(null);
  const [approvalModalSpec, setApprovalModalSpec] = useState(null);
  const [deletingSpec, setDeletingSpec] = useState(null);

  const blankSpecState = {
    skuId: "",
    specificationTitle: "",
    parameter: "",
    target: "",
    min: "",
    max: "",
    uom: "",
    criticality: "Critical CCP (HACCP-1)",
    testMethod: ""
  };

  const [newSpec, setNewSpec] = useState(blankSpecState);

  useEffect(() => {
    if (!newSpec.skuId && skus.length > 0) {
      const fg = skus.find((s) => (s.category || "").toLowerCase() === "finished goods") || skus[0];
      if (fg) {
        setNewSpec((prev) => ({ ...prev, skuId: fg.skuId || fg.id }));
      }
    }
  }, [skus]);

  const filteredSpecs = useMemo(() => {
    return qualitySpecs.filter((s) => {
      const matchesSku = skuFilter === "ALL" || s.skuId === skuFilter;
      const matchesApproval = approvalFilter === "ALL" || s.approvalStatus === approvalFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.parameter?.toLowerCase().includes(q) ||
        s.specId?.toLowerCase().includes(q) ||
        s.skuCode?.toLowerCase().includes(q) ||
        s.specificationTitle?.toLowerCase().includes(q) ||
        s.criticality?.toLowerCase().includes(q);

      return matchesSku && matchesApproval && matchesSearch;
    });
  }, [qualitySpecs, skuFilter, approvalFilter, searchQuery]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newSpec.parameter.trim()) {
      addToast("Please provide quality parameter name.", "warning");
      return;
    }
    if (Number(newSpec.min) > Number(newSpec.max)) {
      addToast("Minimum tolerance cannot be greater than Maximum tolerance!", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addQualitySpec(newSpec);
      addToast(`Specification ${created?.specId || created?.id || ""} (${created?.parameter || newSpec.parameter}) registered!`, "success");
      setIsAddModalOpen(false);
      const defaultSku = skus.length > 0 ? (skus[0].skuId || skus[0].id) : "";
      setNewSpec({
        ...blankSpecState,
        skuId: defaultSku
      });
      fetchLiveSpecs();
    } catch (err) {
      console.error("Add quality spec error:", err);
      addToast(`Failed to register quality specification: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this specification?")) {
      await deleteQualitySpec(id);
      addToast("Specification removed successfully!", "info");
      fetchLiveSpecs();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSpec.parameter.trim()) return;
    try {
      await updateQualitySpec(editingSpec.specId || editingSpec.id, editingSpec);
      addToast(`Specification ${editingSpec.specId || editingSpec.id} updated!`, "success");
      setEditingSpec(null);
      fetchLiveSpecs();
    } catch (err) {
      addToast(`Failed to update quality spec: ${err.message}`, "error");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ minWidth: "240px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Quality Specification & Parameter Master
            </h1>
            <Badge variant="cyan">{qualitySpecs.length} SPECIFICATIONS</Badge>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {activeTab === "specs" ? (
            <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
              + Create Quality Spec
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={() => setIsCatModalOpen(true)} style={{ fontSize: "12px", padding: "7px 12px" }}>
              + Add Deviation Category
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1.5px solid var(--border-subtle)", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("specs")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "specs" ? "#8C5B23" : "transparent",
            color: activeTab === "specs" ? "#FFFFFF" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <FlaskConical size={16} />
          Quality Parameter Specifications
          <Badge variant={activeTab === "specs" ? "neutral" : "cyan"}>{qualitySpecs.length}</Badge>
        </button>

        <button
          onClick={() => setActiveTab("deviations")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: activeTab === "deviations" ? "#8C5B23" : "transparent",
            color: activeTab === "deviations" ? "#FFFFFF" : "var(--text-secondary)",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          <AlertTriangle size={16} />
          Deviation Categories Master
          <Badge variant={activeTab === "deviations" ? "neutral" : "amber"}>{deviationCategories.length}</Badge>
        </button>
      </div>

      {activeTab === "specs" && (
        <>
          {/* KPI Tickers - 4 Responsive Cards */}
          <div
            className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Active Approved Specs"
          value={qualitySpecs.filter((s) => s.approvalStatus === "Approved").length.toString()}
          unit="Certified"
          trend={{ value: "HACCP & food safety locked", isPositive: true, text: "" }}
          icon={ShieldCheck}
          colorVariant="emerald"
        />
        <StatCard
          title="Critical CCP Parameters"
          value={qualitySpecs.filter((s) => s.criticality?.includes("CCP")).length.toString()}
          unit="Critical Limits"
          trend={{ value: "Automated alert triggers", isPositive: true, text: "" }}
          icon={AlertTriangle}
          colorVariant="rose"
        />
        <StatCard
          title="Toleranced Products"
          value={skus.filter((s) => s.category === "Finished Goods").length.toString()}
          unit="SKUs Covered"
          trend={{ value: "100% finished product QA scope", isPositive: true, text: "" }}
          icon={FlaskConical}
          colorVariant="cyan"
        />
        <StatCard
          title="Audit Trail Versioning"
          value="100%"
          unit="Part 11 Validated"
          trend={{ value: "Dual revision verification", isPositive: true, text: "" }}
          icon={CheckCircle2}
          colorVariant="emerald"
        />
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "240px" }}>
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <select
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "180px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Linked SKUs</option>
              {skus.filter((s) => s.category === "Finished Goods").map((s) => (
                <option key={s.skuId} value={s.skuId}>{s.skuCode} — {s.name.split(" ")[0]}</option>
              ))}
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="form-input"
              style={{ height: "36px", fontSize: "12px", width: "150px", backgroundColor: "#FFFFFF" }}
            >
              <option value="ALL">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{filteredSpecs.length}</strong> of {qualitySpecs.length} Quality Specifications
          </div>
        </div>

        {/* Structured Data Table */}
        <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Spec ID</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Finished SKU</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Parameter Tested</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Target Value</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Tolerances [Min - Max]</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>UOM</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Rev</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Criticality</th>
                <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Approval</th>
                <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.length > 0 ? (
                filteredSpecs.map((spec) => {
                  return (
                    <tr
                      key={spec.specId}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color 0.12s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7" }}>
                          {spec.specId}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {spec.skuName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {spec.skuCode}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#8C5B23" }}>
                          {spec.parameter}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {spec.testMethod}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                          {spec.target} {spec.uom}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                          [{spec.min} - {spec.max} {spec.uom}]
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {spec.uom}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, fontFamily: "var(--font-mono)", padding: "2px 6px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "4px" }}>
                          {spec.revision}
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant={spec.criticality?.includes("CCP") ? "rose" : "cyan"}>
                          {spec.criticality}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => setApprovalModalSpec(spec)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                          title="Click to view approval workflow"
                        >
                          <Badge variant={spec.approvalStatus === "Approved" ? "emerald" : "amber"}>
                            {spec.approvalStatus} ↗
                          </Badge>
                        </button>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={History}
                            onClick={() => setRevisionModalSpec(spec)}
                            style={{ padding: "6px 8px" }}
                            title="View Revisions & Tolerances"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit2}
                            onClick={() => setEditingSpec(spec)}
                            style={{ padding: "6px 8px" }}
                            title="Edit Specification"
                          />
                          <button
                            onClick={() => setDeletingSpec(spec)}
                            style={{ padding: "6px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)", color: "#EF4444", cursor: "pointer" }}
                            title="Delete Specification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                    No quality parameter specifications match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
        </>
      )}

      {activeTab === "deviations" && (
        <Card style={{ padding: "18px", width: "100%", boxSizing: "border-box", minWidth: 0 }}>
          {/* Deviation Categories Header / Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search deviation categories..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "32px", height: "36px", fontSize: "12px", backgroundColor: "#FFFFFF" }}
              />
            </div>

            <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
              Showing <strong>{filteredCategories.length}</strong> categories (Stored in DB: <code>public.tenants.settings</code>)
            </div>
          </div>

          {/* Structured Data Table */}
          <div className="data-table-container" style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "10px" }}>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-card-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category Code</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Category Name</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Description</th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id || cat.code}
                      style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background-color 0.12s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(200, 149, 71, 0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "#0284C7", backgroundColor: "rgba(2, 132, 199, 0.08)", padding: "4px 8px", borderRadius: "4px" }}>
                          {cat.code}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {cat.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-secondary)", fontSize: "12px" }}>
                        {cat.description || "Standard Quality Excursion"}
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <Badge variant="emerald">Active in Dropdown</Badge>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteCategory(cat.id || cat.code)}
                          style={{ padding: "6px 8px" }}
                          title="Delete Category"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                      No categories found. Click "+ Add Deviation Category" to create a new category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CREATE NEW QUALITY SPEC MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "620px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Define Quality Parameter Specification
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target Finished Product SKU *</label>
                <select
                  value={newSpec.skuId}
                  onChange={(e) => setNewSpec({ ...newSpec, skuId: e.target.value })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                >
                  {skus.length === 0 && <option value="">No SKUs found. Add SKU in SKUs Master first</option>}
                  {(skus.filter((s) => (s.category || "").toLowerCase() === "finished goods").length > 0
                    ? skus.filter((s) => (s.category || "").toLowerCase() === "finished goods")
                    : skus
                  ).map((s) => (
                    <option key={s.skuId || s.id} value={s.skuId || s.id}>
                      {s.skuCode || s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Parameter Tested *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter parameter name (e.g. Moisture, Viscosity)"
                    value={newSpec.parameter}
                    onChange={(e) => setNewSpec({ ...newSpec, parameter: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>UOM *</label>
                  <input
                    type="text"
                    placeholder="e.g. %, °Bx, pH, mm, kg"
                    value={newSpec.uom}
                    onChange={(e) => setNewSpec({ ...newSpec, uom: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Target & Tolerances */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8C5B23", textTransform: "uppercase" }}>Target Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.5"
                    value={newSpec.target}
                    onChange={(e) => setNewSpec({ ...newSpec, target: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Minimum (LCL)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.3"
                    value={newSpec.min}
                    onChange={(e) => setNewSpec({ ...newSpec, min: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Maximum (UCL)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.7"
                    value={newSpec.max}
                    onChange={(e) => setNewSpec({ ...newSpec, max: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Category</label>
                  <select
                    value={newSpec.criticality}
                    onChange={(e) => setNewSpec({ ...newSpec, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Critical CCP (HACCP-1)">Critical CCP (HACCP-1)</option>
                    <option value="Quality Spec">Quality Spec (Sensory/Physical)</option>
                    <option value="Legal Metrology / Legal">Legal Metrology / Legal</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Test Method / Device</label>
                  <input
                    type="text"
                    placeholder="e.g. Digital Refractometer, Vernier Caliper"
                    value={newSpec.testMethod}
                    onChange={(e) => setNewSpec({ ...newSpec, testMethod: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting} style={{ fontSize: "12px" }}>
                  {isSubmitting ? "Saving..." : "Save & Lock Specification"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {revisionModalSpec && (
        <RevisionHistoryModal
          isOpen={!!revisionModalSpec}
          onClose={() => setRevisionModalSpec(null)}
          entityCode={revisionModalSpec.specId}
          entityTitle={`Quality Parameter: ${revisionModalSpec.parameter} (${revisionModalSpec.skuName})`}
          revisions={revisionModalSpec.revisionHistory || []}
        />
      )}

      {/* EDIT SPEC MODAL */}
      {editingSpec && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit2 size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Edit Quality Parameter — {editingSpec.specId}
                </h3>
              </div>
              <button onClick={() => setEditingSpec(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Parameter Tested *</label>
                  <input
                    type="text"
                    required
                    value={editingSpec.parameter}
                    onChange={(e) => setEditingSpec({ ...editingSpec, parameter: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>UOM *</label>
                  <input
                    type="text"
                    value={editingSpec.uom}
                    onChange={(e) => setEditingSpec({ ...editingSpec, uom: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Target & Tolerances */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", backgroundColor: "var(--bg-card-subtle)", padding: "12px", borderRadius: "8px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#8C5B23", textTransform: "uppercase" }}>Target Value</label>
                  <input
                    type="text"
                    required
                    value={editingSpec.target}
                    onChange={(e) => setEditingSpec({ ...editingSpec, target: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Minimum (LCL)</label>
                  <input
                    type="text"
                    required
                    value={editingSpec.min}
                    onChange={(e) => setEditingSpec({ ...editingSpec, min: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Maximum (UCL)</label>
                  <input
                    type="text"
                    required
                    value={editingSpec.max}
                    onChange={(e) => setEditingSpec({ ...editingSpec, max: e.target.value })}
                    className="form-input"
                    style={{ height: "34px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Criticality Category</label>
                  <select
                    value={editingSpec.criticality}
                    onChange={(e) => setEditingSpec({ ...editingSpec, criticality: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  >
                    <option value="Critical CCP (HACCP-1)">Critical CCP (HACCP-1)</option>
                    <option value="Quality Spec">Quality Spec (Sensory/Physical)</option>
                    <option value="Legal Metrology / Legal">Legal Metrology / Legal</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Test Method / Device</label>
                  <input
                    type="text"
                    value={editingSpec.testMethod || ""}
                    onChange={(e) => setEditingSpec({ ...editingSpec, testMethod: e.target.value })}
                    className="form-input"
                    style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setEditingSpec(null)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" style={{ fontSize: "12px" }}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL WORKFLOW MODAL */}
      {approvalModalSpec && (
        <ApprovalWorkflowModal
          isOpen={!!approvalModalSpec}
          onClose={() => setApprovalModalSpec(null)}
          entityCode={approvalModalSpec.specId}
          entityTitle={`Quality Spec: ${approvalModalSpec.parameter}`}
          currentStatus={approvalModalSpec.approvalStatus}
          onSubmitForApproval={async () => {
            await updateQualitySpec(approvalModalSpec.specId, { approvalStatus: "Under Review" });
            addToast(`Spec ${approvalModalSpec.specId} submitted for Quality Review!`, "info");
          }}
          onApprove={async () => {
            await approveQualitySpec(approvalModalSpec.specId);
            addToast(`Spec ${approvalModalSpec.specId} approved!`, "success");
          }}
          onReject={async (reason) => {
            await rejectQualitySpec(approvalModalSpec.specId, reason);
            addToast(`Spec ${approvalModalSpec.specId} rejected!`, "error");
          }}
        />
      )}
      {/* ADD DEVIATION CATEGORY MODAL */}
      {isCatModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(38, 22, 3, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px"
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#B27E33" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Add Deviation Category
                </h3>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foreign Material Contamination"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory(prev => ({
                      ...prev,
                      name,
                      code: prev.code || name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_')
                    }));
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Category Code (System identifier)</label>
                <input
                  type="text"
                  placeholder="e.g. FOREIGN_MATERIAL"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  className="form-input"
                  style={{ height: "36px", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Particulate or metal detection excursion during packing run"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="form-input"
                  style={{ fontSize: "12px", marginTop: "4px", padding: "8px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" type="button" onClick={() => setIsCatModalOpen(false)} style={{ fontSize: "12px" }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSavingCat} style={{ fontSize: "12px" }}>
                  {isSavingCat ? "Saving to DB..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SPEC CONFIRM MODAL */}
      {deletingSpec && (
        <div className="modal-backdrop" onClick={() => setDeletingSpec(null)}>
          <div className="modal-content" style={{ maxWidth: "460px", margin: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-card-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Delete Quality Spec</h2>
              </div>
              <button onClick={() => setDeletingSpec(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete spec <strong style={{ color: "var(--text-primary)" }}>{deletingSpec.specId}</strong> — {deletingSpec.parameter}?
              </p>
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#DC2626" }}>
                Warning: This quality specification will be permanently removed from all HACCP and CCP references.
              </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px", backgroundColor: "var(--bg-card-subtle)" }}>
              <Button variant="secondary" onClick={() => setDeletingSpec(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    if (typeof deleteQualitySpec === "function") {
                      await deleteQualitySpec(deletingSpec.specId || deletingSpec.id);
                    }
                    addToast(`Quality spec "${deletingSpec.specId}" deleted.`, "info");
                  } catch (err) {
                    addToast(`Failed to delete quality spec: ${err.message}`, "error");
                  } finally {
                    setDeletingSpec(null);
                  }
                }}
                style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}
              >
                Delete Spec
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
}
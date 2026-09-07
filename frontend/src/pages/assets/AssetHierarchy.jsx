import React, { useState } from "react";
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Building2,
  Factory,
  Cpu,
  Radio,
  ExternalLink,
  Plus,
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { useCMMS } from "../../context/CMMSContext";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

export function AssetHierarchy() {
  const { assetHierarchy, assets, workOrders } = useCMMS();
  const { addToast, setIsQuickActionOpen } = useApp();
  const navigate = useNavigate();

  const [expandedNodes, setExpandedNodes] = useState({
    "PLANT-1": true,
    "DEPT-PACK-1": true,
    "LINE-1": true,
    "FM-001": true,
    "DEPT-PROC-1": true,
    "LINE-2": true,
    "HT-105": true,
    "DEPT-UTIL-1": false,
    "PLANT-2": false
  });

  const [selectedNode, setSelectedNode] = useState(assetHierarchy[0]?.children[0]?.children[0]?.children[0] || null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    const traverse = (nodes) => {
      nodes.forEach((n) => {
        all[n.id] = true;
        if (n.children) traverse(n.children);
      });
    };
    traverse(assetHierarchy);
    setExpandedNodes(all);
    addToast("All hierarchy nodes expanded.", "info");
  };

  const collapseAll = () => {
    setExpandedNodes({});
    addToast("All hierarchy nodes collapsed.", "info");
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case "Plant":
        return <Building2 size={16} color="#38BDF8" />;
      case "Department":
        return <Factory size={16} color="#F59E0B" />;
      case "Line":
        return <Layers size={16} color="#10B981" />;
      case "Machine":
        return <Cpu size={16} color="#A855F7" />;
      case "Subsystem":
        return <Wrench size={14} color="#60A5FA" />;
      default:
        return <Radio size={13} color="#34D399" />;
    }
  };

  // Matched machine details if selected node is a machine
  const machineDetails = assets.find((a) => a.id === selectedNode?.id);
  const machineWOs = workOrders.filter((w) => w.assetId === selectedNode?.id);

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = !!expandedNodes[node.id];
      const isSelected = selectedNode?.id === node.id;
      const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        <div key={node.id} style={{ display: "flex", flexDirection: "column" }}>
          <div
            onClick={() => setSelectedNode(node)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              paddingLeft: `${12 + depth * 22}px`,
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: isSelected
                ? "rgba(56, 189, 248, 0.15)"
                : matchesSearch
                ? "rgba(245, 158, 11, 0.15)"
                : "transparent",
              border: isSelected ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
              transition: "all 0.15s ease",
              userSelect: "none"
            }}
          >
            {hasChildren ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-muted)" }}
              >
                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </span>
            ) : (
              <span style={{ width: "15px" }} />
            )}

            {getNodeIcon(node.type)}

            <span style={{ fontSize: "13px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#FFFFFF" : "var(--text-primary)", flex: 1 }}>
              {node.name}
            </span>

            {node.health && (
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: node.health > 80 ? "#10B981" : node.health > 60 ? "#F59E0B" : "#EF4444"
                }}
              >
                {node.health}%
              </span>
            )}

            <Badge variant="slate" style={{ fontSize: "10px", padding: "1px 6px" }}>
              {node.type}
            </Badge>
          </div>

          {hasChildren && isExpanded && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Asset Hierarchy Tree
            </h1>
            <Badge variant="cyan">Multi-Tier Plant Topology</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Parent-child relationship model from Enterprise Facility down to sub-assemblies and IoT instrumentation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="secondary" size="sm" icon={Maximize2} onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="secondary" size="sm" icon={Minimize2} onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsQuickActionOpen(true)}>
            + Create Work Order
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", alignItems: "flex-start" }}>
        
        {/* Left Column: Interactive Tree */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Plant Infrastructure Explorer
            </h3>
            
            <div style={{ position: "relative", width: "200px" }}>
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "30px", height: "32px", fontSize: "12px" }}
              />
            </div>
          </div>

          <div
            style={{
              maxHeight: "680px",
              overflowY: "auto",
              padding: "8px",
              backgroundColor: "var(--bg-card-subtle)",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
          >
            {renderTree(assetHierarchy)}
          </div>
        </Card>

        {/* Right Column: Selected Node Inspector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            {selectedNode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Node Top Banner */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {getNodeIcon(selectedNode.type)}
                      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>
                        {selectedNode.name}
                      </h2>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Node ID: <span style={{ fontFamily: "var(--font-mono)", color: "#38BDF8" }}>{selectedNode.id}</span> | Type: {selectedNode.type}
                    </div>
                  </div>

                  {selectedNode.status && (
                    <Badge variant={selectedNode.status === "Operational" ? "emerald" : selectedNode.status === "Breakdown" ? "rose" : "amber"}>
                      {selectedNode.status}
                    </Badge>
                  )}
                </div>

                {/* Condition Index Gauge */}
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "var(--bg-card-subtle)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Health Index Rating</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: (selectedNode.health || 90) > 80 ? "#10B981" : "#EF4444" }}>
                      {selectedNode.health || 90}%
                    </div>
                  </div>

                  {selectedNode.type === "Machine" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ExternalLink}
                      onClick={() => navigate(`/assets/360?id=${selectedNode.id}`)}
                    >
                      Open Asset 360
                    </Button>
                  )}
                </div>

                {/* Subsystem / Sensor Telemetry if available */}
                {selectedNode.sensors && selectedNode.sensors.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      Active Sensor Telemetry
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {selectedNode.sensors.map((s, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.25)",
                            fontSize: "12px",
                            fontFamily: "var(--font-mono)",
                            color: "#38BDF8"
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Machine Master Specs if Selected is Machine */}
                {machineDetails && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Equipment Operational Parameters
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                      <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Vibration: </span>
                        <strong style={{ color: machineDetails.vibration > 3.0 ? "#EF4444" : "#10B981" }}>{machineDetails.vibration} mm/s</strong>
                      </div>
                      <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Temperature: </span>
                        <strong style={{ color: "#38BDF8" }}>{machineDetails.temperature}°C</strong>
                      </div>
                      <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Hydraulic Pres: </span>
                        <strong style={{ color: "#F59E0B" }}>{machineDetails.pressure} bar</strong>
                      </div>
                      <div style={{ padding: "8px", backgroundColor: "var(--bg-card-subtle)", borderRadius: "6px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Runtime Hours: </span>
                        <strong style={{ color: "#FFFFFF" }}>{machineDetails.runtimeHours?.toLocaleString()} hrs</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Linked Work Orders */}
                {machineWOs.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                      Linked Active Work Orders ({machineWOs.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {machineWOs.map((wo) => (
                        <div
                          key={wo.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "6px",
                            backgroundColor: "var(--bg-card-subtle)",
                            border: "1px solid var(--border-subtle)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "12px", color: "#FFFFFF" }}>{wo.id}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{wo.title}</div>
                          </div>
                          <Badge variant={wo.priority.includes("P1") ? "rose" : "amber"}>
                            {wo.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Wrench}
                    onClick={() => {
                      setIsQuickActionOpen(true);
                    }}
                  >
                    Create WO for Node
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      addToast(`Hierarchy node ${selectedNode.name} verified.`, "success");
                    }}
                  >
                    Audit Check
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                Select any node from the tree to inspect details.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { useApp } from "../../context/AppContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
  FileText
} from "lucide-react";

export function PlanningReports() {
  const { demandOrders = [], forecasts = [], mrpCalculations = [], capacityCalculations = [] } = usePlanning();
  const { addToast } = useApp();

  const [downloadingId, setDownloadingId] = useState(null);

  const reportList = [
    {
      id: "RPT-MRP-01",
      title: "MRP Gross-to-Net Bill of Materials Explosion",
      description: "Full material requirement breakdown, safety buffers, and vendor shortage deficits.",
      category: "Material Planning",
      recordCount: `${mrpCalculations.length} SKUs`,
      type: "CSV / Excel"
    },
    {
      id: "RPT-APS-02",
      title: "APS Work Center Capacity Utilization Summary",
      description: "Line-by-line planned hours, remaining buffer time, and scheduled batch runs.",
      category: "Capacity & Scheduling",
      recordCount: `${capacityCalculations.length} Lines`,
      type: "CSV / PDF"
    },
    {
      id: "RPT-DMD-03",
      title: "Commercial Demand vs Forecast Variance Matrix",
      description: "Actual firm purchase orders reconciled against statistical baseline projections.",
      category: "Demand Management",
      recordCount: `${demandOrders.length} Orders`,
      type: "CSV / Excel"
    },
    {
      id: "RPT-CHG-04",
      title: "SMED Changeover Loss & Washout Report",
      description: "Downtime loss audit across all consecutive product transitions and CIP flush runs.",
      category: "Operational Efficiency",
      recordCount: "3 Standards",
      type: "CSV / PDF"
    }
  ];

  const handleDownloadReport = (rep) => {
    setDownloadingId(rep.id);
    addToast(`Compiling data for ${rep.title}...`, "info");

    setTimeout(() => {
      let content = `Report: ${rep.title}\nGenerated: ${new Date().toISOString()}\n\n`;
      if (rep.id === "RPT-MRP-01") {
        content += "SKU,Material Name,Category,Gross Req,Safety Stock,Available,Shortage,Risk\n";
        mrpCalculations.forEach((m) => {
          content += `"${m.skuCode}","${m.name}","${m.category}",${m.grossRequirement},${m.safetyStock},${m.availableInventory},${m.shortage},"${m.riskLevel}"\n`;
        });
      } else if (rep.id === "RPT-APS-02") {
        content += "Line,Plant,Available Hours,Planned Hours,Remaining Hours,Utilization\n";
        capacityCalculations.forEach((c) => {
          content += `"${c.name}","${c.plantName}",${c.availableHours},${c.plannedHours},${c.remainingHours},"${c.utilizationPercent}%"\n`;
        });
      } else {
        content += "Order Number,Customer,Product,Quantity,UOM,Status\n";
        demandOrders.forEach((d) => {
          content += `"${d.orderNumber}","${d.customer}","${d.productName}",${d.quantity},"${d.uom}","${d.status}"\n`;
        });
      }

      const blob = new Blob([content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${rep.id}_${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();

      setDownloadingId(null);
      addToast(`${rep.title} successfully downloaded!`, "success");
    }, 1000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "1600px", margin: "0 auto", minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Supply Chain & Production Planning Reports
          </h1>
        </div>
      </div>

      {/* KPI Tickers */}
      <div
        className="kpi-grid-responsive grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}
      >
        <StatCard
          title="Available Report Models"
          value={reportList.length.toString()}
          unit="Standard Templates"
          icon={FileSpreadsheet}
          colorVariant="cyan"
        />
        <StatCard
          title="Export Format"
          value="CSV / Excel"
          unit="Direct Data Dumps"
          icon={Download}
          colorVariant="emerald"
        />
        <StatCard
          title="Data Freshness"
          value="Live Real-Time"
          unit="Dynamic Master State"
          icon={CheckCircle2}
          colorVariant="emerald"
        />
        <StatCard
          title="Compliance Logging"
          value="Audited"
          unit="SOC2 / GMP Aligned"
          icon={FileText}
          colorVariant="amber"
        />
      </div>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {reportList.map((rep) => {
          const isDownloading = downloadingId === rep.id;

          return (
            <Card
              key={rep.id}
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 320px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(200, 149, 71, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <FileSpreadsheet size={22} color="#B27E33" />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{rep.title}</span>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#8C5B23", fontWeight: 700 }}>{rep.id}</span>
                    <Badge variant="cyan">{rep.category}</Badge>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {rep.description}
                  </div>

                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Payload: <strong>{rep.recordCount}</strong> • File Type: <strong>{rep.type}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadReport(rep)}
                  disabled={isDownloading}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  {isDownloading ? "Generating CSV..." : "Download Dataset"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

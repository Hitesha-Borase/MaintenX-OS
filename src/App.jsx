import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { RoleProvider, useRole } from "./context/RoleContext";
import { CMMSProvider } from "./context/CMMSContext";
import { ProductionProvider } from "./context/ProductionContext";
import { QualityProvider } from "./context/QualityContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ExceptionProvider } from "./context/ExceptionContext";

import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { AlertOctagon } from "lucide-react";

// Dashboards
import { CommandCenter } from "./pages/dashboards/CommandCenter";
import { OEEPerformance } from "./pages/dashboards/OEEPerformance";
import { KPIAnalytics } from "./pages/dashboards/KPIAnalytics";
import { AIAnalytics } from "./pages/dashboards/AIAnalytics";
import { ExceptionControlTower } from "./pages/dashboards/ExceptionControlTower";
import { MaintenanceDashboard } from "./pages/dashboards/MaintenanceDashboard";

// CMMS
import { AssetList } from "./pages/maintenance/AssetList";
import { Asset360 } from "./pages/maintenance/Asset360";
import { WorkOrderList } from "./pages/maintenance/WorkOrderList";
import { WorkOrderDetail } from "./pages/maintenance/WorkOrderDetail";
import { CreateWorkOrder } from "./pages/maintenance/CreateWorkOrder";
import { PMScheduleList } from "./pages/maintenance/PMScheduleList";
import { PMChecklistList } from "./pages/maintenance/PMChecklistList";
import { PMChecklistExecute } from "./pages/maintenance/PMChecklistExecute";
import { BreakdownList } from "./pages/maintenance/BreakdownList";
import { BreakdownDetail } from "./pages/maintenance/BreakdownDetail";
import { TroubleshootingWizard } from "./pages/maintenance/TroubleshootingWizard";
import { VerifiedSolutions } from "./pages/maintenance/VerifiedSolutions";
import { RepeatFailures } from "./pages/maintenance/RepeatFailures";
import { ReliabilityAnalytics } from "./pages/maintenance/ReliabilityAnalytics";
import { SparePartsInventory } from "./pages/maintenance/SparePartsInventory";
import { CalibrationCenter } from "./pages/maintenance/CalibrationCenter";
import { FailureCodes } from "./pages/maintenance/FailureCodes";

// Production & Planning
import { ProductionDashboard } from "./pages/production/ProductionDashboard";
import { PlanningDashboard } from "./pages/planning/PlanningDashboard";

// Quality & Inventory
import { QualityDashboard } from "./pages/quality/QualityDashboard";
import { InventoryDashboard } from "./pages/inventory/InventoryDashboard";

// Cross-Functional
import { Batch360Traceability } from "./pages/traceability/Batch360Traceability";
import { CostingAnalytics } from "./pages/costing/CostingAnalytics";
import { RCACAPAWizard } from "./pages/rca/RCACAPAWizard";
import { LabourTrainingMatrix } from "./pages/labour/LabourTrainingMatrix";
import { PurchasingSupplierHub } from "./pages/purchasing/PurchasingSupplierHub";
import { DocumentSOPLibrary } from "./pages/documents/DocumentSOPLibrary";
import { ReportsCenter } from "./pages/reports/ReportsCenter";
import { MobileShopFloorHub } from "./pages/shopfloor/MobileShopFloorHub";

function RoleProtectedRoute({ children, module }) {
  const { currentRole, canAccessModule } = useRole();

  if (!canAccessModule(module)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px", textAlign: "center", gap: "20px" }}>
        <div style={{ padding: "16px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
          <AlertOctagon size={48} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>Access Restricted</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px", maxWidth: "480px", lineHeight: 1.5 }}>
            Your simulated role perspective (<strong>{currentRole.label}</strong>) does not hold security clearance for the <strong style={{ color: "#38BDF8" }}>{module.toUpperCase()}</strong> module.
          </p>
        </div>
        <div style={{ padding: "14px 18px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-muted)", maxWidth: "440px" }}>
          To view this dashboard, please switch to a role with higher permission level (e.g. <strong>Plant Manager</strong> or <strong>Executive</strong>) using the switcher in the header above.
        </div>
      </div>
    );
  }

  return children;
}

function AppContent() {
  const { isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/command-center" replace />} />
          
          {/* Dashboards */}
          <Route path="/command-center" element={<RoleProtectedRoute module="dashboards"><CommandCenter /></RoleProtectedRoute>} />
          <Route path="/oee-performance" element={<RoleProtectedRoute module="dashboards"><OEEPerformance /></RoleProtectedRoute>} />
          <Route path="/kpi-analytics" element={<RoleProtectedRoute module="dashboards"><KPIAnalytics /></RoleProtectedRoute>} />
          <Route path="/ai-analytics" element={<RoleProtectedRoute module="dashboards"><AIAnalytics /></RoleProtectedRoute>} />
          <Route path="/exception-control-tower" element={<RoleProtectedRoute module="dashboards"><ExceptionControlTower /></RoleProtectedRoute>} />

          {/* CMMS / Maintenance */}
          <Route path="/maintenance" element={<RoleProtectedRoute module="cmms"><MaintenanceDashboard /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets" element={<RoleProtectedRoute module="cmms"><AssetList /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets/:id" element={<RoleProtectedRoute module="cmms"><Asset360 /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders" element={<RoleProtectedRoute module="cmms"><WorkOrderList /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders/new" element={<RoleProtectedRoute module="cmms"><CreateWorkOrder /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders/:id" element={<RoleProtectedRoute module="cmms"><WorkOrderDetail /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-schedules" element={<RoleProtectedRoute module="cmms"><PMScheduleList /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-checklists" element={<RoleProtectedRoute module="cmms"><PMChecklistList /></RoleProtectedRoute>} />
          <Route path="/maintenance/checklists/:id" element={<RoleProtectedRoute module="cmms"><PMChecklistExecute /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns" element={<RoleProtectedRoute module="cmms"><BreakdownList /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns/:id" element={<RoleProtectedRoute module="cmms"><BreakdownDetail /></RoleProtectedRoute>} />
          <Route path="/maintenance/troubleshooting" element={<RoleProtectedRoute module="cmms"><TroubleshootingWizard /></RoleProtectedRoute>} />
          <Route path="/maintenance/verified-solutions" element={<RoleProtectedRoute module="cmms"><VerifiedSolutions /></RoleProtectedRoute>} />
          <Route path="/maintenance/repeat-failures" element={<RoleProtectedRoute module="cmms"><RepeatFailures /></RoleProtectedRoute>} />
          <Route path="/maintenance/reliability" element={<RoleProtectedRoute module="cmms"><ReliabilityAnalytics /></RoleProtectedRoute>} />
          <Route path="/maintenance/spare-parts" element={<RoleProtectedRoute module="cmms"><SparePartsInventory /></RoleProtectedRoute>} />
          <Route path="/maintenance/calibration" element={<RoleProtectedRoute module="cmms"><CalibrationCenter /></RoleProtectedRoute>} />
          <Route path="/maintenance/failure-codes" element={<RoleProtectedRoute module="cmms"><FailureCodes /></RoleProtectedRoute>} />

          {/* Production / MES */}
          <Route path="/production" element={<RoleProtectedRoute module="production"><ProductionDashboard /></RoleProtectedRoute>} />

          {/* Planning / APS / MRP */}
          <Route path="/planning" element={<RoleProtectedRoute module="planning"><PlanningDashboard /></RoleProtectedRoute>} />

          {/* Quality / QMS */}
          <Route path="/quality" element={<RoleProtectedRoute module="quality"><QualityDashboard /></RoleProtectedRoute>} />

          {/* Inventory / WMS */}
          <Route path="/inventory" element={<RoleProtectedRoute module="inventory"><InventoryDashboard /></RoleProtectedRoute>} />

          {/* Traceability (Batch 360) */}
          <Route path="/traceability" element={<RoleProtectedRoute module="traceability"><Batch360Traceability /></RoleProtectedRoute>} />

          {/* Costing */}
          <Route path="/costing" element={<RoleProtectedRoute module="costing"><CostingAnalytics /></RoleProtectedRoute>} />

          {/* RCA / CAPA */}
          <Route path="/rca-capa" element={<RoleProtectedRoute module="rca"><RCACAPAWizard /></RoleProtectedRoute>} />

          {/* Labour & Skills */}
          <Route path="/labour" element={<RoleProtectedRoute module="labour"><LabourTrainingMatrix /></RoleProtectedRoute>} />

          {/* Purchasing */}
          <Route path="/purchasing" element={<RoleProtectedRoute module="purchasing"><PurchasingSupplierHub /></RoleProtectedRoute>} />

          {/* Documents & SOPs */}
          <Route path="/documents" element={<RoleProtectedRoute module="documents"><DocumentSOPLibrary /></RoleProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports" element={<RoleProtectedRoute module="reports"><ReportsCenter /></RoleProtectedRoute>} />

          {/* Shop Floor Mobile Mode */}
          <Route path="/shopfloor" element={<RoleProtectedRoute module="shopfloor"><MobileShopFloorHub /></RoleProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/command-center" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RoleProvider>
        <CMMSProvider>
          <ProductionProvider>
            <QualityProvider>
              <InventoryProvider>
                <ExceptionProvider>
                  <AppContent />
                </ExceptionProvider>
              </InventoryProvider>
            </QualityProvider>
          </ProductionProvider>
        </CMMSProvider>
      </RoleProvider>
    </AppProvider>
  );
}

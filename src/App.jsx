import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { RoleProvider, useRole } from "./context/RoleContext";
import { CMMSProvider } from "./context/CMMSContext";
import { ProductionProvider } from "./context/ProductionContext";
import { QualityProvider } from "./context/QualityContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ExceptionProvider } from "./context/ExceptionContext";

import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { PlaceholderPage } from "./pages/PlaceholderPage";
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

// Operator Pages
import { OperatorDashboard } from "./pages/operator/OperatorDashboard";
import { MyJobs } from "./pages/operator/MyJobs";
import { WorkInstructions } from "./pages/operator/WorkInstructions";
import { ProductionEntry } from "./pages/operator/ProductionEntry";
import { DowntimeLoss } from "./pages/operator/DowntimeLoss";
import { QualityChecks } from "./pages/operator/QualityChecks";
import { MaterialRequest } from "./pages/operator/MaterialRequest";
import { BarcodeScan } from "./pages/operator/BarcodeScan";
import { ReportIssue } from "./pages/operator/ReportIssue";
import { ShiftHandoff } from "./pages/operator/ShiftHandoff";
import { Notifications } from "./pages/operator/Notifications";
import { Profile } from "./pages/operator/Profile";

function RoleProtectedRoute({ children }) {
  const { currentRole, canAccessPath } = useRole();
  const location = useLocation();

  if (!canAccessPath(location.pathname)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "40px", textAlign: "center", gap: "20px" }}>
        <div style={{ padding: "16px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
          <AlertOctagon size={48} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>Access Restricted</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px", maxWidth: "480px", lineHeight: 1.5 }}>
            Your simulated role perspective (<strong>{currentRole.label}</strong>) does not hold security clearance for this screen or module.
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
  const { isAuthenticated, currentRole } = useRole();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={currentRole?.defaultRoute || "/command-center"} replace />} />
          
          {/* Dashboards */}
          <Route path="/command-center" element={<RoleProtectedRoute><CommandCenter /></RoleProtectedRoute>} />
          <Route path="/oee-performance" element={<RoleProtectedRoute><OEEPerformance /></RoleProtectedRoute>} />
          <Route path="/kpi-analytics" element={<RoleProtectedRoute><KPIAnalytics /></RoleProtectedRoute>} />
          <Route path="/ai-analytics" element={<RoleProtectedRoute><AIAnalytics /></RoleProtectedRoute>} />
          <Route path="/exception-control-tower" element={<RoleProtectedRoute><ExceptionControlTower /></RoleProtectedRoute>} />

          {/* CMMS / Maintenance */}
          <Route path="/maintenance" element={<RoleProtectedRoute><MaintenanceDashboard /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets" element={<RoleProtectedRoute><AssetList /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets/:id" element={<RoleProtectedRoute><Asset360 /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders" element={<RoleProtectedRoute><WorkOrderList /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders/new" element={<RoleProtectedRoute><CreateWorkOrder /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders/:id" element={<RoleProtectedRoute><WorkOrderDetail /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-schedules" element={<RoleProtectedRoute><PMScheduleList /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-checklists" element={<RoleProtectedRoute><PMChecklistList /></RoleProtectedRoute>} />
          <Route path="/maintenance/checklists/:id" element={<RoleProtectedRoute><PMChecklistExecute /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns" element={<RoleProtectedRoute><BreakdownList /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns/:id" element={<RoleProtectedRoute><BreakdownDetail /></RoleProtectedRoute>} />
          <Route path="/maintenance/troubleshooting" element={<RoleProtectedRoute><TroubleshootingWizard /></RoleProtectedRoute>} />
          <Route path="/maintenance/verified-solutions" element={<RoleProtectedRoute><VerifiedSolutions /></RoleProtectedRoute>} />
          <Route path="/maintenance/repeat-failures" element={<RoleProtectedRoute><RepeatFailures /></RoleProtectedRoute>} />
          <Route path="/maintenance/reliability" element={<RoleProtectedRoute><ReliabilityAnalytics /></RoleProtectedRoute>} />
          <Route path="/maintenance/spare-parts" element={<RoleProtectedRoute><SparePartsInventory /></RoleProtectedRoute>} />
          <Route path="/maintenance/calibration" element={<RoleProtectedRoute><CalibrationCenter /></RoleProtectedRoute>} />
          <Route path="/maintenance/failure-codes" element={<RoleProtectedRoute><FailureCodes /></RoleProtectedRoute>} />

          {/* Production / MES */}
          <Route path="/production" element={<RoleProtectedRoute><ProductionDashboard /></RoleProtectedRoute>} />

          {/* Planning / APS / MRP */}
          <Route path="/planning" element={<RoleProtectedRoute><PlanningDashboard /></RoleProtectedRoute>} />

          {/* Quality / QMS */}
          <Route path="/quality" element={<RoleProtectedRoute><QualityDashboard /></RoleProtectedRoute>} />

          {/* Inventory / WMS */}
          <Route path="/inventory" element={<RoleProtectedRoute><InventoryDashboard /></RoleProtectedRoute>} />

          {/* Traceability (Batch 360) */}
          <Route path="/traceability" element={<RoleProtectedRoute><Batch360Traceability /></RoleProtectedRoute>} />

          {/* Costing */}
          <Route path="/costing" element={<RoleProtectedRoute><CostingAnalytics /></RoleProtectedRoute>} />

          {/* RCA / CAPA */}
          <Route path="/rca-capa" element={<RoleProtectedRoute><RCACAPAWizard /></RoleProtectedRoute>} />

          {/* Labour & Skills */}
          <Route path="/labour" element={<RoleProtectedRoute><LabourTrainingMatrix /></RoleProtectedRoute>} />

          {/* Purchasing */}
          <Route path="/purchasing" element={<RoleProtectedRoute><PurchasingSupplierHub /></RoleProtectedRoute>} />

          {/* Documents & SOPs */}
          <Route path="/documents" element={<RoleProtectedRoute><DocumentSOPLibrary /></RoleProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports" element={<RoleProtectedRoute><ReportsCenter /></RoleProtectedRoute>} />

          {/* Shop Floor Mobile Mode */}
          <Route path="/shopfloor" element={<RoleProtectedRoute><MobileShopFloorHub /></RoleProtectedRoute>} />

          {/* Operator Routes */}
          <Route path="/operator/dashboard" element={<RoleProtectedRoute><OperatorDashboard /></RoleProtectedRoute>} />
          <Route path="/operator/my-jobs" element={<RoleProtectedRoute><MyJobs /></RoleProtectedRoute>} />
          <Route path="/operator/work-instructions" element={<RoleProtectedRoute><WorkInstructions /></RoleProtectedRoute>} />
          <Route path="/operator/production-entry" element={<RoleProtectedRoute><ProductionEntry /></RoleProtectedRoute>} />
          <Route path="/operator/downtime-loss" element={<RoleProtectedRoute><DowntimeLoss /></RoleProtectedRoute>} />
          <Route path="/operator/quality-checks" element={<RoleProtectedRoute><QualityChecks /></RoleProtectedRoute>} />
          <Route path="/operator/material-request" element={<RoleProtectedRoute><MaterialRequest /></RoleProtectedRoute>} />
          <Route path="/operator/barcode-scan" element={<RoleProtectedRoute><BarcodeScan /></RoleProtectedRoute>} />
          <Route path="/operator/report-issue" element={<RoleProtectedRoute><ReportIssue /></RoleProtectedRoute>} />
          <Route path="/operator/shift-handoff" element={<RoleProtectedRoute><ShiftHandoff /></RoleProtectedRoute>} />
          <Route path="/operator/notifications" element={<RoleProtectedRoute><Notifications /></RoleProtectedRoute>} />
          <Route path="/operator/profile" element={<RoleProtectedRoute><Profile /></RoleProtectedRoute>} />

          {/* Missing / Placeholder Routes */}
          <Route path="/production/line-dashboard" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/production/shift-report" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/production/shift-plan" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/production/operations-dashboard" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/executive/portfolio" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/admin/console" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/admin/users" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/admin/roles" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/admin/config" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/admin/devices" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
          <Route path="/engineering/dashboard" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={currentRole?.defaultRoute || "/command-center"} replace />} />
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

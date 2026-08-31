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

// Line Lead Pages
import { LineLeadDashboard } from "./pages/linelead/LineLeadDashboard";
import { HBManagement } from "./pages/linelead/HBManagement";
import { ProductionOrders } from "./pages/linelead/ProductionOrders";
import { LineSchedule } from "./pages/linelead/LineSchedule";
import { DowntimeLoss as LineLeadDowntimeLoss } from "./pages/linelead/DowntimeLoss";
import { Changeover } from "./pages/linelead/Changeover";
import { Staffing } from "./pages/linelead/Staffing";
import { ProductionPerformance } from "./pages/linelead/ProductionPerformance";
import { QualityEvents } from "./pages/linelead/QualityEvents";
import { MaterialStatus } from "./pages/linelead/MaterialStatus";
import { MaintenanceIssues } from "./pages/linelead/MaintenanceIssues";
import { RecoveryManagement } from "./pages/linelead/RecoveryManagement";
import { Escalations } from "./pages/linelead/Escalations";
import { ShiftHandoff as LineLeadShiftHandoff } from "./pages/linelead/ShiftHandoff";
import { Notifications as LineLeadNotifications } from "./pages/linelead/Notifications";
import { Profile as LineLeadProfile } from "./pages/linelead/Profile";

// Supervisor Pages
import { SupervisorDashboard } from "./pages/supervisor/SupervisorDashboard";
import { DeptSchedule as SupervisorDeptSchedule } from "./pages/supervisor/DeptSchedule";
import { HBManagement as SupervisorHBManagement } from "./pages/supervisor/HBManagement";
import { ProductionOrders as SupervisorProductionOrders } from "./pages/supervisor/ProductionOrders";
import { Batches as SupervisorBatches } from "./pages/supervisor/Batches";
import { ProductionPerformance as SupervisorProductionPerformance } from "./pages/supervisor/ProductionPerformance";
import { DowntimeLoss as SupervisorDowntimeLoss } from "./pages/supervisor/DowntimeLoss";
import { Workforce as SupervisorWorkforce } from "./pages/supervisor/Workforce";
import { Staffing as SupervisorStaffing } from "./pages/supervisor/Staffing";
import { LabourTime as SupervisorLabourTime } from "./pages/supervisor/LabourTime";
import { SkillsTraining as SupervisorSkillsTraining } from "./pages/supervisor/SkillsTraining";
import { QualityStatus as SupervisorQualityStatus } from "./pages/supervisor/QualityStatus";
import { Holds as SupervisorHolds } from "./pages/supervisor/Holds";
import { QualityEvents as SupervisorQualityEvents } from "./pages/supervisor/QualityEvents";
import { Recovery as SupervisorRecovery } from "./pages/supervisor/Recovery";
import { ShiftHandoff as SupervisorShiftHandoff } from "./pages/supervisor/ShiftHandoff";
import { Approvals as SupervisorApprovals } from "./pages/supervisor/Approvals";
import { Exceptions as SupervisorExceptions } from "./pages/supervisor/Exceptions";
import { Reports as SupervisorReports } from "./pages/supervisor/Reports";
import { Notifications as SupervisorNotifications } from "./pages/supervisor/Notifications";
import { Profile as SupervisorProfile } from "./pages/supervisor/Profile";

// Planner Pages
import { PlannerDashboard } from "./pages/planner/PlannerDashboard";
import { CustomerOrders as PlannerCustomerOrders } from "./pages/planner/demand/CustomerOrders";
import { OrderStatus as PlannerOrderStatus } from "./pages/planner/demand/OrderStatus";
import { ShipmentsDemand as PlannerShipmentsDemand } from "./pages/planner/demand/ShipmentsDemand";
import { DemandHistory as PlannerDemandHistory } from "./pages/planner/forecast/DemandHistory";
import { ForecastRun as PlannerForecastRun } from "./pages/planner/forecast/ForecastRun";
import { ForecastOverrides as PlannerForecastOverrides } from "./pages/planner/forecast/ForecastOverrides";
import { PromotionsUplift as PlannerPromotionsUplift } from "./pages/planner/forecast/PromotionsUplift";
import { NetRequirements as PlannerNetRequirements } from "./pages/planner/mrp/NetRequirements";
import { MaterialShortages as PlannerMaterialShortages } from "./pages/planner/mrp/MaterialShortages";
import { SafetyStock as PlannerSafetyStock } from "./pages/planner/mrp/SafetyStock";
import { SupplyDemand as PlannerSupplyDemand } from "./pages/planner/mrp/SupplyDemand";
import { ServiceRisk as PlannerServiceRisk } from "./pages/planner/mrp/ServiceRisk";
import { CapacityPlanning as PlannerCapacityPlanning } from "./pages/planner/aps/CapacityPlanning";
import { APSScheduler as PlannerAPSScheduler } from "./pages/planner/aps/APSScheduler";
import { WorkCenterCapacity as PlannerWorkCenterCapacity } from "./pages/planner/aps/WorkCenterCapacity";
import { Changeovers as PlannerChangeovers } from "./pages/planner/aps/Changeovers";
import { ScheduleVersions as PlannerScheduleVersions } from "./pages/planner/aps/ScheduleVersions";
import { ScheduleValidation as PlannerScheduleValidation } from "./pages/planner/aps/ScheduleValidation";
import { PublishSchedule as PlannerPublishSchedule } from "./pages/planner/aps/PublishSchedule";
import { ProductionOrders as PlannerProductionOrders } from "./pages/planner/ProductionOrders";
import { MaterialReservation as PlannerMaterialReservation } from "./pages/planner/MaterialReservation";
import { PlanningReports as PlannerPlanningReports } from "./pages/planner/PlanningReports";
import { AIPlanningAssistant as PlannerAIPlanningAssistant } from "./pages/planner/AIPlanningAssistant";
import { Notifications as PlannerNotifications } from "./pages/planner/Notifications";
import { Profile as PlannerProfile } from "./pages/planner/Profile";

// Warehouse Pages
import { WarehouseDashboard } from "./pages/warehouse/WarehouseDashboard";
import { IncomingDeliveries as WarehouseIncomingDeliveries } from "./pages/warehouse/receiving/IncomingDeliveries";
import { ReceiveMaterial as WarehouseReceiveMaterial } from "./pages/warehouse/receiving/ReceiveMaterial";
import { BarcodeScan as WarehouseBarcodeScan } from "./pages/warehouse/receiving/BarcodeScan";
import { RawMaterials as WarehouseRawMaterials } from "./pages/warehouse/inventory/RawMaterials";
import { PackagingMaterials as WarehousePackagingMaterials } from "./pages/warehouse/inventory/PackagingMaterials";
import { FinishedGoods as WarehouseFinishedGoods } from "./pages/warehouse/inventory/FinishedGoods";
import { Lots as WarehouseLots } from "./pages/warehouse/inventory/Lots";
import { InventoryStatus as WarehouseInventoryStatus } from "./pages/warehouse/inventory/InventoryStatus";
import { WarehousesList as WarehouseList } from "./pages/warehouse/locations/WarehousesList";
import { BinsRacks as WarehouseBinsRacks } from "./pages/warehouse/locations/BinsRacks";
import { Staging as WarehouseStaging } from "./pages/warehouse/locations/Staging";
import { LocationTransfers as WarehouseLocationTransfers } from "./pages/warehouse/locations/LocationTransfers";
import { MaterialMovements as WarehouseMaterialMovements } from "./pages/warehouse/ops/MaterialMovements";
import { Transfers as WarehouseTransfers } from "./pages/warehouse/ops/Transfers";
import { CycleCounts as WarehouseCycleCounts } from "./pages/warehouse/ops/CycleCounts";
import { Adjustments as WarehouseAdjustments } from "./pages/warehouse/ops/Adjustments";
import { PickLists as WarehousePickLists } from "./pages/warehouse/picking/PickLists";
import { PickingExecution as WarehousePickingExecution } from "./pages/warehouse/picking/PickingExecution";
import { PalletsContainers as WarehousePalletsContainers } from "./pages/warehouse/PalletsContainers";
import { ShipmentOrders as WarehouseShipmentOrders } from "./pages/warehouse/shipping/ShipmentOrders";
import { Dispatch as WarehouseDispatch } from "./pages/warehouse/shipping/Dispatch";
import { ShipmentTracking as WarehouseShipmentTracking } from "./pages/warehouse/shipping/ShipmentTracking";
import { Traceability as WarehouseTraceability } from "./pages/warehouse/Traceability";
import { Reports as WarehouseReports } from "./pages/warehouse/Reports";
import { Notifications as WarehouseNotifications } from "./pages/warehouse/Notifications";
import { Profile as WarehouseProfile } from "./pages/warehouse/Profile";

// Quality Pages
import { QualityDashboard } from "./pages/quality/QualityDashboard";
import { PreOpChecklist as QualityPreOpChecklist } from "./pages/quality/sanitation/PreOpChecklist";
import { SanitationChecklist as QualitySanitationChecklist } from "./pages/quality/sanitation/SanitationChecklist";
import { AllergenChecks as QualityAllergenChecks } from "./pages/quality/sanitation/AllergenChecks";
import { LineReadiness as QualityLineReadiness } from "./pages/quality/sanitation/LineReadiness";
import { CleaningVerification as QualityCleaningVerification } from "./pages/quality/sanitation/CleaningVerification";
import { CCPChecks as QualityCCPChecks } from "./pages/quality/checks/CCPChecks";
import { ProcessChecks as QualityProcessChecks } from "./pages/quality/checks/ProcessChecks";
import { ProductChecks as QualityProductChecks } from "./pages/quality/checks/ProductChecks";
import { QualitySpecifications as QualitySpecifications } from "./pages/quality/checks/QualitySpecifications";
import { Deviations as QualityDeviations } from "./pages/quality/events/Deviations";
import { NonConformance as QualityNonConformance } from "./pages/quality/events/NonConformance";
import { QualityHolds as QualityHolds } from "./pages/quality/events/QualityHolds";
import { Investigations as QualityInvestigations } from "./pages/quality/events/Investigations";
import { BatchReview as QualityBatchReview } from "./pages/quality/batch/BatchReview";
import { BatchHistory as QualityBatchHistory } from "./pages/quality/batch/BatchHistory";
import { QualityRecords as QualityQualityRecords } from "./pages/quality/batch/QualityRecords";
import { ReleaseQueue as QualityReleaseQueue } from "./pages/quality/release/ReleaseQueue";
import { ReleaseReview as QualityReleaseReview } from "./pages/quality/release/ReleaseReview";
import { ApprovedReleases as QualityApprovedReleases } from "./pages/quality/release/ApprovedReleases";
import { BlockedBatches as QualityBlockedBatches } from "./pages/quality/release/BlockedBatches";
import { DispositionRelease as QualityDispositionRelease } from "./pages/quality/disposition/DispositionRelease";
import { Rework as QualityRework } from "./pages/quality/disposition/Rework";
import { Reject as QualityReject } from "./pages/quality/disposition/Reject";
import { Downgrade as QualityDowngrade } from "./pages/quality/disposition/Downgrade";
import { RCACAPA as QualityRCACAPAPage } from "./pages/quality/RCACAPA";
import { AuditTrail as QualityAuditTrail } from "./pages/quality/AuditTrail";
import { Reports as QualityReports } from "./pages/quality/Reports";
import { Notifications as QualityNotifications } from "./pages/quality/Notifications";
import { Profile as QualityProfile } from "./pages/quality/Profile";

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

          {/* Line Lead Routes */}
          <Route path="/linelead/dashboard" element={<RoleProtectedRoute><LineLeadDashboard /></RoleProtectedRoute>} />
          <Route path="/linelead/hb-management" element={<RoleProtectedRoute><HBManagement /></RoleProtectedRoute>} />
          <Route path="/linelead/production-orders" element={<RoleProtectedRoute><ProductionOrders /></RoleProtectedRoute>} />
          <Route path="/linelead/line-schedule" element={<RoleProtectedRoute><LineSchedule /></RoleProtectedRoute>} />
          <Route path="/linelead/downtime-loss" element={<RoleProtectedRoute><LineLeadDowntimeLoss /></RoleProtectedRoute>} />
          <Route path="/linelead/changeover" element={<RoleProtectedRoute><Changeover /></RoleProtectedRoute>} />
          <Route path="/linelead/staffing" element={<RoleProtectedRoute><Staffing /></RoleProtectedRoute>} />
          <Route path="/linelead/production-performance" element={<RoleProtectedRoute><ProductionPerformance /></RoleProtectedRoute>} />
          <Route path="/linelead/quality-events" element={<RoleProtectedRoute><QualityEvents /></RoleProtectedRoute>} />
          <Route path="/linelead/material-status" element={<RoleProtectedRoute><MaterialStatus /></RoleProtectedRoute>} />
          <Route path="/linelead/maintenance-issues" element={<RoleProtectedRoute><MaintenanceIssues /></RoleProtectedRoute>} />
          <Route path="/linelead/recovery-management" element={<RoleProtectedRoute><RecoveryManagement /></RoleProtectedRoute>} />
          <Route path="/linelead/escalations" element={<RoleProtectedRoute><Escalations /></RoleProtectedRoute>} />
          <Route path="/linelead/shift-handoff" element={<RoleProtectedRoute><LineLeadShiftHandoff /></RoleProtectedRoute>} />
          <Route path="/linelead/notifications" element={<RoleProtectedRoute><LineLeadNotifications /></RoleProtectedRoute>} />
          <Route path="/linelead/profile" element={<RoleProtectedRoute><LineLeadProfile /></RoleProtectedRoute>} />

          {/* Supervisor Routes */}
          <Route path="/supervisor/dashboard" element={<RoleProtectedRoute><SupervisorDashboard /></RoleProtectedRoute>} />
          <Route path="/supervisor/dept-schedule" element={<RoleProtectedRoute><SupervisorDeptSchedule /></RoleProtectedRoute>} />
          <Route path="/supervisor/hb-management" element={<RoleProtectedRoute><SupervisorHBManagement /></RoleProtectedRoute>} />
          <Route path="/supervisor/production/orders" element={<RoleProtectedRoute><SupervisorProductionOrders /></RoleProtectedRoute>} />
          <Route path="/supervisor/production/batches" element={<RoleProtectedRoute><SupervisorBatches /></RoleProtectedRoute>} />
          <Route path="/supervisor/production/performance" element={<RoleProtectedRoute><SupervisorProductionPerformance /></RoleProtectedRoute>} />
          <Route path="/supervisor/production/downtime-loss" element={<RoleProtectedRoute><SupervisorDowntimeLoss /></RoleProtectedRoute>} />
          <Route path="/supervisor/labour/workforce" element={<RoleProtectedRoute><SupervisorWorkforce /></RoleProtectedRoute>} />
          <Route path="/supervisor/labour/staffing" element={<RoleProtectedRoute><SupervisorStaffing /></RoleProtectedRoute>} />
          <Route path="/supervisor/labour/time" element={<RoleProtectedRoute><SupervisorLabourTime /></RoleProtectedRoute>} />
          <Route path="/supervisor/labour/skills" element={<RoleProtectedRoute><SupervisorSkillsTraining /></RoleProtectedRoute>} />
          <Route path="/supervisor/quality/status" element={<RoleProtectedRoute><SupervisorQualityStatus /></RoleProtectedRoute>} />
          <Route path="/supervisor/quality/holds" element={<RoleProtectedRoute><SupervisorHolds /></RoleProtectedRoute>} />
          <Route path="/supervisor/quality/events" element={<RoleProtectedRoute><SupervisorQualityEvents /></RoleProtectedRoute>} />
          <Route path="/supervisor/recovery" element={<RoleProtectedRoute><SupervisorRecovery /></RoleProtectedRoute>} />
          <Route path="/supervisor/shift-handoff" element={<RoleProtectedRoute><SupervisorShiftHandoff /></RoleProtectedRoute>} />
          <Route path="/supervisor/approvals" element={<RoleProtectedRoute><SupervisorApprovals /></RoleProtectedRoute>} />
          <Route path="/supervisor/exceptions" element={<RoleProtectedRoute><SupervisorExceptions /></RoleProtectedRoute>} />
          <Route path="/supervisor/reports" element={<RoleProtectedRoute><SupervisorReports /></RoleProtectedRoute>} />
          <Route path="/supervisor/notifications" element={<RoleProtectedRoute><SupervisorNotifications /></RoleProtectedRoute>} />
          <Route path="/supervisor/profile" element={<RoleProtectedRoute><SupervisorProfile /></RoleProtectedRoute>} />

          {/* Planner Routes */}
          <Route path="/planner/dashboard" element={<RoleProtectedRoute><PlannerDashboard /></RoleProtectedRoute>} />
          <Route path="/planner/demand/customer-orders" element={<RoleProtectedRoute><PlannerCustomerOrders /></RoleProtectedRoute>} />
          <Route path="/planner/demand/order-status" element={<RoleProtectedRoute><PlannerOrderStatus /></RoleProtectedRoute>} />
          <Route path="/planner/demand/shipments" element={<RoleProtectedRoute><PlannerShipmentsDemand /></RoleProtectedRoute>} />
          <Route path="/planner/forecast/history" element={<RoleProtectedRoute><PlannerDemandHistory /></RoleProtectedRoute>} />
          <Route path="/planner/forecast/run" element={<RoleProtectedRoute><PlannerForecastRun /></RoleProtectedRoute>} />
          <Route path="/planner/forecast/overrides" element={<RoleProtectedRoute><PlannerForecastOverrides /></RoleProtectedRoute>} />
          <Route path="/planner/forecast/promotions" element={<RoleProtectedRoute><PlannerPromotionsUplift /></RoleProtectedRoute>} />
          <Route path="/planner/mrp/net-requirements" element={<RoleProtectedRoute><PlannerNetRequirements /></RoleProtectedRoute>} />
          <Route path="/planner/mrp/shortages" element={<RoleProtectedRoute><PlannerMaterialShortages /></RoleProtectedRoute>} />
          <Route path="/planner/mrp/safety-stock" element={<RoleProtectedRoute><PlannerSafetyStock /></RoleProtectedRoute>} />
          <Route path="/planner/mrp/supply-demand" element={<RoleProtectedRoute><PlannerSupplyDemand /></RoleProtectedRoute>} />
          <Route path="/planner/mrp/service-risk" element={<RoleProtectedRoute><PlannerServiceRisk /></RoleProtectedRoute>} />
          <Route path="/planner/aps/capacity" element={<RoleProtectedRoute><PlannerCapacityPlanning /></RoleProtectedRoute>} />
          <Route path="/planner/aps/scheduler" element={<RoleProtectedRoute><PlannerAPSScheduler /></RoleProtectedRoute>} />
          <Route path="/planner/aps/work-centers" element={<RoleProtectedRoute><PlannerWorkCenterCapacity /></RoleProtectedRoute>} />
          <Route path="/planner/aps/changeovers" element={<RoleProtectedRoute><PlannerChangeovers /></RoleProtectedRoute>} />
          <Route path="/planner/aps/versions" element={<RoleProtectedRoute><PlannerScheduleVersions /></RoleProtectedRoute>} />
          <Route path="/planner/aps/validation" element={<RoleProtectedRoute><PlannerScheduleValidation /></RoleProtectedRoute>} />
          <Route path="/planner/aps/publish" element={<RoleProtectedRoute><PlannerPublishSchedule /></RoleProtectedRoute>} />
          <Route path="/planner/production-orders" element={<RoleProtectedRoute><PlannerProductionOrders /></RoleProtectedRoute>} />
          <Route path="/planner/material-reservation" element={<RoleProtectedRoute><PlannerMaterialReservation /></RoleProtectedRoute>} />
          <Route path="/planner/planning-reports" element={<RoleProtectedRoute><PlannerPlanningReports /></RoleProtectedRoute>} />
          <Route path="/planner/ai-assistant" element={<RoleProtectedRoute><PlannerAIPlanningAssistant /></RoleProtectedRoute>} />
          <Route path="/planner/notifications" element={<RoleProtectedRoute><PlannerNotifications /></RoleProtectedRoute>} />
          <Route path="/planner/profile" element={<RoleProtectedRoute><PlannerProfile /></RoleProtectedRoute>} />

          {/* Warehouse Routes */}
          <Route path="/warehouse/dashboard" element={<RoleProtectedRoute><WarehouseDashboard /></RoleProtectedRoute>} />
          <Route path="/warehouse/receiving/incoming" element={<RoleProtectedRoute><WarehouseIncomingDeliveries /></RoleProtectedRoute>} />
          <Route path="/warehouse/receiving/receive" element={<RoleProtectedRoute><WarehouseReceiveMaterial /></RoleProtectedRoute>} />
          <Route path="/warehouse/receiving/scan" element={<RoleProtectedRoute><WarehouseBarcodeScan /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory/raw" element={<RoleProtectedRoute><WarehouseRawMaterials /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory/packaging" element={<RoleProtectedRoute><WarehousePackagingMaterials /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory/finished-goods" element={<RoleProtectedRoute><WarehouseFinishedGoods /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory/lots" element={<RoleProtectedRoute><WarehouseLots /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory/status" element={<RoleProtectedRoute><WarehouseInventoryStatus /></RoleProtectedRoute>} />
          <Route path="/warehouse/locations/list" element={<RoleProtectedRoute><WarehouseList /></RoleProtectedRoute>} />
          <Route path="/warehouse/locations/bins" element={<RoleProtectedRoute><WarehouseBinsRacks /></RoleProtectedRoute>} />
          <Route path="/warehouse/locations/staging" element={<RoleProtectedRoute><WarehouseStaging /></RoleProtectedRoute>} />
          <Route path="/warehouse/locations/transfers" element={<RoleProtectedRoute><WarehouseLocationTransfers /></RoleProtectedRoute>} />
          <Route path="/warehouse/ops/movements" element={<RoleProtectedRoute><WarehouseMaterialMovements /></RoleProtectedRoute>} />
          <Route path="/warehouse/ops/transfers" element={<RoleProtectedRoute><WarehouseTransfers /></RoleProtectedRoute>} />
          <Route path="/warehouse/ops/cycle-counts" element={<RoleProtectedRoute><WarehouseCycleCounts /></RoleProtectedRoute>} />
          <Route path="/warehouse/ops/adjustments" element={<RoleProtectedRoute><WarehouseAdjustments /></RoleProtectedRoute>} />
          <Route path="/warehouse/picking/lists" element={<RoleProtectedRoute><WarehousePickLists /></RoleProtectedRoute>} />
          <Route path="/warehouse/picking/execution" element={<RoleProtectedRoute><WarehousePickingExecution /></RoleProtectedRoute>} />
          <Route path="/warehouse/pallets-containers" element={<RoleProtectedRoute><WarehousePalletsContainers /></RoleProtectedRoute>} />
          <Route path="/warehouse/shipping/orders" element={<RoleProtectedRoute><WarehouseShipmentOrders /></RoleProtectedRoute>} />
          <Route path="/warehouse/shipping/dispatch" element={<RoleProtectedRoute><WarehouseDispatch /></RoleProtectedRoute>} />
          <Route path="/warehouse/shipping/tracking" element={<RoleProtectedRoute><WarehouseShipmentTracking /></RoleProtectedRoute>} />
          <Route path="/warehouse/traceability" element={<RoleProtectedRoute><WarehouseTraceability /></RoleProtectedRoute>} />
          <Route path="/warehouse/reports" element={<RoleProtectedRoute><WarehouseReports /></RoleProtectedRoute>} />
          <Route path="/warehouse/notifications" element={<RoleProtectedRoute><WarehouseNotifications /></RoleProtectedRoute>} />
          <Route path="/warehouse/profile" element={<RoleProtectedRoute><WarehouseProfile /></RoleProtectedRoute>} />

          {/* Quality Routes */}
          <Route path="/quality/dashboard" element={<RoleProtectedRoute><QualityDashboard /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/preop" element={<RoleProtectedRoute><QualityPreOpChecklist /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/checklist" element={<RoleProtectedRoute><QualitySanitationChecklist /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/allergen" element={<RoleProtectedRoute><QualityAllergenChecks /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/readiness" element={<RoleProtectedRoute><QualityLineReadiness /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/verification" element={<RoleProtectedRoute><QualityCleaningVerification /></RoleProtectedRoute>} />
          <Route path="/quality/checks/ccp" element={<RoleProtectedRoute><QualityCCPChecks /></RoleProtectedRoute>} />
          <Route path="/quality/checks/process" element={<RoleProtectedRoute><QualityProcessChecks /></RoleProtectedRoute>} />
          <Route path="/quality/checks/product" element={<RoleProtectedRoute><QualityProductChecks /></RoleProtectedRoute>} />
          <Route path="/quality/checks/specs" element={<RoleProtectedRoute><QualitySpecifications /></RoleProtectedRoute>} />
          <Route path="/quality/events/deviations" element={<RoleProtectedRoute><QualityDeviations /></RoleProtectedRoute>} />
          <Route path="/quality/events/nonconformance" element={<RoleProtectedRoute><QualityNonConformance /></RoleProtectedRoute>} />
          <Route path="/quality/events/holds" element={<RoleProtectedRoute><QualityHolds /></RoleProtectedRoute>} />
          <Route path="/quality/events/investigations" element={<RoleProtectedRoute><QualityInvestigations /></RoleProtectedRoute>} />
          <Route path="/quality/batch/review" element={<RoleProtectedRoute><QualityBatchReview /></RoleProtectedRoute>} />
          <Route path="/quality/batch/history" element={<RoleProtectedRoute><QualityBatchHistory /></RoleProtectedRoute>} />
          <Route path="/quality/batch/records" element={<RoleProtectedRoute><QualityQualityRecords /></RoleProtectedRoute>} />
          <Route path="/quality/release/queue" element={<RoleProtectedRoute><QualityReleaseQueue /></RoleProtectedRoute>} />
          <Route path="/quality/release/review" element={<RoleProtectedRoute><QualityReleaseReview /></RoleProtectedRoute>} />
          <Route path="/quality/release/approved" element={<RoleProtectedRoute><QualityApprovedReleases /></RoleProtectedRoute>} />
          <Route path="/quality/release/blocked" element={<RoleProtectedRoute><QualityBlockedBatches /></RoleProtectedRoute>} />
          <Route path="/quality/disposition/release" element={<RoleProtectedRoute><QualityDispositionRelease /></RoleProtectedRoute>} />
          <Route path="/quality/disposition/rework" element={<RoleProtectedRoute><QualityRework /></RoleProtectedRoute>} />
          <Route path="/quality/disposition/reject" element={<RoleProtectedRoute><QualityReject /></RoleProtectedRoute>} />
          <Route path="/quality/disposition/downgrade" element={<RoleProtectedRoute><QualityDowngrade /></RoleProtectedRoute>} />
          <Route path="/quality/rca-capa" element={<RoleProtectedRoute><QualityRCACAPAPage /></RoleProtectedRoute>} />
          <Route path="/quality/audit-trail" element={<RoleProtectedRoute><QualityAuditTrail /></RoleProtectedRoute>} />
          <Route path="/quality/reports" element={<RoleProtectedRoute><QualityReports /></RoleProtectedRoute>} />
          <Route path="/quality/notifications" element={<RoleProtectedRoute><QualityNotifications /></RoleProtectedRoute>} />
          <Route path="/quality/profile" element={<RoleProtectedRoute><QualityProfile /></RoleProtectedRoute>} />

          {/* Missing / Placeholder Routes */}
          <Route path="/production/shift-plan" element={<RoleProtectedRoute><PlaceholderPage /></RoleProtectedRoute>} />
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

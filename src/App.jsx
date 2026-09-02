import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { RoleProvider, useRole } from "./context/RoleContext";
import { CMMSProvider } from "./context/CMMSContext";
import { ProductionProvider } from "./context/ProductionContext";
import { QualityProvider } from "./context/QualityContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ExceptionProvider } from "./context/ExceptionContext";
import { AdminProvider } from "./context/AdminContext";
import { MasterDataProvider } from "./context/MasterDataContext";
import { PlanningProvider } from "./context/PlanningContext";

import { AppLayout } from "./components/layout/AppLayout";
import { Login } from "./pages/auth/Login";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { AlertOctagon } from "lucide-react";

// ==========================================
// SYSTEM ADMINISTRATOR PAGES (12 MENUS)
// ==========================================
// 1. Dashboard
import { AdminDashboard } from "./pages/admin/AdminDashboard";

// 2. User Management
import { UsersPage } from "./pages/admin/users/UsersPage";
import { UserInvitationsPage } from "./pages/admin/users/UserInvitationsPage";
import { UserStatusPage } from "./pages/admin/users/UserStatusPage";
import { UserActivityPage } from "./pages/admin/users/UserActivityPage";

// 3. Roles & Permissions
import { RolesPage } from "./pages/admin/roles/RolesPage";
import { PermissionsMatrixPage } from "./pages/admin/roles/PermissionsMatrixPage";
import { RoleMappingPage } from "./pages/admin/roles/RoleMappingPage";
import { ApprovalPermissionsPage } from "./pages/admin/roles/ApprovalPermissionsPage";

// 4. Organization
import { CompaniesPage } from "./pages/admin/organization/CompaniesPage";
import { PlantsPage } from "./pages/admin/organization/PlantsPage";
import { DepartmentsPage } from "./pages/admin/organization/DepartmentsPage";
import { LinesPage } from "./pages/admin/organization/LinesPage";
import { OrgWorkCentersPage } from "./pages/admin/organization/OrgWorkCentersPage";

// 5. Master Data
import { ItemMasterPage } from "./pages/admin/masterdata/ItemMasterPage";
import { ProductFamiliesPage } from "./pages/admin/masterdata/ProductFamiliesPage";
import { UOMPage } from "./pages/admin/masterdata/UOMPage";
import { PackagingMasterPage } from "./pages/admin/masterdata/PackagingMasterPage";
import { BOMRecipesPage } from "./pages/admin/masterdata/BOMRecipesPage";
import { RoutingsPage } from "./pages/admin/masterdata/RoutingsPage";
import { OperationsPage } from "./pages/admin/masterdata/OperationsPage";
import { WorkCentersMasterPage } from "./pages/admin/masterdata/WorkCentersMasterPage";
import { LineTargetsPage } from "./pages/admin/masterdata/LineTargetsPage";
import { ChangeoverMatrixPage } from "./pages/admin/masterdata/ChangeoverMatrixPage";
import { SanitationAllergensPage } from "./pages/admin/masterdata/SanitationAllergensPage";
import { LabourStandardsPage } from "./pages/admin/masterdata/LabourStandardsPage";
import { SkillsMasterPage } from "./pages/admin/masterdata/SkillsMasterPage";
import { QualitySpecsPage } from "./pages/admin/masterdata/QualitySpecsPage";
import { CCPLimitsPage } from "./pages/admin/masterdata/CCPLimitsPage";
import { MachineCapabilityPage } from "./pages/admin/masterdata/MachineCapabilityPage";
import { StorageResourcesPage } from "./pages/admin/masterdata/StorageResourcesPage";

// 6. Integrations
import { ERPIntegrationPage } from "./pages/admin/integrations/ERPIntegrationPage";
import { IoTIntegrationPage } from "./pages/admin/integrations/IoTIntegrationPage";
import { BarcodeIntegrationPage } from "./pages/admin/integrations/BarcodeIntegrationPage";
import { APIsIntegrationPage } from "./pages/admin/integrations/APIsIntegrationPage";

// 7. Data Health
import { MissingDataPage } from "./pages/admin/datahealth/MissingDataPage";
import { DuplicatesPage } from "./pages/admin/datahealth/DuplicatesPage";
import { InvalidReferencesPage } from "./pages/admin/datahealth/InvalidReferencesPage";
import { BrokenRelationshipsPage } from "./pages/admin/datahealth/BrokenRelationshipsPage";
import { StaleRecordsPage } from "./pages/admin/datahealth/StaleRecordsPage";
import { DataRemediationPage } from "./pages/admin/datahealth/DataRemediationPage";

// 8. Security
import { SecurityPage } from "./pages/admin/security/SecurityPage";

// 9. Configuration
import { ConfigurationPage } from "./pages/admin/config/ConfigurationPage";

// 10. Audit Logs
import { AuditLogsPage } from "./pages/admin/audit/AuditLogsPage";

// 11. Migration
import { MigrationPage } from "./pages/admin/migration/MigrationPage";

// 12. System Reports
import { SystemReportsPage } from "./pages/admin/reports/SystemReportsPage";

// ==========================================
// OPERATOR PAGES
// ==========================================
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
import { Notifications as OperatorNotifications } from "./pages/operator/Notifications";
import { Profile as OperatorProfile } from "./pages/operator/Profile";

// ==========================================
// LINE LEAD PAGES
// ==========================================
import { LineLeadDashboard } from "./pages/linelead/LineLeadDashboard";
import { HBManagement as LineLeadHBManagement } from "./pages/linelead/HBManagement";
import { ProductionOrders as LineLeadProductionOrders } from "./pages/linelead/ProductionOrders";
import { LineSchedule as LineLeadLineSchedule } from "./pages/linelead/LineSchedule";
import { DowntimeLoss as LineLeadDowntimeLoss } from "./pages/linelead/DowntimeLoss";
import { Changeover as LineLeadChangeover } from "./pages/linelead/Changeover";
import { Staffing as LineLeadStaffing } from "./pages/linelead/Staffing";
import { ProductionPerformance as LineLeadProductionPerformance } from "./pages/linelead/ProductionPerformance";
import { QualityEvents as LineLeadQualityEvents } from "./pages/linelead/QualityEvents";
import { MaterialStatus as LineLeadMaterialStatus } from "./pages/linelead/MaterialStatus";
import { MaintenanceIssues as LineLeadMaintenanceIssues } from "./pages/linelead/MaintenanceIssues";
import { RecoveryManagement as LineLeadRecoveryManagement } from "./pages/linelead/RecoveryManagement";
import { Escalations as LineLeadEscalations } from "./pages/linelead/Escalations";
import { ShiftHandoff as LineLeadShiftHandoff } from "./pages/linelead/ShiftHandoff";
import { Notifications as LineLeadNotifications } from "./pages/linelead/Notifications";
import { Profile as LineLeadProfile } from "./pages/linelead/Profile";

// ==========================================
// SUPERVISOR PAGES
// ==========================================
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

// ==========================================
// PLANNER PAGES
// ==========================================
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

// ==========================================
// WAREHOUSE PAGES
// ==========================================
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

// ==========================================
// QUALITY PAGES
// ==========================================
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

// ==========================================
// CI / ENGINEERING PAGES
// ==========================================
import { CIDashboard } from "./pages/ci/CIDashboard";
import { Investigations as CIInvestigations } from "./pages/ci/rca/Investigations";
import { Evidence as CIEvidence } from "./pages/ci/rca/Evidence";
import { HypothesisTests as CIHypothesisTests } from "./pages/ci/rca/HypothesisTests";
import { OccurrenceCause as CIOccurrenceCause } from "./pages/ci/rca/OccurrenceCause";
import { EscapeCause as CIEscapeCause } from "./pages/ci/rca/EscapeCause";
import { CorrectiveActions as CICorrectiveActions } from "./pages/ci/capa/CorrectiveActions";
import { PreventiveActions as CIPreventiveActions } from "./pages/ci/capa/PreventiveActions";
import { OwnersDueDates as CIOwnersDueDates } from "./pages/ci/capa/OwnersDueDates";
import { EffectivenessVerification as CIEffectivenessVerification } from "./pages/ci/capa/EffectivenessVerification";
import { ProductionLoss as CIProductionLoss } from "./pages/ci/loss/ProductionLoss";
import { DowntimeLoss as CIDowntimeLoss } from "./pages/ci/loss/DowntimeLoss";
import { QualityLoss as CIQualityLoss } from "./pages/ci/loss/QualityLoss";
import { YieldLoss as CIYieldLoss } from "./pages/ci/loss/YieldLoss";
import { ScrapReworkLoss as CIScrapReworkLoss } from "./pages/ci/loss/ScrapReworkLoss";
import { CIProjects as CIProjectsList } from "./pages/ci/projects/CIProjects";
import { ProjectActions as CIProjectActions } from "./pages/ci/projects/ProjectActions";
import { Savings as CISavings } from "./pages/ci/projects/Savings";
import { BenefitsVerification as CIBenefitsVerification } from "./pages/ci/projects/BenefitsVerification";
import { Standards as CIStandards } from "./pages/ci/Standards";
import { VerifiedSolutions as CIVerifiedSolutions } from "./pages/ci/VerifiedSolutions";
import { Engineering as CIEngineering } from "./pages/ci/Engineering";
import { ReliabilityInsights as CIReliabilityInsights } from "./pages/ci/ReliabilityInsights";
import { Reports as CIReports } from "./pages/ci/Reports";
import { Notifications as CINotifications } from "./pages/ci/Notifications";
import { Profile as CIProfile } from "./pages/ci/Profile";

// ==========================================
// EXECUTIVE PAGES
// ==========================================
import { ExecutiveDashboard } from "./pages/executive/ExecutiveDashboard";
import { MultiPlantKPIs as ExecMultiPlantKPIs } from "./pages/executive/enterprise/MultiPlantKPIs";
import { OEE as ExecOEE } from "./pages/executive/enterprise/OEE";
import { Production as ExecProduction } from "./pages/executive/enterprise/Production";
import { Quality as ExecQuality } from "./pages/executive/enterprise/Quality";
import { Delivery as ExecDelivery } from "./pages/executive/enterprise/Delivery";
import { ManufacturingCost as ExecManufacturingCost } from "./pages/executive/finance/ManufacturingCost";
import { CostVariance as ExecCostVariance } from "./pages/executive/finance/CostVariance";
import { MaterialCost as ExecMaterialCost } from "./pages/executive/finance/MaterialCost";
import { LabourCost as ExecLabourCost } from "./pages/executive/finance/LabourCost";
import { MachineCost as ExecMachineCost } from "./pages/executive/finance/MachineCost";
import { ScrapReworkCost as ExecScrapReworkCost } from "./pages/executive/finance/ScrapReworkCost";
import { CISavings as ExecCISavings } from "./pages/executive/finance/CISavings";
import { CustomerDemand as ExecCustomerDemand } from "./pages/executive/business/CustomerDemand";
import { ServiceLevel as ExecServiceLevel } from "./pages/executive/business/ServiceLevel";
import { ShipmentPerformance as ExecShipmentPerformance } from "./pages/executive/business/ShipmentPerformance";
import { Trends as ExecTrends } from "./pages/executive/business/Trends";
import { Risks as ExecRisks } from "./pages/executive/risk/Risks";
import { Constraints as ExecConstraints } from "./pages/executive/risk/Constraints";
import { Opportunities as ExecOpportunities } from "./pages/executive/risk/Opportunities";
import { Recovery as ExecRecovery } from "./pages/executive/risk/Recovery";
import { Briefing as ExecAIBriefing } from "./pages/executive/ai/Briefing";
import { Recommendations as ExecAIRecommendations } from "./pages/executive/ai/Recommendations";
import { Agents as ExecAIAgents } from "./pages/executive/ai/Agents";
import { Reports as ExecReports } from "./pages/executive/Reports";
import { Notifications as ExecNotifications } from "./pages/executive/Notifications";
import { Profile as ExecProfile } from "./pages/executive/Profile";

// ==========================================
// MAINTENANCE / CMMS PAGES
// ==========================================
import { MaintenanceDashboard } from "./pages/dashboards/MaintenanceDashboard";
import { AssetRegister } from "./pages/assets/AssetRegister";
import { AssetHierarchy } from "./pages/assets/AssetHierarchy";
import { Asset360Page } from "./pages/assets/Asset360Page";
import { WorkOrdersPage } from "./pages/workorders/WorkOrdersPage";
import { BreakdownLog } from "./pages/breakdowns/BreakdownLog";
import { BreakdownAnalysis } from "./pages/breakdowns/BreakdownAnalysis";
import { DowntimeImpact } from "./pages/breakdowns/DowntimeImpact";
import { PMPlans } from "./pages/pm/PMPlans";
import { PMSchedulePage } from "./pages/pm/PMSchedulePage";
import { PMExecutionPage } from "./pages/pm/PMExecutionPage";
import { PartsInventoryPage } from "./pages/spareparts/PartsInventoryPage";
import { SparePartsBOMPage } from "./pages/spareparts/SparePartsBOMPage";
import { PartsRequestsPage } from "./pages/spareparts/PartsRequestsPage";
import { CalibrationSchedulePage } from "./pages/calibration/CalibrationSchedulePage";
import { CalibrationRecordsPage } from "./pages/calibration/CalibrationRecordsPage";
import { CalibrationHistoryPage } from "./pages/calibration/CalibrationHistoryPage";
import { FailureCodesPage } from "./pages/failurecodes/FailureCodesPage";
import { TroubleshootingPage } from "./pages/troubleshooting/TroubleshootingPage";
import { ReliabilityPage } from "./pages/reliability/ReliabilityPage";
import { MachineIoTPage } from "./pages/iot/MachineIoTPage";
import { MaintenanceLabourPage } from "./pages/labour/MaintenanceLabourPage";
import { RepeatFailures } from "./pages/maintenance/RepeatFailures";
import { VerifiedSolutions as MaintenanceVerifiedSolutions } from "./pages/maintenance/VerifiedSolutions";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";

// ==========================================
// PLANT MANAGER & COMMAND CENTER PAGES
// ==========================================
import { CommandCenter } from "./pages/dashboards/CommandCenter";
import { OEEPerformance } from "./pages/dashboards/OEEPerformance";
import { KPIAnalytics } from "./pages/dashboards/KPIAnalytics";
import { AIAnalytics } from "./pages/dashboards/AIAnalytics";
import { ExceptionControlTower } from "./pages/dashboards/ExceptionControlTower";

// Other Plant Manager sub-pages
import { HBManagementPage } from "./pages/performance/HBManagementPage";
import { KPIAnalyticsPage } from "./pages/performance/KPIAnalyticsPage";
import { OEEPage } from "./pages/performance/OEEPage";
import { ProductionPerformancePage } from "./pages/performance/ProductionPerformancePage";
import { SchedulePage } from "./pages/planning/SchedulePage";
import { CapacityPage } from "./pages/planning/CapacityPage";
import { ConstraintsPage } from "./pages/planning/ConstraintsPage";
import { RecoveryPage } from "./pages/planning/RecoveryPage";
import { ProductionOrdersPage } from "./pages/production/ProductionOrdersPage";
import { ProductionDashboard } from "./pages/production/ProductionDashboard";
import { BatchesPage } from "./pages/production/BatchesPage";
import { DowntimeLossPage } from "./pages/production/DowntimeLossPage";
import { ShiftPerformancePage } from "./pages/production/ShiftPerformancePage";
import { QualityStatusPage } from "./pages/quality/QualityStatusPage";
import { HoldsPage } from "./pages/quality/HoldsPage";
import { QAReleasePage } from "./pages/quality/QAReleasePage";
import { QualityTrendsPage } from "./pages/quality/QualityTrendsPage";
import { AssetHealthPage } from "./pages/maintenance/AssetHealthPage";
import { WorkOrdersOverviewPage } from "./pages/maintenance/WorkOrdersOverviewPage";
import { BreakdownsOverviewPage } from "./pages/maintenance/BreakdownsOverviewPage";
import { ReliabilityOverviewPage } from "./pages/maintenance/ReliabilityOverviewPage";
import { StaffingPage } from "./pages/labour/StaffingPage";
import { LabourPerformancePage } from "./pages/labour/LabourPerformancePage";
import { LabourHoursPage } from "./pages/labour/LabourHoursPage";
import { WarehouseInventoryPage } from "./pages/warehouse/WarehouseInventoryPage";
import { MaterialShortagePage } from "./pages/warehouse/MaterialShortagePage";
import { FinishedGoodsPage } from "./pages/warehouse/FinishedGoodsPage";

function RoleProtectedRoute({ children }) {
  const { currentRole, canAccessPath } = useRole();
  const location = useLocation();

  if (currentRole.id === "admin") {
    return children;
  }

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
          To view this dashboard, please switch to a role with higher permission level (e.g. <strong>Plant Manager</strong> or <strong>System Administrator</strong>) using the switcher in the header above.
        </div>
      </div>
    );
  }

  return children;
}

export function AppContent() {
  const { currentRole, isAuthenticated } = useRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

        <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
          {/* Default Route redirects to current role default or /dashboard */}
          <Route path="/" element={<Navigate to={currentRole?.defaultRoute || "/dashboard"} replace />} />

          {/* ========================================================= */}
          {/* 1. SYSTEM ADMINISTRATOR ROUTES                            */}
          {/* ========================================================= */}
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* User Management */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/invitations" element={<UserInvitationsPage />} />
          <Route path="/users/status" element={<UserStatusPage />} />
          <Route path="/users/activity" element={<UserActivityPage />} />

          {/* Roles & Permissions */}
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/permissions" element={<PermissionsMatrixPage />} />
          <Route path="/roles/mapping" element={<RoleMappingPage />} />
          <Route path="/roles/approval-permissions" element={<ApprovalPermissionsPage />} />

          {/* Organization */}
          <Route path="/organization" element={<Navigate to="/organization/companies" replace />} />
          <Route path="/organization/companies" element={<CompaniesPage />} />
          <Route path="/organization/plants" element={<PlantsPage />} />
          <Route path="/organization/departments" element={<DepartmentsPage />} />
          <Route path="/organization/lines" element={<LinesPage />} />
          <Route path="/organization/work-centers" element={<OrgWorkCentersPage />} />

          {/* Master Data Suite */}
          <Route path="/master-data" element={<Navigate to="/master-data/items" replace />} />
          <Route path="/master-data/items" element={<ItemMasterPage />} />
          <Route path="/master-data/product-families" element={<ProductFamiliesPage />} />
          <Route path="/master-data/uom" element={<UOMPage />} />
          <Route path="/master-data/packaging" element={<PackagingMasterPage />} />
          <Route path="/master-data/bom" element={<BOMRecipesPage />} />
          <Route path="/master-data/routings" element={<RoutingsPage />} />
          <Route path="/master-data/operations" element={<OperationsPage />} />
          <Route path="/master-data/work-centers" element={<WorkCentersMasterPage />} />
          <Route path="/master-data/line-targets" element={<LineTargetsPage />} />
          <Route path="/master-data/changeover-matrix" element={<ChangeoverMatrixPage />} />
          <Route path="/master-data/sanitation-allergens" element={<SanitationAllergensPage />} />
          <Route path="/master-data/labour-standards" element={<LabourStandardsPage />} />
          <Route path="/master-data/skills" element={<SkillsMasterPage />} />
          <Route path="/master-data/quality-specs" element={<QualitySpecsPage />} />
          <Route path="/master-data/ccp-limits" element={<CCPLimitsPage />} />
          <Route path="/master-data/machine-capability" element={<MachineCapabilityPage />} />
          <Route path="/master-data/storage-resources" element={<StorageResourcesPage />} />

          {/* Integrations */}
          <Route path="/integrations" element={<Navigate to="/integrations/erp" replace />} />
          <Route path="/integrations/erp" element={<ERPIntegrationPage />} />
          <Route path="/integrations/iot" element={<IoTIntegrationPage />} />
          <Route path="/integrations/barcode" element={<BarcodeIntegrationPage />} />
          <Route path="/integrations/apis" element={<APIsIntegrationPage />} />

          {/* Data Health */}
          <Route path="/data-health" element={<Navigate to="/data-health/missing-data" replace />} />
          <Route path="/data-health/missing-data" element={<MissingDataPage />} />
          <Route path="/data-health/duplicates" element={<DuplicatesPage />} />
          <Route path="/data-health/invalid-references" element={<InvalidReferencesPage />} />
          <Route path="/data-health/broken-relationships" element={<BrokenRelationshipsPage />} />
          <Route path="/data-health/stale-records" element={<StaleRecordsPage />} />
          <Route path="/data-health/remediation" element={<DataRemediationPage />} />

          {/* Standalone Admin Modules */}
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/migration" element={<MigrationPage />} />
          <Route path="/system-reports" element={<SystemReportsPage />} />

          {/* Legacy Admin Links */}
          <Route path="/admin/console" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/roles" element={<RolesPage />} />
          <Route path="/admin/config" element={<ConfigurationPage />} />
          <Route path="/admin/devices" element={<IoTIntegrationPage />} />

          {/* ========================================================= */}
          {/* 2. MAINTENANCE / CMMS ROUTES                              */}
          {/* ========================================================= */}
          <Route path="/maintenance" element={<RoleProtectedRoute><MaintenanceDashboard /></RoleProtectedRoute>} />
          <Route path="/assets/register" element={<RoleProtectedRoute><AssetRegister /></RoleProtectedRoute>} />
          <Route path="/assets/hierarchy" element={<RoleProtectedRoute><AssetHierarchy /></RoleProtectedRoute>} />
          <Route path="/assets/360" element={<RoleProtectedRoute><Asset360Page /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets" element={<RoleProtectedRoute><AssetRegister /></RoleProtectedRoute>} />
          <Route path="/maintenance/assets/:id" element={<RoleProtectedRoute><Asset360Page /></RoleProtectedRoute>} />

          <Route path="/work-orders" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />
          <Route path="/work-orders/open" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />
          <Route path="/work-orders/corrective" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />
          <Route path="/work-orders/preventive" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />
          <Route path="/work-orders/completed" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders" element={<RoleProtectedRoute><WorkOrdersPage /></RoleProtectedRoute>} />

          <Route path="/breakdowns/log" element={<RoleProtectedRoute><BreakdownLog /></RoleProtectedRoute>} />
          <Route path="/breakdowns/analysis" element={<RoleProtectedRoute><BreakdownAnalysis /></RoleProtectedRoute>} />
          <Route path="/breakdowns/downtime-impact" element={<RoleProtectedRoute><DowntimeImpact /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns" element={<RoleProtectedRoute><BreakdownLog /></RoleProtectedRoute>} />

          <Route path="/pm/plans" element={<RoleProtectedRoute><PMPlans /></RoleProtectedRoute>} />
          <Route path="/pm/schedule" element={<RoleProtectedRoute><PMSchedulePage /></RoleProtectedRoute>} />
          <Route path="/pm/execution" element={<RoleProtectedRoute><PMExecutionPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-schedules" element={<RoleProtectedRoute><PMSchedulePage /></RoleProtectedRoute>} />
          <Route path="/maintenance/pm-checklists" element={<RoleProtectedRoute><PMPlans /></RoleProtectedRoute>} />

          <Route path="/spare-parts/inventory" element={<RoleProtectedRoute><PartsInventoryPage /></RoleProtectedRoute>} />
          <Route path="/spare-parts/bom" element={<RoleProtectedRoute><SparePartsBOMPage /></RoleProtectedRoute>} />
          <Route path="/spare-parts/requests" element={<RoleProtectedRoute><PartsRequestsPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/spare-parts" element={<RoleProtectedRoute><PartsInventoryPage /></RoleProtectedRoute>} />

          <Route path="/calibration/schedule" element={<RoleProtectedRoute><CalibrationSchedulePage /></RoleProtectedRoute>} />
          <Route path="/calibration/records" element={<RoleProtectedRoute><CalibrationRecordsPage /></RoleProtectedRoute>} />
          <Route path="/calibration/history" element={<RoleProtectedRoute><CalibrationHistoryPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/calibration" element={<RoleProtectedRoute><CalibrationSchedulePage /></RoleProtectedRoute>} />

          <Route path="/failure-codes" element={<RoleProtectedRoute><FailureCodesPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/failure-codes" element={<RoleProtectedRoute><FailureCodesPage /></RoleProtectedRoute>} />
          <Route path="/troubleshooting" element={<RoleProtectedRoute><TroubleshootingPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/troubleshooting" element={<RoleProtectedRoute><TroubleshootingPage /></RoleProtectedRoute>} />
          <Route path="/reliability" element={<RoleProtectedRoute><ReliabilityPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/reliability" element={<RoleProtectedRoute><ReliabilityPage /></RoleProtectedRoute>} />
          <Route path="/machine-iot" element={<RoleProtectedRoute><MachineIoTPage /></RoleProtectedRoute>} />
          <Route path="/maintenance-labour" element={<RoleProtectedRoute><MaintenanceLabourPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/repeat-failures" element={<RoleProtectedRoute><RepeatFailures /></RoleProtectedRoute>} />
          <Route path="/maintenance/verified-solutions" element={<RoleProtectedRoute><MaintenanceVerifiedSolutions /></RoleProtectedRoute>} />
          <Route path="/repeat-failures" element={<RoleProtectedRoute><RepeatFailures /></RoleProtectedRoute>} />
          <Route path="/verified-solutions" element={<RoleProtectedRoute><MaintenanceVerifiedSolutions /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* 3. PLANT MANAGER & COMMAND CENTER ROUTES                  */}
          {/* ========================================================= */}
          <Route path="/command-center" element={<RoleProtectedRoute><CommandCenter /></RoleProtectedRoute>} />
          <Route path="/oee-performance" element={<RoleProtectedRoute><OEEPerformance /></RoleProtectedRoute>} />
          <Route path="/kpi-analytics" element={<RoleProtectedRoute><KPIAnalytics /></RoleProtectedRoute>} />
          <Route path="/ai-analytics" element={<RoleProtectedRoute><AIAnalytics /></RoleProtectedRoute>} />
          <Route path="/exception-control-tower" element={<RoleProtectedRoute><ExceptionControlTower /></RoleProtectedRoute>} />

          <Route path="/performance/oee" element={<RoleProtectedRoute><OEEPage /></RoleProtectedRoute>} />
          <Route path="/performance/hb-management" element={<RoleProtectedRoute><HBManagementPage /></RoleProtectedRoute>} />
          <Route path="/performance/kpi-analytics" element={<RoleProtectedRoute><KPIAnalyticsPage /></RoleProtectedRoute>} />
          <Route path="/performance/production-performance" element={<RoleProtectedRoute><ProductionPerformancePage /></RoleProtectedRoute>} />

          <Route path="/planning/schedule" element={<RoleProtectedRoute><SchedulePage /></RoleProtectedRoute>} />
          <Route path="/planning/capacity" element={<RoleProtectedRoute><CapacityPage /></RoleProtectedRoute>} />
          <Route path="/planning/constraints" element={<RoleProtectedRoute><ConstraintsPage /></RoleProtectedRoute>} />
          <Route path="/planning/recovery" element={<RoleProtectedRoute><RecoveryPage /></RoleProtectedRoute>} />

          <Route path="/production" element={<RoleProtectedRoute><ProductionDashboard /></RoleProtectedRoute>} />
          <Route path="/production/orders" element={<RoleProtectedRoute><ProductionOrdersPage /></RoleProtectedRoute>} />
          <Route path="/production/batches" element={<RoleProtectedRoute><BatchesPage /></RoleProtectedRoute>} />
          <Route path="/production/downtime-loss" element={<RoleProtectedRoute><DowntimeLossPage /></RoleProtectedRoute>} />
          <Route path="/production/shift-performance" element={<RoleProtectedRoute><ShiftPerformancePage /></RoleProtectedRoute>} />

          <Route path="/quality" element={<RoleProtectedRoute><QualityDashboard /></RoleProtectedRoute>} />
          <Route path="/quality/dashboard" element={<RoleProtectedRoute><QualityDashboard /></RoleProtectedRoute>} />
          <Route path="/quality/checks/product" element={<RoleProtectedRoute><QualityProductChecks /></RoleProtectedRoute>} />
          <Route path="/quality/checks/ccp" element={<RoleProtectedRoute><QualityCCPChecks /></RoleProtectedRoute>} />
          <Route path="/quality/sanitation/preop" element={<RoleProtectedRoute><QualityPreOpChecklist /></RoleProtectedRoute>} />
          <Route path="/quality/events/holds" element={<RoleProtectedRoute><QualityHolds /></RoleProtectedRoute>} />
          <Route path="/quality/events/deviations" element={<RoleProtectedRoute><QualityDeviations /></RoleProtectedRoute>} />
          <Route path="/quality/events/investigations" element={<RoleProtectedRoute><QualityInvestigations /></RoleProtectedRoute>} />
          <Route path="/quality/release/queue" element={<RoleProtectedRoute><QualityReleaseQueue /></RoleProtectedRoute>} />
          <Route path="/quality/release/review" element={<RoleProtectedRoute><QualityReleaseReview /></RoleProtectedRoute>} />
          <Route path="/quality/disposition/release" element={<RoleProtectedRoute><QualityDispositionRelease /></RoleProtectedRoute>} />
          <Route path="/quality/batch/records" element={<RoleProtectedRoute><QualityQualityRecords /></RoleProtectedRoute>} />
          <Route path="/quality/status" element={<RoleProtectedRoute><QualityStatusPage /></RoleProtectedRoute>} />
          <Route path="/quality/qa-release" element={<RoleProtectedRoute><QAReleasePage /></RoleProtectedRoute>} />
          <Route path="/quality/trends" element={<RoleProtectedRoute><QualityTrendsPage /></RoleProtectedRoute>} />

          <Route path="/maintenance/asset-health" element={<RoleProtectedRoute><AssetHealthPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/work-orders-overview" element={<RoleProtectedRoute><WorkOrdersOverviewPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/breakdowns-overview" element={<RoleProtectedRoute><BreakdownsOverviewPage /></RoleProtectedRoute>} />
          <Route path="/maintenance/reliability-overview" element={<RoleProtectedRoute><ReliabilityOverviewPage /></RoleProtectedRoute>} />

          <Route path="/labour" element={<RoleProtectedRoute><StaffingPage /></RoleProtectedRoute>} />
          <Route path="/labour/staffing" element={<RoleProtectedRoute><StaffingPage /></RoleProtectedRoute>} />
          <Route path="/labour/performance" element={<RoleProtectedRoute><LabourPerformancePage /></RoleProtectedRoute>} />
          <Route path="/labour/hours" element={<RoleProtectedRoute><LabourHoursPage /></RoleProtectedRoute>} />

          <Route path="/inventory" element={<RoleProtectedRoute><WarehouseInventoryPage /></RoleProtectedRoute>} />
          <Route path="/warehouse/inventory" element={<RoleProtectedRoute><WarehouseInventoryPage /></RoleProtectedRoute>} />
          <Route path="/warehouse/material-shortage" element={<RoleProtectedRoute><MaterialShortagePage /></RoleProtectedRoute>} />
          <Route path="/warehouse/finished-goods" element={<RoleProtectedRoute><FinishedGoodsPage /></RoleProtectedRoute>} />

          <Route path="/reports" element={<RoleProtectedRoute><ReportsPage /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* 4. OPERATOR ROUTES                                        */}
          {/* ========================================================= */}
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
          <Route path="/operator/notifications" element={<RoleProtectedRoute><OperatorNotifications /></RoleProtectedRoute>} />
          <Route path="/operator/profile" element={<RoleProtectedRoute><OperatorProfile /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* 5. LINE LEAD ROUTES                                       */}
          {/* ========================================================= */}
          <Route path="/linelead/dashboard" element={<RoleProtectedRoute><LineLeadDashboard /></RoleProtectedRoute>} />
          <Route path="/linelead/hb-management" element={<RoleProtectedRoute><LineLeadHBManagement /></RoleProtectedRoute>} />
          <Route path="/linelead/production-orders" element={<RoleProtectedRoute><LineLeadProductionOrders /></RoleProtectedRoute>} />
          <Route path="/linelead/line-schedule" element={<RoleProtectedRoute><LineLeadLineSchedule /></RoleProtectedRoute>} />
          <Route path="/linelead/downtime-loss" element={<RoleProtectedRoute><LineLeadDowntimeLoss /></RoleProtectedRoute>} />
          <Route path="/linelead/changeover" element={<RoleProtectedRoute><LineLeadChangeover /></RoleProtectedRoute>} />
          <Route path="/linelead/staffing" element={<RoleProtectedRoute><LineLeadStaffing /></RoleProtectedRoute>} />
          <Route path="/linelead/production-performance" element={<RoleProtectedRoute><LineLeadProductionPerformance /></RoleProtectedRoute>} />
          <Route path="/linelead/quality-events" element={<RoleProtectedRoute><LineLeadQualityEvents /></RoleProtectedRoute>} />
          <Route path="/linelead/material-status" element={<RoleProtectedRoute><LineLeadMaterialStatus /></RoleProtectedRoute>} />
          <Route path="/linelead/maintenance-issues" element={<RoleProtectedRoute><LineLeadMaintenanceIssues /></RoleProtectedRoute>} />
          <Route path="/linelead/recovery-management" element={<RoleProtectedRoute><LineLeadRecoveryManagement /></RoleProtectedRoute>} />
          <Route path="/linelead/escalations" element={<RoleProtectedRoute><LineLeadEscalations /></RoleProtectedRoute>} />
          <Route path="/linelead/shift-handoff" element={<RoleProtectedRoute><LineLeadShiftHandoff /></RoleProtectedRoute>} />
          <Route path="/linelead/notifications" element={<RoleProtectedRoute><LineLeadNotifications /></RoleProtectedRoute>} />
          <Route path="/linelead/profile" element={<RoleProtectedRoute><LineLeadProfile /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* 6. SUPERVISOR ROUTES                                      */}
          {/* ========================================================= */}
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

          {/* ========================================================= */}
          {/* 7. PLANNER ROUTES                                         */}
          {/* ========================================================= */}
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

          {/* ========================================================= */}
          {/* 8. WAREHOUSE ROUTES                                       */}
          {/* ========================================================= */}
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

          {/* ========================================================= */}
          {/* 9. QUALITY ROUTES                                         */}
          {/* ========================================================= */}
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

          {/* ========================================================= */}
          {/* 10. CI / ENGINEERING ROUTES                               */}
          {/* ========================================================= */}
          <Route path="/ci/dashboard" element={<RoleProtectedRoute><CIDashboard /></RoleProtectedRoute>} />
          <Route path="/ci/rca/investigations" element={<RoleProtectedRoute><CIInvestigations /></RoleProtectedRoute>} />
          <Route path="/ci/rca/evidence" element={<RoleProtectedRoute><CIEvidence /></RoleProtectedRoute>} />
          <Route path="/ci/rca/hypothesis" element={<RoleProtectedRoute><CIHypothesisTests /></RoleProtectedRoute>} />
          <Route path="/ci/rca/occurrence" element={<RoleProtectedRoute><CIOccurrenceCause /></RoleProtectedRoute>} />
          <Route path="/ci/rca/escape" element={<RoleProtectedRoute><CIEscapeCause /></RoleProtectedRoute>} />
          <Route path="/ci/capa/corrective" element={<RoleProtectedRoute><CICorrectiveActions /></RoleProtectedRoute>} />
          <Route path="/ci/capa/preventive" element={<RoleProtectedRoute><CIPreventiveActions /></RoleProtectedRoute>} />
          <Route path="/ci/capa/owners" element={<RoleProtectedRoute><CIOwnersDueDates /></RoleProtectedRoute>} />
          <Route path="/ci/capa/verification" element={<RoleProtectedRoute><CIEffectivenessVerification /></RoleProtectedRoute>} />
          <Route path="/ci/loss/production" element={<RoleProtectedRoute><CIProductionLoss /></RoleProtectedRoute>} />
          <Route path="/ci/loss/downtime" element={<RoleProtectedRoute><CIDowntimeLoss /></RoleProtectedRoute>} />
          <Route path="/ci/loss/quality" element={<RoleProtectedRoute><CIQualityLoss /></RoleProtectedRoute>} />
          <Route path="/ci/loss/yield" element={<RoleProtectedRoute><CIYieldLoss /></RoleProtectedRoute>} />
          <Route path="/ci/loss/scrap" element={<RoleProtectedRoute><CIScrapReworkLoss /></RoleProtectedRoute>} />
          <Route path="/ci/projects/list" element={<RoleProtectedRoute><CIProjectsList /></RoleProtectedRoute>} />
          <Route path="/ci/projects/actions" element={<RoleProtectedRoute><CIProjectActions /></RoleProtectedRoute>} />
          <Route path="/ci/projects/savings" element={<RoleProtectedRoute><CISavings /></RoleProtectedRoute>} />
          <Route path="/ci/projects/benefits" element={<RoleProtectedRoute><CIBenefitsVerification /></RoleProtectedRoute>} />
          <Route path="/ci/standards" element={<RoleProtectedRoute><CIStandards /></RoleProtectedRoute>} />
          <Route path="/ci/verified-solutions" element={<RoleProtectedRoute><CIVerifiedSolutions /></RoleProtectedRoute>} />
          <Route path="/ci/engineering" element={<RoleProtectedRoute><CIEngineering /></RoleProtectedRoute>} />
          <Route path="/ci/reliability" element={<RoleProtectedRoute><CIReliabilityInsights /></RoleProtectedRoute>} />
          <Route path="/ci/reports" element={<RoleProtectedRoute><CIReports /></RoleProtectedRoute>} />
          <Route path="/ci/notifications" element={<RoleProtectedRoute><CINotifications /></RoleProtectedRoute>} />
          <Route path="/ci/profile" element={<RoleProtectedRoute><CIProfile /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* 11. EXECUTIVE ROUTES                                      */}
          {/* ========================================================= */}
          <Route path="/executive/dashboard" element={<RoleProtectedRoute><ExecutiveDashboard /></RoleProtectedRoute>} />
          <Route path="/executive/enterprise/kpis" element={<RoleProtectedRoute><ExecMultiPlantKPIs /></RoleProtectedRoute>} />
          <Route path="/executive/enterprise/oee" element={<RoleProtectedRoute><ExecOEE /></RoleProtectedRoute>} />
          <Route path="/executive/enterprise/production" element={<RoleProtectedRoute><ExecProduction /></RoleProtectedRoute>} />
          <Route path="/executive/enterprise/quality" element={<RoleProtectedRoute><ExecQuality /></RoleProtectedRoute>} />
          <Route path="/executive/enterprise/delivery" element={<RoleProtectedRoute><ExecDelivery /></RoleProtectedRoute>} />
          <Route path="/executive/finance/manufacturing" element={<RoleProtectedRoute><ExecManufacturingCost /></RoleProtectedRoute>} />
          <Route path="/executive/finance/variance" element={<RoleProtectedRoute><ExecCostVariance /></RoleProtectedRoute>} />
          <Route path="/executive/finance/material" element={<RoleProtectedRoute><ExecMaterialCost /></RoleProtectedRoute>} />
          <Route path="/executive/finance/labour" element={<RoleProtectedRoute><ExecLabourCost /></RoleProtectedRoute>} />
          <Route path="/executive/finance/machine" element={<RoleProtectedRoute><ExecMachineCost /></RoleProtectedRoute>} />
          <Route path="/executive/finance/scrap" element={<RoleProtectedRoute><ExecScrapReworkCost /></RoleProtectedRoute>} />
          <Route path="/executive/finance/ci-savings" element={<RoleProtectedRoute><ExecCISavings /></RoleProtectedRoute>} />
          <Route path="/executive/business/demand" element={<RoleProtectedRoute><ExecCustomerDemand /></RoleProtectedRoute>} />
          <Route path="/executive/business/service-level" element={<RoleProtectedRoute><ExecServiceLevel /></RoleProtectedRoute>} />
          <Route path="/executive/business/shipments" element={<RoleProtectedRoute><ExecShipmentPerformance /></RoleProtectedRoute>} />
          <Route path="/executive/business/trends" element={<RoleProtectedRoute><ExecTrends /></RoleProtectedRoute>} />
          <Route path="/executive/risk/risks" element={<RoleProtectedRoute><ExecRisks /></RoleProtectedRoute>} />
          <Route path="/executive/risk/constraints" element={<RoleProtectedRoute><ExecConstraints /></RoleProtectedRoute>} />
          <Route path="/executive/risk/opportunities" element={<RoleProtectedRoute><ExecOpportunities /></RoleProtectedRoute>} />
          <Route path="/executive/risk/recovery" element={<RoleProtectedRoute><ExecRecovery /></RoleProtectedRoute>} />
          <Route path="/executive/ai/briefing" element={<RoleProtectedRoute><ExecAIBriefing /></RoleProtectedRoute>} />
          <Route path="/executive/ai/recommendations" element={<RoleProtectedRoute><ExecAIRecommendations /></RoleProtectedRoute>} />
          <Route path="/executive/ai/agents" element={<RoleProtectedRoute><ExecAIAgents /></RoleProtectedRoute>} />
          <Route path="/executive/reports" element={<RoleProtectedRoute><ExecReports /></RoleProtectedRoute>} />
          <Route path="/executive/notifications" element={<RoleProtectedRoute><ExecNotifications /></RoleProtectedRoute>} />
          <Route path="/executive/profile" element={<RoleProtectedRoute><ExecProfile /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* COMMON SHARED ROOT ALIASES                                */}
          {/* ========================================================= */}
          <Route path="/production" element={<RoleProtectedRoute><ProductionOrdersPage /></RoleProtectedRoute>} />
          <Route path="/planning" element={<RoleProtectedRoute><SchedulePage /></RoleProtectedRoute>} />
          <Route path="/quality" element={<RoleProtectedRoute><QualityStatusPage /></RoleProtectedRoute>} />
          <Route path="/inventory" element={<RoleProtectedRoute><WarehouseInventoryPage /></RoleProtectedRoute>} />
          <Route path="/traceability" element={<RoleProtectedRoute><WarehouseTraceability /></RoleProtectedRoute>} />
          <Route path="/costing" element={<RoleProtectedRoute><ExecManufacturingCost /></RoleProtectedRoute>} />
          <Route path="/rca-capa" element={<RoleProtectedRoute><QualityRCACAPAPage /></RoleProtectedRoute>} />
          <Route path="/labour" element={<RoleProtectedRoute><StaffingPage /></RoleProtectedRoute>} />
          <Route path="/purchasing" element={<RoleProtectedRoute><WarehouseIncomingDeliveries /></RoleProtectedRoute>} />
          <Route path="/documents" element={<RoleProtectedRoute><WorkInstructions /></RoleProtectedRoute>} />
          <Route path="/reports" element={<RoleProtectedRoute><ReportsPage /></RoleProtectedRoute>} />
          <Route path="/shopfloor" element={<RoleProtectedRoute><OperatorDashboard /></RoleProtectedRoute>} />

          {/* ========================================================= */}
          {/* MASTER DATA, GOVERNANCE & MIGRATION DIRECT ROUTES         */}
          {/* ========================================================= */}
          <Route path="/master-data/items" element={<RoleProtectedRoute><ItemMasterPage /></RoleProtectedRoute>} />
          <Route path="/master-data/bom" element={<RoleProtectedRoute><BOMRecipesPage /></RoleProtectedRoute>} />
          <Route path="/master-data/work-centers" element={<RoleProtectedRoute><WorkCentersMasterPage /></RoleProtectedRoute>} />
          <Route path="/master-data/machine-capability" element={<RoleProtectedRoute><MachineCapabilityPage /></RoleProtectedRoute>} />
          <Route path="/master-data/skills" element={<RoleProtectedRoute><SkillsMasterPage /></RoleProtectedRoute>} />
          <Route path="/master-data/quality-specs" element={<RoleProtectedRoute><QualitySpecsPage /></RoleProtectedRoute>} />
          <Route path="/governance/permissions" element={<RoleProtectedRoute><PermissionsMatrixPage /></RoleProtectedRoute>} />
          <Route path="/governance/audit" element={<RoleProtectedRoute><AuditLogsPage /></RoleProtectedRoute>} />
          <Route path="/migration" element={<RoleProtectedRoute><MigrationPage /></RoleProtectedRoute>} />
          <Route path="/roles" element={<RoleProtectedRoute><PermissionsMatrixPage /></RoleProtectedRoute>} />
          <Route path="/audit" element={<RoleProtectedRoute><AuditLogsPage /></RoleProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RoleProvider>
        <MasterDataProvider>
          <CMMSProvider>
            <ProductionProvider>
              <PlanningProvider>
                <QualityProvider>
                  <InventoryProvider>
                    <ExceptionProvider>
                      <AdminProvider>
                        <AppContent />
                      </AdminProvider>
                    </ExceptionProvider>
                  </InventoryProvider>
                </QualityProvider>
              </PlanningProvider>
            </ProductionProvider>
          </CMMSProvider>
        </MasterDataProvider>
      </RoleProvider>
    </AppProvider>
  );
}

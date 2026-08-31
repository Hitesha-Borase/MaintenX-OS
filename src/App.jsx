import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { RoleProvider } from "./context/RoleContext";
import { CMMSProvider } from "./context/CMMSContext";
import { ProductionProvider } from "./context/ProductionContext";
import { QualityProvider } from "./context/QualityContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ExceptionProvider } from "./context/ExceptionContext";
import { AdminProvider } from "./context/AdminContext";

import { AppLayout } from "./components/layout/AppLayout";

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

export function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Default Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 1. Dashboard */}
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* 2. User Management */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/invitations" element={<UserInvitationsPage />} />
          <Route path="/users/status" element={<UserStatusPage />} />
          <Route path="/users/activity" element={<UserActivityPage />} />

          {/* 3. Roles & Permissions */}
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/permissions" element={<PermissionsMatrixPage />} />
          <Route path="/roles/mapping" element={<RoleMappingPage />} />
          <Route path="/roles/approval-permissions" element={<ApprovalPermissionsPage />} />

          {/* 4. Organization */}
          <Route path="/organization" element={<Navigate to="/organization/companies" replace />} />
          <Route path="/organization/companies" element={<CompaniesPage />} />
          <Route path="/organization/plants" element={<PlantsPage />} />
          <Route path="/organization/departments" element={<DepartmentsPage />} />
          <Route path="/organization/lines" element={<LinesPage />} />
          <Route path="/organization/work-centers" element={<OrgWorkCentersPage />} />

          {/* 5. Master Data */}
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

          {/* 6. Integrations */}
          <Route path="/integrations" element={<Navigate to="/integrations/erp" replace />} />
          <Route path="/integrations/erp" element={<ERPIntegrationPage />} />
          <Route path="/integrations/iot" element={<IoTIntegrationPage />} />
          <Route path="/integrations/barcode" element={<BarcodeIntegrationPage />} />
          <Route path="/integrations/apis" element={<APIsIntegrationPage />} />

          {/* 7. Data Health */}
          <Route path="/data-health" element={<Navigate to="/data-health/missing-data" replace />} />
          <Route path="/data-health/missing-data" element={<MissingDataPage />} />
          <Route path="/data-health/duplicates" element={<DuplicatesPage />} />
          <Route path="/data-health/invalid-references" element={<InvalidReferencesPage />} />
          <Route path="/data-health/broken-relationships" element={<BrokenRelationshipsPage />} />
          <Route path="/data-health/stale-records" element={<StaleRecordsPage />} />
          <Route path="/data-health/remediation" element={<DataRemediationPage />} />

          {/* 8. Security */}
          <Route path="/security" element={<SecurityPage />} />

          {/* 9. Configuration */}
          <Route path="/configuration" element={<ConfigurationPage />} />

          {/* 10. Audit Logs */}
          <Route path="/audit-logs" element={<AuditLogsPage />} />

          {/* 11. Migration */}
          <Route path="/migration" element={<MigrationPage />} />

          {/* 12. System Reports */}
          <Route path="/system-reports" element={<SystemReportsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
                  <AdminProvider>
                    <AppContent />
                  </AdminProvider>
                </ExceptionProvider>
              </InventoryProvider>
            </QualityProvider>
          </ProductionProvider>
        </CMMSProvider>
      </RoleProvider>
    </AppProvider>
  );
}

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'src/modules/quality/quality.service.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace all or(eq(table.tenantId, tenantId), isNull(table.tenantId)) with eq(table.tenantId, tenantId)
const tables = [
  'qaReleaseQueue', 'ccpChecks', 'qaApprovedReleases', 'qualityHolds',
  'deviations', 'qualityInvestigations', 'ncrs', 'batchQualityReviews',
  'allergenAudits', 'capaRecords', 'qaAuditTrail', 'qaReports',
  'qaNotifications', 'qaProfiles', 'qaCertifications', 'sanitationCipSteps',
  'sanitationCipConfig', 'batchHistory', 'batchQualityRecords'
];

tables.forEach(tbl => {
  // Regex pattern for or(eq(tbl.tenantId, tenantId), isNull(tbl.tenantId))
  const re1 = new RegExp(`or\\(eq\\(${tbl}\\.tenantId,\\s*tenantId\\),\\s*isNull\\(${tbl}\\.tenantId\\)\\)`, 'g');
  content = content.replace(re1, `eq(${tbl}.tenantId, tenantId)`);
});

// 2. In SQL strings: WHERE tenant_id = $1 OR tenant_id IS NULL
content = content.replace(/WHERE\s+tenant_id\s*=\s*\$1\s+OR\s+tenant_id\s+IS\s+NULL/gi, 'WHERE tenant_id = $1');
content = content.replace(/WHERE\s+\(tenant_id\s*=\s*\$1\s+OR\s+tenant_id\s+IS\s+NULL\)/gi, 'WHERE tenant_id = $1');
content = content.replace(/AND\s+\(tenant_id\s*=\s*\$9\s+OR\s+tenant_id\s+IS\s+NULL\)/gi, 'AND tenant_id = $9');
content = content.replace(/WHERE\s+tenant_id\s*=\s*\$4\s+OR\s+tenant_id\s+IS\s+NULL/gi, 'WHERE tenant_id = $4');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully updated all tenant filter conditions in quality.service.ts');

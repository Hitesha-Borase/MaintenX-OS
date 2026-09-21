import { masterDataService } from './src/modules/master-data/masterData.service.ts';
async function run() {
  const fns = [
    'listCompanies', 'listPlants', 'listDepartments', 'listLines', 'listWorkCenters',
    'listOperations', 'listRoutings', 'listProductFamilies', 'listUoms', 'listPackConfigs',
    'listLineTargets', 'listChangeoverRules', 'listSanitationClasses', 'listAllergenRules',
    'listSkus', 'listBoms', 'listAssetTypes', 'listCriticalityLevels', 'listAssets',
    'listStaff', 'listQualitySpecs', 'listLabourStandards', 'listEmployeeSkills',
    'listCCPLimits', 'listStorageResources', 'listStorageTypes'
  ];
  for (const fn of fns) {
    if (masterDataService[fn]) {
      try {
        const res = await masterDataService[fn]();
        console.log(`  ${fn} Success, count:`, res?.length);
      } catch (e) {
        console.error(`  ${fn} Error:`, e.message);
      }
    } else {
      console.log(`${fn} does not exist`);
    }
  }
  process.exit(0);
}
run();

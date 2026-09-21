const { masterDataService } = require('./src/modules/master-data/masterData.service.js');
async function run() {
  const fns = [
    'listLocations',
    'listShifts',
    'listProductionLines',
    'listWorkCenters',
    'listSkus',
    'listBom',
    'listEquipment',
    'listSpares',
    'listQualitySpecs',
    'listLineTargets',
    'listLabourStandards',
    'listEmployeeSkills',
    'listCcpLimits',
    'listResources',
    'listStorageTypes'
  ];
  for (const fn of fns) {
    if (masterDataService[fn]) {
      try {
        console.log(`Running ${fn}...`);
        const res = await masterDataService[fn]();
        console.log(`  ${fn} Success, count:`, res?.length);
      } catch (e) {
        console.error(`  ${fn} Error:`, e.message);
      }
    } else {
      console.log(`${fn} does not exist on masterDataService`);
    }
  }
}
run();

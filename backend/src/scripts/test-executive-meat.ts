import { executiveService } from '../modules/executive/executive.service.js';

async function test() {
  const summary: any = await executiveService.getDashboardSummary('0f63be8b-52aa-4e6b-ab83-1d5477328262', 'ALL');
  console.log('--- EXECUTIVE DASHBOARD LIVE MEAT DATA ---');
  console.log('Production Attainment:', summary.productionAttainment);
  console.log('Processing Actual Volume:', summary.operationsSummary?.processing?.actualVolume);
  console.log('Packaging Actual Units:', summary.operationsSummary?.packaging?.actualUnits);
  console.log('Combined Attainment Percent:', summary.operationsSummary?.combined?.combinedAttainmentPercent);
  console.log('Active Plants:', summary.plants?.map((p: any) => ({ name: p.name, location: p.location, achievement: p.achievement })));
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});

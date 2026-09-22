import { db } from "../db/index.js";
import {
  tenants,
  plants,
  users,
  productionLines,
  skus,
  boms,
  bomItems,
  batches,
  batchSteps,
  productionOrders,
  ccpLimits,
  ccpChecks,
  assets,
  preopChecks,
} from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";

export async function seedMeatCompanyClientData() {
  console.log("🍖 [SEED] Seeding The Great Canadian Meat Company Master Data into PostgreSQL...");

  // 1. Get or Ensure Tenant, Plant, User
  const [tenant] = await db.select().from(tenants).limit(1);
  if (!tenant) throw new Error("No tenant found!");
  const tenantId = tenant.id;

  const [plant] = await db.select().from(plants).where(eq(plants.tenantId, tenantId)).limit(1);
  if (!plant) throw new Error("No plant found!");
  const plantId = plant.id;

  const [user] = await db.select().from(users).where(eq(users.tenantId, tenantId)).limit(1);
  if (!user) throw new Error("No user found!");
  const userId = user.id;

  let [line] = await db.select().from(productionLines).where(eq(productionLines.tenantId, tenantId)).limit(1);
  if (!line) {
    [line] = await db.insert(productionLines).values({
      tenantId,
      plantId,
      code: "LINE-MEAT-01",
      name: "Line 1 - Meat Processing & Thermoforming Packaging",
      status: "RUNNING",
      nominalSpeedBpm: 580,
    }).returning();
  }

  // 2. Ensure Client SKUs in public.skus
  const clientSkus = [
    { code: "SKU-BAC-82B", name: "Hickory Smoked Sliced Bacon (Formula #82B)", category: "FINISHED_GOODS", uom: "Packs", cost: "4.85", shelfLife: 90 },
    { code: "SKU-HAM-82A", name: "Black Forest Smoked Ham (Formula #82A)", category: "FINISHED_GOODS", uom: "Kg", cost: "7.20", shelfLife: 60 },
    { code: "SKU-JRK-101", name: "Original Canadian Beef Jerky (Aw < 0.85)", category: "FINISHED_GOODS", uom: "Packs", cost: "3.50", shelfLife: 365 },
    { code: "SKU-PEP-201", name: "Smoked Pepperoni Snack Sticks (pH < 5.3)", category: "FINISHED_GOODS", uom: "Packs", cost: "2.10", shelfLife: 180 },
    { code: "RM-PORK-BELLY", name: "Fresh Grade A Pork Bellies (≤ 4°C)", category: "RAW_MATERIAL", uom: "Kg", cost: "3.20", shelfLife: 14 },
    { code: "RM-CURE-82B", name: "Complete Bacon Cure MALBCUR-002 Seasoning", category: "RAW_MATERIAL", uom: "Kg", cost: "12.50", shelfLife: 365 },
    { code: "RM-SURE-CURE", name: "Complete Bacon Cure Sure Cure (Prague Powder)", category: "RAW_MATERIAL", uom: "Kg", cost: "8.00", shelfLife: 365 },
    { code: "RM-BROWN-SUG", name: "Pure Dark Brown Cane Sugar", category: "RAW_MATERIAL", uom: "Kg", cost: "1.40", shelfLife: 730 },
    { code: "RM-HAM-MALBF", name: "Malabar Black Forest Ham Pump MALBF-001", category: "RAW_MATERIAL", uom: "Kg", cost: "14.20", shelfLife: 365 },
    { code: "RM-MAPLE-FLV", name: "Malabar Natural Maple Flavouring Blend", category: "RAW_MATERIAL", uom: "Kg", cost: "28.00", shelfLife: 365 },
    { code: "PKG-VAC-POUCH", name: "Variovac Heavy Barrier Vacuum Thermoform Film", category: "PACKAGING", uom: "Rolls", cost: "85.00", shelfLife: 1000 },
  ];

  const skuMap = new Map<string, string>();
  for (const s of clientSkus) {
    const [existing] = await db.select().from(skus).where(eq(skus.skuCode, s.code));
    if (existing) {
      skuMap.set(s.code, existing.id);
      await db.update(skus).set({ name: s.name, category: s.category }).where(eq(skus.id, existing.id));
    } else {
      const [inserted] = await db.insert(skus).values({
        tenantId,
        plantId,
        skuCode: s.code,
        name: s.name,
        category: s.category,
        uom: s.uom,
        standardCost: s.cost,
        shelfLifeDays: s.shelfLife,
        isActive: true,
      }).returning();
      skuMap.set(s.code, inserted.id);
    }
  }

  // 3. Populate Real Client CCPs in public.ccp_limits
  console.log("🔬 Seeding Real Meat Critical Control Points (CCPs)...");
  await db.execute(sql`
    INSERT INTO public.ccp_limits (ccp_number, process_step, hazard, critical_limit, auto_divert_action, status, updated_at)
    VALUES 
      ('CCP-1', 'Smokehouse Thermal Cooking & Lethality', 'Pathogen Survival (Salmonella / Listeria monocytogenes / E. coli)', 'Core Internal Meat Temp ≥ 71.0°C (160.0°F) for ≥ 15.0 seconds', 'Continuous smokehouse heating cycle extended until core probe stabilizes ≥ 71.0°C', 'Critical Mandatory', NOW()),
      ('CCP-2', 'Raw Meat Receiving & Defrosting Cold Chain', 'Microbial Proliferation & Toxin Formation (Mesophilic Pathogens)', 'Raw Meat Core Temp ≤ 4.0°C (39.2°F) monitored every 30 mins during staging', 'Automatic transfer to Rapid Chill Blast Cooler (< 2.0°C) with deviation log', 'Critical Mandatory', NOW()),
      ('CCP-3', 'Dehydration Room Drying & Fermentation', 'Staphylococcus aureus enterotoxin & Mold Growth', 'Water Activity Aw ≤ 0.850 (Preferred: 0.760 - 0.780), Finished pH ≤ 5.30', 'Automatic dehumidification boost and air velocity increase in Dry Rooms 1-6', 'Critical Mandatory', NOW()),
      ('CCP-4', 'Inline Metal Detection & Magnet Trap', 'Foreign Physical Metal Fragments (Ferrous / Non-Ferrous / Stainless Steel)', '0 mm Defect (Calibrated to Fe: 1.5mm, Non-Fe: 2.0mm, SS: 2.5mm)', 'Automated pneumatic high-speed reject arm to locked QA quarantine bin', 'Critical Mandatory', NOW())
    ON CONFLICT (ccp_number) 
    DO UPDATE SET 
      process_step = EXCLUDED.process_step,
      hazard = EXCLUDED.hazard,
      critical_limit = EXCLUDED.critical_limit,
      auto_divert_action = EXCLUDED.auto_divert_action,
      updated_at = NOW();
  `);

  // 4. Populate Real CCP Checks in public.ccp_checks
  await db.delete(ccpChecks).where(eq(ccpChecks.tenantId, tenantId));
  await db.insert(ccpChecks).values([
    {
      tenantId,
      plantId,
      lineId: line.id,
      operatorId: userId,
      verifiedBy: userId,
      operator: "Douglas Andrew (Line Lead)",
      ccpCode: "CCP-1",
      ccpName: "CCP 1 — Smokehouse Core Thermal Lethality",
      targetValue: "71.000",
      actualValue: "71.800",
      criticalLimitMin: "71.000",
      uom: "°C",
      status: "PASS",
      location: "Smokehouse Bay 02 (Core Probe #3)",
      testMethod: "Calibrated Insertion Needle Thermometer (Handheld/Wall Digital)",
      criticalLimit: "Internal Core Meat Temp ≥ 71.0°C (160.0°F)",
      checkedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      operatorId: userId,
      verifiedBy: userId,
      operator: "Douglas Andrew (Line Lead)",
      ccpCode: "CCP-2",
      ccpName: "CCP 2 — Raw Meat Defrosting Cold Chain",
      targetValue: "4.000",
      actualValue: "3.600",
      criticalLimitMax: "4.000",
      uom: "°C",
      status: "PASS",
      location: "Raw Cooler Defrosting Bay 1",
      testMethod: "Digital Probe Thermometer Monitoring (RC-64)",
      criticalLimit: "Temperature must remain ≤ 4.0°C at all times",
      checkedAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      operatorId: userId,
      verifiedBy: userId,
      operator: "Douglas Andrew (Line Lead)",
      ccpCode: "CCP-3",
      ccpName: "CCP 3 — Dehydration Room Water Activity (Aw)",
      targetValue: "0.780",
      actualValue: "0.772",
      criticalLimitMax: "0.850",
      uom: "Aw",
      status: "PASS",
      location: "Dry Room 02 (Dehydration)",
      testMethod: "Calibrated Benchtop Water Activity Meter (RC-86)",
      criticalLimit: "Aw ≤ 0.850 (Target Range: 0.760 - 0.780)",
      checkedAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      operatorId: userId,
      verifiedBy: userId,
      operator: "Douglas Andrew (Line Lead)",
      ccpCode: "CCP-4",
      ccpName: "CCP 4 — Inline Metal Detection & Reject Trap",
      targetValue: "0.000",
      actualValue: "0.000",
      uom: "Defects",
      status: "PASS",
      location: "Packaging Line 1 Variovac Discharge",
      testMethod: "Certified Test Wand Passing (Fe 1.5mm / Non-Fe 2.0mm / SS 2.5mm)",
      criticalLimit: "0 mm Defect Tolerance (100% Reject Arm Trigger)",
      checkedAt: new Date(Date.now() - 55 * 60 * 1000),
    },
  ]);

  // 5. Populate BOM & BOM Items for Bacon (Formula #82B)
  const baconSkuId = skuMap.get("SKU-BAC-82B")!;
  const [existingBom] = await db.select().from(boms).where(eq(boms.skuId, baconSkuId));
  let baconBomId = existingBom?.id;
  if (!baconBomId) {
    const [baconBom] = await db.insert(boms).values({
      tenantId,
      skuId: baconSkuId,
      bomNumber: "BOM-BAC-82B",
      name: "Formula #82B Cured & Hickory Smoked Bacon",
      version: "v2.1",
      batchSize: "5000.00",
      batchUom: "Kg",
      yieldPercent: "98.50",
      isDefault: true,
      status: "ACTIVE",
      approvalStatus: "Approved",
      createdBy: "HACCP Coordinator",
    }).returning();
    baconBomId = baconBom.id;
  }

  await db.delete(bomItems).where(eq(bomItems.bomId, baconBomId));
  await db.insert(bomItems).values([
    {
      bomId: baconBomId,
      componentSkuId: skuMap.get("RM-PORK-BELLY")!,
      componentName: "Fresh Grade A Pork Bellies (Initial Green Weight)",
      skuCode: "RM-PORK-BELLY",
      quantity: "450.0000",
      uom: "Kg",
      scrapPercentage: "0.50",
      sequence: 1,
      stage: "INJECTION_CURING",
    },
    {
      bomId: baconBomId,
      componentSkuId: skuMap.get("RM-CURE-82B")!,
      componentName: "Complete Bacon Cure MALBCUR-002 Seasoning Blend",
      skuCode: "RM-CURE-82B",
      quantity: "15.0000",
      uom: "Kg",
      scrapPercentage: "0.20",
      sequence: 2,
      stage: "INJECTION_CURING",
    },
    {
      bomId: baconBomId,
      componentSkuId: skuMap.get("RM-SURE-CURE")!,
      componentName: "Complete Bacon Cure Sure Cure (Sodium Nitrite 6.25%)",
      skuCode: "RM-SURE-CURE",
      quantity: "2.4000",
      uom: "Kg",
      scrapPercentage: "0.10",
      sequence: 3,
      stage: "INJECTION_CURING",
    },
    {
      bomId: baconBomId,
      componentSkuId: skuMap.get("RM-BROWN-SUG")!,
      componentName: "Pure Dark Brown Cane Sugar",
      skuCode: "RM-BROWN-SUG",
      quantity: "10.0000",
      uom: "Kg",
      scrapPercentage: "0.20",
      sequence: 4,
      stage: "INJECTION_CURING",
    },
  ]);

  // 6. Populate Active Production Orders
  const [existingOrder] = await db.select().from(productionOrders).where(eq(productionOrders.orderNumber, "PO-MEAT-2026-01"));
  let orderId = existingOrder?.id;
  if (!orderId) {
    const [prodOrder] = await db.insert(productionOrders).values({
      tenantId,
      plantId,
      lineId: line.id,
      orderNumber: "PO-MEAT-2026-01",
      skuId: baconSkuId,
      targetQuantity: "10000",
      producedQuantity: "8450",
      scrapQuantity: "25",
      status: "RUNNING",
      priority: "HIGH",
      plannedStart: new Date(),
      plannedEnd: new Date(Date.now() + 24 * 3600 * 1000),
    }).returning();
    orderId = prodOrder.id;
  } else {
    await db.update(productionOrders).set({
      skuId: baconSkuId,
      targetQuantity: "10000",
      producedQuantity: "8450",
      scrapQuantity: "25",
      status: "RUNNING",
    }).where(eq(productionOrders.id, orderId));
  }

  // 7. Populate Active Meat Batch & Recipe Steps in public.batches & public.batch_steps
  const [existingBatch] = await db.select().from(batches).where(eq(batches.batchNumber, "BAT-MEAT-2026-01"));
  let batchId = existingBatch?.id;
  if (!batchId) {
    const [meatBatch] = await db.insert(batches).values({
      tenantId,
      plantId,
      productionOrderId: orderId,
      skuId: baconSkuId,
      batchNumber: "BAT-MEAT-2026-01",
      recipeVersion: "Formula #82B (Hickory Bacon)",
      tankNumber: "SMK-BAY-02",
      targetVolume: "5000.00",
      actualVolume: "4850.00",
      uom: "Kg",
      currentStep: 3,
      progressPercent: 75,
      status: "IN_PROGRESS",
      startedAt: new Date(Date.now() - 3 * 3600 * 1000),
    }).returning();
    batchId = meatBatch.id;
  } else {
    await db.update(batches).set({
      skuId: baconSkuId,
      recipeVersion: "Formula #82B (Hickory Bacon)",
      tankNumber: "SMK-BAY-02",
      targetVolume: "5000.00",
      actualVolume: "4850.00",
      uom: "Kg",
      currentStep: 3,
      status: "IN_PROGRESS",
    }).where(eq(batches.id, batchId));
  }

  await db.delete(batchSteps).where(eq(batchSteps.batchId, batchId));
  await db.insert(batchSteps).values([
    {
      batchId,
      stepNumber: 1,
      stepName: "Raw Pork Bellies Inspection & Green Weight Check (≤ 4.0°C)",
      status: "COMPLETED",
      parameters: { targetTemp: "≤ 4.0°C", actualTemp: "3.6°C", durationMins: 15, equipment: "Weiler Grinder & Scales" },
      notes: "Passed cold chain inspection. Needles intact.",
      startedAt: new Date(Date.now() - 150 * 60 * 1000),
      completedAt: new Date(Date.now() - 135 * 60 * 1000),
    },
    {
      batchId,
      stepNumber: 2,
      stepName: "Automated Brine Injection & Curing (Pump Target: 8.5% - 10.0% @ 1.8 bar)",
      status: "COMPLETED",
      parameters: { targetTemp: "4.0°C", actualTemp: "3.9°C", durationMins: 30, equipment: "Ruhle Heavy Duty Brine Injector" },
      notes: "Formula #82B cure solution dissolved and verified at 1.8 bar pressure.",
      startedAt: new Date(Date.now() - 130 * 60 * 1000),
      completedAt: new Date(Date.now() - 100 * 60 * 1000),
    },
    {
      batchId,
      stepNumber: 3,
      stepName: "Smokehouse Thermal Cooking & Hardwood Smoke Hold (CCP1 ≥ 71.0°C)",
      status: "IN_PROGRESS",
      parameters: { targetTemp: "71.0°C", actualTemp: "71.8°C", durationMins: 90, equipment: "Smokehouse Bay 02" },
      notes: "Internal probe reaching 71.8°C. Color and smoke density nominal.",
      startedAt: new Date(Date.now() - 90 * 60 * 1000),
    },
    {
      batchId,
      stepNumber: 4,
      stepName: "Rapid Blast Chilling (< 4.0°C) & Variovac Thermoform Vacuum Sealing",
      status: "PENDING",
      parameters: { targetTemp: "2.0°C", actualTemp: "--", durationMins: 30, equipment: "Variovac Deep-Draw Thermoformer" },
      notes: "Staged for final high-barrier slicing and packing run.",
    },
  ]);

  // 8. Populate Real Pre-op Line Clearance Checks in public.preop_checks
  await db.delete(preopChecks).where(eq(preopChecks.tenantId, tenantId));
  await db.insert(preopChecks).values([
    {
      tenantId,
      plantId,
      lineId: line.id,
      batchId,
      category: "LINE CLEARANCE",
      name: "Prior Meat SKU Labels & Outer Cartons Removed",
      spec: "100% Cleared & Segregated",
      criticality: "Critical GMP",
      method: "Visual Line Inspection",
      passed: true,
      inspectorName: "Douglas Andrew (Line Lead)",
      notes: "All previous lot materials and labels removed from line area.",
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      batchId,
      category: "EQUIPMENT INTEGRITY",
      name: "Brine Injector Needles & Slicer Blades Inspected",
      spec: "Intact, Zero Missing/Broken Needles",
      criticality: "Critical GMP",
      method: "Physical Blade & Needle Probe Check",
      passed: true,
      inspectorName: "Douglas Andrew (Line Lead)",
      notes: "All 54 injector needles intact and unbent.",
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      batchId,
      category: "SANITATION SWAB",
      name: "Smokehouse Trolleys & Racks ATP Swab Verified",
      spec: "ATP < 10 RLU",
      criticality: "Critical GMP",
      method: "ATP Bioluminescence Surface Swab (RC-17A)",
      passed: true,
      inspectorName: "Douglas Andrew (Line Lead)",
      notes: "ATP reading = 4 RLU. Sanitation passed.",
    },
    {
      tenantId,
      plantId,
      lineId: line.id,
      batchId,
      category: "SAFETY & E-STOP",
      name: "Variovac Sealer & Metal Detector Functional E-Stop",
      spec: "100% Operational Pass",
      criticality: "Critical GMP",
      method: "Daily Functional Push-Button Verification",
      passed: true,
      inspectorName: "Douglas Andrew (Line Lead)",
      notes: "E-stops and reject flap triggered instantly on test.",
    },
  ]);

  console.log("✅ [SEED COMPLETED] The Great Canadian Meat Company real data successfully synchronized into PostgreSQL!");
}

// Execute directly if run via CLI
if (process.argv[1]?.includes("seed-meat-company-client-data")) {
  seedMeatCompanyClientData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aashi%401234@localhost:5432/maintenxos'
});

async function seedMeatCompany1() {
  const client = await pool.connect();
  try {
    console.log('🥩 Starting full migration & seed for [meat company 1]...');
    await client.query('BEGIN');

    // -------------------------------------------------------------
    // 1. TENANT SETUP: Update to 'meat company 1'
    // -------------------------------------------------------------
    let tenantId = '0f63be8b-52aa-4e6b-ab83-1d5477328262';
    const tenantCheck = await client.query('SELECT id FROM tenants WHERE id = $1', [tenantId]);
    if (tenantCheck.rows.length === 0) {
      const [firstT] = (await client.query('SELECT id FROM tenants LIMIT 1')).rows;
      if (firstT) tenantId = firstT.id;
    }

    await client.query(
      `UPDATE tenants 
       SET name = 'meat company 1', slug = 'meat-company-1', updated_at = NOW() 
       WHERE id = $1`,
      [tenantId]
    );
    console.log(`✅ Tenant updated to 'meat company 1' (ID: ${tenantId})`);

    // -------------------------------------------------------------
    // 2. PLANT SETUP: 'Plant 1 - Meat Processing & Smokehouse'
    // -------------------------------------------------------------
    // Clean old plants for this tenant except we update the primary plant
    const plantQuery = await client.query('SELECT id FROM plants WHERE tenant_id = $1 ORDER BY created_at ASC', [tenantId]);
    let plantId: string;

    if (plantQuery.rows.length > 0) {
      plantId = plantQuery.rows[0].id;
      await client.query(
        `UPDATE plants 
         SET name = 'Plant 1 - Meat Processing & Smokehouse Facility', 
             code = 'PLT-MEAT-01', 
             city = 'Oshawa', 
             state = 'Ontario', 
             country = 'Canada',
             updated_at = NOW()
         WHERE id = $1`,
        [plantId]
      );
      // Delete extra duplicate plants if any
      if (plantQuery.rows.length > 1) {
        const extraPlantIds = plantQuery.rows.slice(1).map(r => r.id);
        for (const epId of extraPlantIds) {
          await client.query('DELETE FROM plants WHERE id = $1', [epId]);
        }
      }
    } else {
      const newPlant = await client.query(
        `INSERT INTO plants (id, tenant_id, code, name, city, state, country)
         VALUES (gen_random_uuid(), $1, 'PLT-MEAT-01', 'Plant 1 - Meat Processing & Smokehouse Facility', 'Oshawa', 'Ontario', 'Canada')
         RETURNING id`,
        [tenantId]
      );
      plantId = newPlant.rows[0].id;
    }
    console.log(`✅ Plant configured: 'Plant 1 - Meat Processing & Smokehouse Facility' (ID: ${plantId})`);

    // -------------------------------------------------------------
    // 3. CLEAN OLD MASTER DATA (Assets, Lines, Boms, SKUs) for clean slate
    // -------------------------------------------------------------
    await client.query('DELETE FROM shipment_orders WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM qa_releases WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM batches WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM downtime_logs WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM production_orders WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM quality_specs WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM bom_items WHERE bom_id IN (SELECT id FROM boms WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM boms WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM routings WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM assets WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM production_lines WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM work_centers WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM inventory_lots WHERE tenant_id = $1', [tenantId]);
    await client.query('DELETE FROM skus WHERE tenant_id = $1', [tenantId]);
    console.log('✅ Cleared previous master data for fresh meat catalog');

    // -------------------------------------------------------------
    // 4. WORK CENTERS (4 Core Departments from Meat Processing SOPs)
    // -------------------------------------------------------------
    const wcRawRes = await client.query(
      `INSERT INTO work_centers (id, tenant_id, plant_id, code, name, category, capacity_per_hour, hourly_rate, is_active)
       VALUES (gen_random_uuid(), $1, $2, 'WC-RAW', 'Raw Meat Preparation & Brining Hall', 'PROCESSING', 3500, 1200, true)
       RETURNING id`,
      [tenantId, plantId]
    );
    const wcRawId = wcRawRes.rows[0].id;

    const wcSmokeRes = await client.query(
      `INSERT INTO work_centers (id, tenant_id, plant_id, code, name, category, capacity_per_hour, hourly_rate, is_active)
       VALUES (gen_random_uuid(), $1, $2, 'WC-SMOKE', 'Thermal Smokehouse & Cooking Hall', 'PROCESSING', 4000, 1800, true)
       RETURNING id`,
      [tenantId, plantId]
    );
    const wcSmokeId = wcSmokeRes.rows[0].id;

    const wcDryRes = await client.query(
      `INSERT INTO work_centers (id, tenant_id, plant_id, code, name, category, capacity_per_hour, hourly_rate, is_active)
       VALUES (gen_random_uuid(), $1, $2, 'WC-DRY', 'Dehydration Tunnel & Slicing Room', 'PROCESSING', 2000, 1400, true)
       RETURNING id`,
      [tenantId, plantId]
    );
    const wcDryId = wcDryRes.rows[0].id;

    const wcPackRes = await client.query(
      `INSERT INTO work_centers (id, tenant_id, plant_id, code, name, category, capacity_per_hour, hourly_rate, is_active)
       VALUES (gen_random_uuid(), $1, $2, 'WC-PACK', 'Vacuum Thermoforming & Metal Detection CCP', 'PACKAGING', 5000, 1600, true)
       RETURNING id`,
      [tenantId, plantId]
    );
    const wcPackId = wcPackRes.rows[0].id;
    console.log('✅ Work Centers created (Raw Prep, Smokehouse Hall, Dehydration, Packaging)');

    // -------------------------------------------------------------
    // 5. PRODUCTION LINES
    // -------------------------------------------------------------
    const lineRawRes = await client.query(
      `INSERT INTO production_lines (id, tenant_id, plant_id, work_center_id, code, name, line_type, nominal_speed_bpm, status, health_score)
       VALUES (gen_random_uuid(), $1, $2, $3, 'LINE-RAW-01', 'Line 1: Raw Meat Prep & Injecting', 'BLENDING', 300, 'RUNNING', 96)
       RETURNING id`,
      [tenantId, plantId, wcRawId]
    );
    const lineRawId = lineRawRes.rows[0].id;

    const lineSmokeRes = await client.query(
      `INSERT INTO production_lines (id, tenant_id, plant_id, work_center_id, code, name, line_type, nominal_speed_bpm, status, health_score)
       VALUES (gen_random_uuid(), $1, $2, $3, 'LINE-SMK-01', 'Line 2: Thermal Smokehouses (1-5)', 'BLENDING', 400, 'RUNNING', 98)
       RETURNING id`,
      [tenantId, plantId, wcSmokeId]
    );
    const lineSmokeId = lineSmokeRes.rows[0].id;

    const lineDryRes = await client.query(
      `INSERT INTO production_lines (id, tenant_id, plant_id, work_center_id, code, name, line_type, nominal_speed_bpm, status, health_score)
       VALUES (gen_random_uuid(), $1, $2, $3, 'LINE-DRY-01', 'Line 3: Jerky Dehydration & Dry Rooms', 'BLENDING', 250, 'RUNNING', 94)
       RETURNING id`,
      [tenantId, plantId, wcDryId]
    );
    const lineDryId = lineDryRes.rows[0].id;

    const linePackRes = await client.query(
      `INSERT INTO production_lines (id, tenant_id, plant_id, work_center_id, code, name, line_type, nominal_speed_bpm, status, health_score)
       VALUES (gen_random_uuid(), $1, $2, $3, 'LINE-PCK-01', 'Line 4: Variovac Vacuum Packaging & Metal Detector', 'PACKAGING', 550, 'RUNNING', 97)
       RETURNING id`,
      [tenantId, plantId, wcPackId]
    );
    const linePackId = linePackRes.rows[0].id;
    console.log('✅ 4 Production Lines configured');

    // -------------------------------------------------------------
    // 6. ASSETS & EQUIPMENT (From client file: RC-11 LIST OF EQUIPMENT.xlsx)
    // -------------------------------------------------------------
    const assetsData = [
      {
        code: 'EQ-MIX-1252',
        name: 'N & N Mixer 450 EF',
        category: 'MIXER',
        critical: 'CRITICAL_P1',
        model: '450 EF',
        mfg: 'N & N Nadratowski',
        serial: '1252',
        location: 'Processing Room # 7 (RAW)',
        lineId: lineRawId
      },
      {
        code: 'EQ-GRD-1167',
        name: 'Weiler Meat Grinder',
        category: 'GRINDER',
        critical: 'CRITICAL_P1',
        model: 'Meat Grinder 1167',
        mfg: 'Weiler',
        serial: '1167',
        location: 'Processing Room # 7 (RAW)',
        lineId: lineRawId
      },
      {
        code: 'EQ-INJ-01',
        name: 'Ruhle Heavy Duty Brine Injector',
        category: 'INJECTOR',
        critical: 'CRITICAL_P1',
        model: 'PR 15',
        mfg: 'Ruhle GmbH',
        serial: 'RU-8821',
        location: 'Processing Room # 7 (RAW)',
        lineId: lineRawId
      },
      {
        code: 'EQ-TMB-3334',
        name: 'Henneken Vacuum Meat Tumbler',
        category: 'TUMBLER',
        critical: 'IMPORTANT_P2',
        model: 'B3-11',
        mfg: 'Henneken',
        serial: 'B3-11/11-3334-1',
        location: 'Tumbling Room (RAW)',
        lineId: lineRawId
      },
      {
        code: 'EQ-STF-15197',
        name: 'Handtmann Stuffer & Hoist (VF622)',
        category: 'STUFFER',
        critical: 'CRITICAL_P1',
        model: 'VF622',
        mfg: 'Handtmann',
        serial: '15197',
        location: 'Sausage Formulation Bay',
        lineId: lineSmokeId
      },
      {
        code: 'EQ-SMK-01',
        name: 'Commercial Smokehouse Units 1-3 (MPC 4)',
        category: 'SMOKEHOUSE',
        critical: 'CRITICAL_P1',
        model: 'MPC-4 Triple Bay',
        mfg: 'Maurer-Atmos',
        serial: 'SMK-MPC4-2026',
        location: 'Thermal Smokehouse Bay',
        lineId: lineSmokeId
      },
      {
        code: 'EQ-SMK-04',
        name: 'Commercial Smokehouse Units 4-5 (Food.LOG)',
        category: 'SMOKEHOUSE',
        critical: 'CRITICAL_P1',
        model: 'Food.LOG Industrial Cooker',
        mfg: 'Fessmann',
        serial: 'SMK-FLOG-2026',
        location: 'Thermal Smokehouse Bay',
        lineId: lineSmokeId
      },
      {
        code: 'EQ-DRY-01',
        name: 'Dehydration Dry Rooms 1-6 (Aw Control)',
        category: 'DEHYDRATOR',
        critical: 'CRITICAL_P1',
        model: 'DryMaster Aw-850',
        mfg: 'Enviro-Pak',
        serial: 'DR-106-ENV',
        location: 'Dehydration Wing',
        lineId: lineDryId
      },
      {
        code: 'EQ-JRK-CUT',
        name: 'Heavy Duty Jerky Slicer & Cutter',
        category: 'CUTTER',
        critical: 'IMPORTANT_P2',
        model: 'Magurit Fromat 042',
        mfg: 'Magurit',
        serial: 'MG-042-881',
        location: 'Jerky Prep Room',
        lineId: lineDryId
      },
      {
        code: 'EQ-VAC-PACK',
        name: 'Variovac Deep-Draw Thermoformer Vacuum Sealer',
        category: 'PACKAGING',
        critical: 'CRITICAL_P1',
        model: 'Primus Thermoformer',
        mfg: 'Variovac',
        serial: 'VV-7721-PRI',
        location: 'Packaging Cleanroom',
        lineId: linePackId
      },
      {
        code: 'EQ-MD-CCP',
        name: 'Fortress Stealth In-Line Metal Detector (CCP)',
        category: 'QUALITY_CCP',
        critical: 'CRITICAL_P1',
        model: 'Stealth In-Line Multi-Frequency',
        mfg: 'Fortress Technology',
        serial: 'FT-9941-CCP',
        location: 'Packaging Discharge (CCP Station)',
        lineId: linePackId
      }
    ];

    for (const ast of assetsData) {
      await client.query(
        `INSERT INTO assets (
          id, tenant_id, plant_id, line_id, asset_code, name, type,
          critical_level, model_number, manufacturer, serial_number, location,
          status, health_score, mtbf_hours, mttr_hours
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'OPERATIONAL', 96, 420.0, 1.2
        )`,
        [
          tenantId, plantId, ast.lineId, ast.code, ast.name, ast.category,
          ast.critical, ast.model, ast.mfg, ast.serial, ast.location
        ]
      );
    }
    console.log(`✅ ${assetsData.length} Meat Equipment Assets seeded from RC-11`);

    // -------------------------------------------------------------
    // 7. SKUs (Finished Goods & Raw Materials)
    // -------------------------------------------------------------
    const skusData = [
      // Finished Goods
      {
        code: 'SKU-BAC-82B',
        name: 'Hickory Smoked Bacon (Formula #82A/82B)',
        category: 'FINISHED_GOODS',
        uom: 'lbs',
        cost: 4.85,
        barcode: '062847182012',
        minStock: 2000,
        maxStock: 50000
      },
      {
        code: 'SKU-JRK-101',
        name: 'Original Canadian Beef Jerky (Aw < 0.850)',
        category: 'FINISHED_GOODS',
        uom: 'lbs',
        cost: 9.40,
        barcode: '062847182029',
        minStock: 1500,
        maxStock: 30000
      },
      {
        code: 'SKU-PEP-201',
        name: 'Smoked Pepperoni Snack Sticks (pH < 5.3)',
        category: 'FINISHED_GOODS',
        uom: 'lbs',
        cost: 5.60,
        barcode: '062847182036',
        minStock: 2500,
        maxStock: 60000
      },
      // Raw Materials
      {
        code: 'RM-PORK-BELLY',
        name: 'Fresh Grade A Pork Bellies (≤ 4°C)',
        category: 'RAW_MATERIAL',
        uom: 'lbs',
        cost: 2.30,
        barcode: 'RM-PB-991',
        minStock: 5000,
        maxStock: 100000
      },
      {
        code: 'RM-BEEF-TRIM',
        name: 'Fresh Beef Trimmings 85/15',
        category: 'RAW_MATERIAL',
        uom: 'lbs',
        cost: 3.10,
        barcode: 'RM-BT-992',
        minStock: 4000,
        maxStock: 80000
      },
      {
        code: 'RM-SPICE-82B',
        name: 'Formula #82B Maple Curing Salt & Smokehouse Blend',
        category: 'RAW_MATERIAL',
        uom: 'lbs',
        cost: 1.80,
        barcode: 'RM-SP-82B',
        minStock: 500,
        maxStock: 10000
      },
      {
        code: 'PKG-VAC-POUCH',
        name: 'Heavy Barrier Vacuum Shrink Pouches (Variovac)',
        category: 'PACKAGING',
        uom: 'Units',
        cost: 0.18,
        barcode: 'PKG-VP-500',
        minStock: 10000,
        maxStock: 200000
      },
      {
        code: 'PKG-CORR-BOX',
        name: 'Master Meat Shipping Corrugate Cases',
        category: 'PACKAGING',
        uom: 'Units',
        cost: 1.25,
        barcode: 'PKG-CB-01',
        minStock: 2000,
        maxStock: 50000
      }
    ];

    const skuMap: Record<string, string> = {};
    for (const s of skusData) {
      const insRes = await client.query(
        `INSERT INTO skus (
          id, tenant_id, plant_id, sku_code, name, category, uom,
          barcode, standard_cost, shelf_life_days, min_stock_level, max_stock_level, is_active
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 120, $9, $10, true
        ) RETURNING id`,
        [tenantId, plantId, s.code, s.name, s.category, s.uom, s.barcode, s.cost, s.minStock, s.maxStock]
      );
      skuMap[s.code] = insRes.rows[0].id;
    }
    console.log(`✅ ${skusData.length} SKUs inserted into database`);

    // -------------------------------------------------------------
    // 8. BOMS & RECIPES (Bacon Formula #82B & Beef Jerky)
    // -------------------------------------------------------------
    const bomBaconRes = await client.query(
      `INSERT INTO boms (
        id, tenant_id, sku_id, bom_number, version, name, batch_size, batch_uom,
        yield_percent, is_default, status, approval_status, created_by
      ) VALUES (
        gen_random_uuid(), $1, $2, 'BOM-BAC-82B', 'v2.1',
        'Formula #82B Smoked Bacon Brine & Cure Recipe', 10000, 'lbs',
        98.2, true, 'ACTIVE', 'Approved', 'Stefan Crawford'
      ) RETURNING id`,
      [tenantId, skuMap['SKU-BAC-82B']]
    );
    const bomBaconId = bomBaconRes.rows[0].id;

    // BOM items for Bacon
    await client.query(
      `INSERT INTO bom_items (id, bom_id, component_sku_id, component_name, sku_code, quantity, scrap_percentage, uom, sequence, stage)
       VALUES 
       (gen_random_uuid(), $1, $2, 'Fresh Grade A Pork Bellies', 'RM-PORK-BELLY', 9800.0, 1.0, 'lbs', 1, 'INJECTING'),
       (gen_random_uuid(), $1, $3, 'Formula #82B Maple Curing Salt', 'RM-SPICE-82B', 350.0, 0.5, 'lbs', 2, 'BRINE_PREP'),
       (gen_random_uuid(), $1, $4, 'Heavy Barrier Vacuum Shrink Pouches', 'PKG-VAC-POUCH', 10000.0, 1.2, 'Units', 3, 'PACKAGING')`,
      [bomBaconId, skuMap['RM-PORK-BELLY'], skuMap['RM-SPICE-82B'], skuMap['PKG-VAC-POUCH']]
    );

    // BOM for Jerky
    const bomJerkyRes = await client.query(
      `INSERT INTO boms (
        id, tenant_id, sku_id, bom_number, version, name, batch_size, batch_uom,
        yield_percent, is_default, status, approval_status, created_by
      ) VALUES (
        gen_random_uuid(), $1, $2, 'BOM-JRK-101', 'v1.4',
        'Original Canadian Beef Jerky Dehydration Recipe', 5000, 'lbs',
        42.5, true, 'ACTIVE', 'Approved', 'Stefan Crawford'
      ) RETURNING id`,
      [tenantId, skuMap['SKU-JRK-101']]
    );
    const bomJerkyId = bomJerkyRes.rows[0].id;

    await client.query(
      `INSERT INTO bom_items (id, bom_id, component_sku_id, component_name, sku_code, quantity, scrap_percentage, uom, sequence, stage)
       VALUES 
       (gen_random_uuid(), $1, $2, 'Fresh Beef Trimmings 85/15', 'RM-BEEF-TRIM', 11500.0, 2.0, 'lbs', 1, 'SLICING'),
       (gen_random_uuid(), $1, $3, 'Heavy Barrier Vacuum Shrink Pouches', 'PKG-VAC-POUCH', 5000.0, 1.0, 'Units', 2, 'PACKAGING')`,
      [bomJerkyId, skuMap['RM-BEEF-TRIM'], skuMap['PKG-VAC-POUCH']]
    );
    console.log('✅ BOMs & Recipes configured (Bacon Formula #82B, Jerky)');

    // -------------------------------------------------------------
    // 9. QUALITY SPECS & HACCP CRITICAL CONTROL POINTS (CCP Summary)
    // -------------------------------------------------------------
    const ccpSpecs = [
      {
        skuId: skuMap['SKU-BAC-82B'],
        specId: 'SPEC-CCP-COOK-BAC',
        title: 'Smokehouse Core Cooking Lethality (CCP-1)',
        skuCode: 'SKU-BAC-82B',
        skuName: 'Hickory Smoked Bacon (Formula #82B)',
        param: 'Internal Core Temperature',
        target: '58.0',
        min: '57.8',
        max: '75.0',
        uom: '°C',
        isCCP: true,
        limit: 'Min 57.8°C with 33 minutes hold time',
        method: 'Smokehouse Calibrated Thermal Probe (RC-16C)'
      },
      {
        skuId: skuMap['SKU-JRK-101'],
        specId: 'SPEC-CCP-AW-JRK',
        title: 'Dehydration Water Activity Aw (CCP-2)',
        skuCode: 'SKU-JRK-101',
        skuName: 'Original Canadian Beef Jerky',
        param: 'Water Activity (Aw)',
        target: '0.820',
        min: '0.700',
        max: '0.850',
        uom: 'Aw',
        isCCP: true,
        limit: 'Critical Maximum Aw < 0.850 (Shelf-Stable)',
        method: 'Calibrated Water Activity Meter (RC-58 / RC-86)'
      },
      {
        skuId: skuMap['SKU-PEP-201'],
        specId: 'SPEC-CCP-PH-PEP',
        title: 'Fermentation pH Endpoint (CCP-3)',
        skuCode: 'SKU-PEP-201',
        skuName: 'Smoked Pepperoni Snack Sticks',
        param: 'Meat pH Level',
        target: '5.05',
        min: '4.60',
        max: '5.30',
        uom: 'pH',
        isCCP: true,
        limit: 'Critical Maximum pH < 5.30 prior to cooking',
        method: 'Direct Insertion pH Probe Meter (RC-17 / RC-93)'
      },
      {
        skuId: skuMap['SKU-BAC-82B'],
        specId: 'SPEC-CCP-MD-BAC',
        title: 'Fortress Metal Detection Sensitivity (CCP-4)',
        skuCode: 'SKU-BAC-82B',
        skuName: 'Hickory Smoked Bacon (Formula #82B)',
        param: 'Foreign Body Metal Detection',
        target: '0.0',
        min: '0.0',
        max: '0.0',
        uom: 'Pass/Fail',
        isCCP: true,
        limit: 'Zero Contamination (Fe 1.5mm, Non-Fe 2.0mm, SS 2.5mm)',
        method: 'Fortress Stealth In-Line Test Wands (RC-40B)'
      }
    ];

    for (const q of ccpSpecs) {
      await client.query(
        `INSERT INTO quality_specs (
          id, tenant_id, sku_id, parameter_name, target_value, min_tolerance, max_tolerance,
          uom, is_ccp, ccp, range, sku
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )`,
        [
          tenantId, q.skuId, q.param, Number(q.target) || 0, Number(q.min) || 0, Number(q.max) || 0,
          q.uom, q.isCCP, q.isCCP ? 'YES' : 'NO', `${q.min} - ${q.max} ${q.uom}`, q.skuName
        ]
      );
    }
    console.log('✅ HACCP Critical Control Points (CCPs) seeded from CCP Summary.xlsx');

    // -------------------------------------------------------------
    // 10. WAREHOUSE & STORAGE BINS (Cold Storage Cooler & Freezer)
    // -------------------------------------------------------------
    await client.query('DELETE FROM location_bins WHERE warehouse_id IN (SELECT id FROM warehouses WHERE tenant_id = $1)', [tenantId]);
    await client.query('DELETE FROM warehouses WHERE tenant_id = $1', [tenantId]);

    const whRes = await client.query(
      `INSERT INTO warehouses (id, tenant_id, plant_id, code, name, type, is_active)
       VALUES (gen_random_uuid(), $1, $2, 'WH-COLD-01', 'Cold Storage & Finished Meat Warehouse (≤ 4°C)', 'RAW_AND_FINISHED', true)
       RETURNING id`,
      [tenantId, plantId]
    );
    const warehouseId = whRes.rows[0].id;

    const binRes = await client.query(
      `INSERT INTO location_bins (id, warehouse_id, bin_code, aisle, rack, shelf, bin, zone, is_occupied)
       VALUES 
       (gen_random_uuid(), $1, 'COLD-BAY-02', 'B', '02', '1', 'A', 'COLD_CHAIN', true),
       (gen_random_uuid(), $1, 'FREEZER-01', 'F', '01', '1', 'A', 'COLD_CHAIN', false),
       (gen_random_uuid(), $1, 'STAGING-OUT-01', 'S', '01', '1', 'A', 'STAGING', false)
       RETURNING id`,
      [warehouseId]
    );
    const coldBinId = binRes.rows[0].id;
    console.log('✅ Meat Cold Storage Warehouse & Bins configured');

    // Fetch a user for signed QA records
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const authUserId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    // -------------------------------------------------------------
    // 11. LIVE OPERATIONAL RUN: Production Order -> Batch -> QA Release -> Shipping
    // -------------------------------------------------------------
    // Create Production Order
    const poRes = await client.query(
      `INSERT INTO production_orders (
        id, tenant_id, plant_id, order_number, sku_id, line_id,
        target_quantity, produced_quantity, scrap_quantity,
        status, priority, planned_start, planned_end, actual_start, notes
      ) VALUES (
        gen_random_uuid(), $1, $2, 'PO-MEAT-2026-01', $3, $4,
        10000.0, 8450.0, 25.0,
        'RUNNING', 'HIGH', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '5 hours',
        'Official client production run: Hickory Smoked Bacon Formula #82B (Processing, Smokehouse, Packaging & Thermoforming)'
      ) RETURNING id`,
      [tenantId, plantId, skuMap['SKU-BAC-82B'], linePackId]
    );
    const poId = poRes.rows[0].id;

    // Create Batch
    const batchRes = await client.query(
      `INSERT INTO batches (
        id, tenant_id, plant_id, production_order_id, batch_number, sku_id,
        recipe_version, tank_number, target_volume, actual_volume, uom,
        current_step, progress_percent, status, started_at, completed_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'BAT-MEAT-2026-01', $4,
        'v2.1', 'SMK-BAY-02', 10000.0, 8450.0, 'lbs',
        6, 100, 'Released', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '1 hour'
      ) RETURNING id`,
      [tenantId, plantId, poId, skuMap['SKU-BAC-82B']]
    );
    const batchId = batchRes.rows[0].id;

    // QA 21 CFR Part 11 Electronic Release Record
    await client.query(
      `INSERT INTO qa_releases (
        id, tenant_id, plant_id, batch_id, disposition, disposition_by, digital_signature_pin_used,
        certificate_of_analysis_url, coa_metadata, comments, released_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'RELEASED', $4, true,
        'https://maintenx.cloud/coa/COA-MEAT-2026-01.pdf',
        $5,
        'HACCP Verification complete: Core cooking temp 58.2°C holding 33 min verified; Fortress Metal Detector Passed. Safe for human consumption.',
        NOW() - INTERVAL '45 minutes'
      )`,
      [
        tenantId, plantId, batchId, authUserId,
        JSON.stringify({
          batchNumber: 'BAT-MEAT-2026-01',
          productName: 'Hickory Smoked Bacon (Formula #82B)',
          authorizer: 'Stefan Crawford (Director QA & Food Safety)',
          ccpResults: [
            { ccp: 'CCP-1 Smokehouse Thermal Lethality', standard: '≥ 57.8°C for 33 min', result: '58.2°C (34 min)', status: 'PASSED' },
            { ccp: 'CCP-4 Metal Detection', standard: 'Fe 1.5mm / Non-Fe 2.0mm / SS 2.5mm', result: 'Zero Detection / Rejection Optimal', status: 'PASSED' }
          ]
        })
      ]
    );

    // Warehouse Inventory Lot in Cold Chain
    await client.query(
      `INSERT INTO inventory_lots (
        id, tenant_id, plant_id, sku_id, lot_number, lot_type,
        supplier_name, supplier_lot_number, initial_quantity, current_quantity, reserved_quantity,
        uom, location_bin_id, mfg_date, expiry_date, status
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'BAT-MEAT-2026-01', 'FINISHED_GOOD',
        'meat company 1 (In-House)', 'LOT-BAC-82B-01', 8450.0, 8450.0, 0.0,
        'lbs', $4, NOW() - INTERVAL '5 hours', NOW() + INTERVAL '120 days', 'RELEASED'
      )`,
      [tenantId, plantId, skuMap['SKU-BAC-82B'], coldBinId]
    );

    // Outbound Shipment (Reefer Truck Dispatch from RC-9 Shipping Log)
    await client.query(
      `INSERT INTO shipment_orders (
        id, tenant_id, plant_id, shipment_number, customer_name, carrier,
        tracking_number, status, dispatch_date, order_number, finished_goods,
        batch_lot, quantity, destination, trailer_no, seal_no, bol_number, tracking_milestones
      ) VALUES (
        gen_random_uuid(), $1, $2, 'ORD-MEAT-901', 'Metro Supermarkets Logistics Center', 'Challenger Cold Logistics Reefer Lines',
        'TRK-MEAT-8812', 'Dispatched', NOW() - INTERVAL '20 minutes', 'ORD-MEAT-901',
        'Hickory Smoked Bacon (Formula #82B)', 'BAT-MEAT-2026-01', '8,450 lbs (Cartons)',
        'Metro Regional Cold Chain DC Bay 8, Mississauga, ON', 'TRL-COLD-4412', 'SL-MEAT-991', 'BOL-MEAT-901',
        $3
      )`,
      [
        tenantId, plantId,
        JSON.stringify([
          { event: 'Pick & Pallet Staging', time: '06:30 AM', tempC: 2.1, status: 'Completed' },
          { event: 'Pre-Trip Reefer Inspection (RC-9)', time: '07:15 AM', tempC: 1.8, status: 'Reefer Clean & Pre-cooled' },
          { event: 'Loading & Seal Verification', time: '07:45 AM', sealNo: 'SL-MEAT-991', status: 'Sealed' },
          { event: 'Dispatched from Oshawa Facility', time: '08:15 AM', status: 'In Transit' }
        ])
      ]
    );

    // Downtime Log on Smokehouse Preheat
    await client.query(
      `INSERT INTO downtime_logs (
        id, tenant_id, plant_id, line_id, order_id, reason_code, category,
        start_time, end_time, duration_minutes, comments
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'SMOKEHOUSE_PREHEAT_DELAY', 'PLANNED_SETUP',
        NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 30 minutes', 30,
        'Smokehouse Skid 2 thermal divert preheat ramp-up & wood chip feeder calibration'
      )`,
      [tenantId, plantId, lineSmokeId, poId]
    );

    // PM Machine Telemetry & Telemetry Logs for Live Dashboards
    await client.query("DELETE FROM pm_machine_telemetry WHERE plant_id = $1 OR plant_id = 'PLT-01'", [plantId]);
    await client.query(`
      INSERT INTO pm_machine_telemetry (
        id, plant_id, machine_code, name, line_id, stage, status, speed_bph, rated_speed_bph,
        target_count, produced_count, scrap_count, runtime_hours, downtime_minutes,
        efficiency_percent, current_order, operator, process_parameters
      ) VALUES
      (
        'MC-MEAT-SMK-01', $1, 'EQ-SMK-01', 'Commercial Smokehouse 1-3 (MPC 4)', $2,
        'PROCESSING', 'RUNNING', 380, 400, 10000, 8450, 0, '5.20', 30, '96.20',
        'BAT-MEAT-2026-01', 'Stefan Crawford',
        '{"batchId": "BAT-MEAT-2026-01", "recipe": "Formula #82B Bacon", "coreTempC": 58.2, "targetCoreTempC": 57.8, "smokeLevel": "DENSE_HICKORY", "ccpStatus": "PASSED", "holdingTimeMin": 34}'::jsonb
      ),
      (
        'MC-MEAT-PACK-01', $1, 'EQ-VAC-PACK', 'Variovac Thermoformer & Metal Detector', $3,
        'PACKAGING', 'RUNNING', 520, 550, 10000, 8450, 25, '4.80', 0, '98.50',
        'PO-MEAT-2026-01', 'David Miller',
        '{"runId": "RUN-BAC-82B", "vacuumBar": -0.92, "metalDetectorCCP": "PASSED", "feSensMm": 1.5, "nonFeSensMm": 2.0, "ssSensMm": 2.5}'::jsonb
      )
    `, [plantId, lineSmokeId, linePackId]);

    // PM Hour by Hour logs
    await client.query("DELETE FROM pm_hb_logs WHERE plant_id = $1 OR plant_id = 'PLT-01'", [plantId]);
    await client.query(`
      INSERT INTO pm_hb_logs (
        id, plant_id, pitch_id, hour_window, target_units, actual_units, delta, cumulative_delta,
        stage, variance_reason, corrective_action, shift_code, logged_date
      ) VALUES
      (
        'HB-MEAT-01', $1, 'PITCH-SMK-01', '06:00 - 07:00', 2000, 2100, 100, 100,
        'PROCESSING', 'Nominal Smokehouse Loading', 'None required', 'Shift A', CURRENT_DATE::text
      ),
      (
        'HB-MEAT-02', $1, 'PITCH-SMK-02', '07:00 - 08:00', 2000, 2050, 50, 150,
        'PROCESSING', 'Thermal Ramp Complete', 'None required', 'Shift A', CURRENT_DATE::text
      ),
      (
        'HB-MEAT-03', $1, 'PITCH-PACK-01', '08:00 - 09:00', 2500, 2450, -50, 100,
        'PACKAGING', 'Variovac film roll splice', 'Splice completed in 2 min', 'Shift A', CURRENT_DATE::text
      ),
      (
        'HB-MEAT-04', $1, 'PITCH-PACK-02', '09:00 - 10:00', 2500, 2550, 50, 150,
        'PACKAGING', 'High Speed Run', 'None', 'Shift A', CURRENT_DATE::text
      )
    `, [plantId]);

    await client.query('COMMIT');
    console.log('🎉 [meat company 1] FULL SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed, rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedMeatCompany1().catch(console.error);

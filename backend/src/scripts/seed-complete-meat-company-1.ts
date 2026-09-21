import { pool } from '../config/database.js';

async function seedCompleteMeatCompany() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('=== STARTING COMPLETE CLIENT MIGRATION FOR MEAT COMPANY 1 ===');

    const tenantId = '0f63be8b-52aa-4e6b-ab83-1d5477328262';
    const plantId = '6869789b-32d4-4911-bf29-74a9e338f14a';

    // 1. Clean out user manual test entries like 'abc'
    await client.query(`DELETE FROM staff WHERE name ILIKE '%abc%' OR employee_code LIKE '%976%';`);
    console.log('✅ Purged test/manual employee entries');

    // 2. Update all Users to Stefan Crawford's authentic leadership team
    const userUpdates = [
      { email: 'plant.manager@maintenx.com', first: 'Stefan', last: 'Crawford', dept: 'Plant Operations' },
      { email: 'alexander.vance@maintenx.com', first: 'Stefan', last: 'Crawford', dept: 'Plant Operations' },
      { email: 'admin@maintenx.com', first: 'Michael', last: 'Levin', dept: 'Administration' },
      { email: 'planner@maintenx.com', first: 'Stefan', last: 'Crawford', dept: 'Production Planning' },
      { email: 'warehouse@maintenx.com', first: 'Ashley', last: 'Kulcar', dept: 'Purchasing & Materials' },
      { email: 'maintenance@maintenx.com', first: 'David', last: 'Markov', dept: 'Maintenance & Engineering' },
      { email: 'supervisor@maintenx.com', first: 'Ronald', last: 'Robinson', dept: 'Processing Operations' },
      { email: 'linelead@maintenx.com', first: 'Douglas', last: 'Andrew', dept: 'Smokehouse Operations' },
      { email: 'operator@maintenx.com', first: 'Josiah', last: 'Leyland', dept: 'Packaging & Slicing' },
      { email: 'qa@maintenx.com', first: 'Stephanie', last: 'Kuzmych', dept: 'Quality Assurance & HACCP' },
      { email: 'quality@maintenx.com', first: 'Stephanie', last: 'Kuzmych', dept: 'Quality Assurance & HACCP' },
      { email: 'ci@maintenx.com', first: 'Stefan', last: 'Crawford', dept: 'Continuous Improvement' },
      { email: 'executive@maintenx.com', first: 'Pete', last: 'Vanslyke', dept: 'Executive Management' },
      { email: 'master@maintenx.com', first: 'Stefan', last: 'Crawford', dept: 'System Administration' },
    ];

    for (const u of userUpdates) {
      await client.query(`
        UPDATE users 
        SET first_name = $1, last_name = $2, department = $3, tenant_id = $4, updated_at = NOW()
        WHERE email = $5
      `, [u.first, u.last, u.dept, tenantId, u.email]);
    }
    console.log('✅ Updated users table to Stefan Crawford, Stephanie Kuzmych, Pete Vanslyke, Michael Levin, etc.');

    // 3. Populate Staff Table with the real roster from client RC-19 Training Schedule
    await client.query('DELETE FROM staff WHERE tenant_id = $1;', [tenantId]);

    const staffRoster = [
      { code: 'EMP-1050', name: 'Stefan Crawford', designation: 'Plant Manager', shift: 'SHIFT_A', dept: 'Management', skills: ['HACCP Lead', 'SQF Practitioner', 'CI Master'] },
      { code: 'EMP-0001', name: 'Pete Vanslyke', designation: 'President', shift: 'SHIFT_A', dept: 'Executive', skills: ['Corporate Governance', 'HACCP Executive'] },
      { code: 'EMP-0002', name: 'Michael Levin', designation: 'Vice President', shift: 'SHIFT_A', dept: 'Executive', skills: ['Operations Executive', 'Cold Chain Compliance'] },
      { code: 'EMP-80056', name: 'Ashley Kulcar', designation: 'Purchasing & Materials Manager', shift: 'SHIFT_A', dept: 'Warehouse & Purchasing', skills: ['ERP Purchasing', 'Supplier Approval RC-25', 'Cold Storage FIFO'] },
      { code: 'EMP-2094', name: 'Dempsey Rhonda', designation: 'Shipping Coordinator / Accounts', shift: 'SHIFT_A', dept: 'Logistics', skills: ['Reefer Verification RC-9', 'Bill of Lading', 'Pre-Shipment RC-103'] },
      { code: 'EMP-1052', name: 'Stephanie Kuzmych', designation: 'QA Manager', shift: 'SHIFT_A', dept: 'Quality Assurance', skills: ['HACCP Coordinator', 'Microbiological Testing RC-24', 'Deviation Root Cause RC-29'] },
      { code: 'EMP-1053', name: 'David Markov', designation: 'Maintenance Lead & Refrigeration Engineer', shift: 'SHIFT_A', dept: 'Maintenance', skills: ['Smokehouse Burner Service RC-12', 'Ammonia Chiller PM', 'Grinder Blade Tolerance'] },
      { code: 'EMP-1054', name: 'Kyle Derosie', designation: 'Maintenance Technician', shift: 'SHIFT_B', dept: 'Maintenance', skills: ['Multivac Thermoformer PM', 'Conveyor Alignment', 'Pneumatic Calibration'] },
      { code: 'EMP-1055', name: 'Nikita Sharma', designation: 'QA Technician', shift: 'SHIFT_A', dept: 'Quality Assurance', skills: ['Thermal Lethality CCP-1 Check', 'Water Activity Aw RC-86', 'pH Calibration RC-17'] },
      { code: 'EMP-1056', name: 'Saurabh Patel', designation: 'QA Technician', shift: 'SHIFT_B', dept: 'Quality Assurance', skills: ['Fortress Metal Detector 1.5mm Fe RC-40B', 'Sanitation ATP Swabs', 'Retain Samples RC-60'] },
      { code: 'EMP-3014', name: 'Douglas Andrew', designation: 'Smokehouse Lead Hand & Machine Operator', shift: 'SHIFT_A', dept: 'Processing', skills: ['Enviro-Pak Smokehouse Cycle', 'Smoke Sawdust Feed', 'Thermal Core Probes'] },
      { code: 'EMP-2096', name: 'Griffith Donnetta', designation: 'Production Lead Hand', shift: 'SHIFT_A', dept: 'Processing', skills: ['Weiler Meat Grinder Setup', 'Batch Mixing Formula #82B', 'Ruhle Multi-Needle Injector'] },
      { code: 'EMP-30035', name: 'Beth Simpson', designation: 'Packaging Lead Hand', shift: 'SHIFT_A', dept: 'Packaging', skills: ['Multivac R535 Recipe Setup', 'Weber Slicer 604 Calibration', 'Packaging Weight Control RC-106'] },
      { code: 'EMP-1051', name: 'Ronald Robinson', designation: 'Production Lead Hand', shift: 'SHIFT_B', dept: 'Processing', skills: ['Raw Meat Prep & Curing', 'Vacuum Tumbling 1500L', 'Sanitation Pre-Op RC-3'] },
      { code: 'EMP-1043', name: 'Josiah Leyland', designation: 'Packaging Operator', shift: 'SHIFT_A', dept: 'Packaging', skills: ['Multivac Rollstock Loading', 'Gas Flush Seal Inspection RC-92', 'Date Code Print Inspection'] },
      { code: 'EMP-1074', name: 'Kifuko Kaluuba Mary', designation: 'Packaging Operator', shift: 'SHIFT_A', dept: 'Packaging', skills: ['Catch Weight Verification RC-102', 'Case Packing & Labeling', 'Allergen Separation'] },
      { code: 'EMP-3060', name: 'Smith Jacqueline', designation: 'Packaging Operator', shift: 'SHIFT_B', dept: 'Packaging', skills: ['Metal Detector Wand Verification', 'Pouch Sealing', 'Palletizing & Stretch Wrap'] },
      { code: 'EMP-3113', name: 'Wellington Matthew', designation: 'Packaging Operator', shift: 'SHIFT_B', dept: 'Packaging', skills: ['Thermoformer Film Alignment', 'Reefer Staging', 'Sanitation Washdown RC-22'] },
      { code: 'EMP-1089', name: 'Dixon Rodrick', designation: 'Smokehouse Operator', shift: 'SHIFT_A', dept: 'Processing', skills: ['Smokehouse Truck Loading', 'Racks Sanitation RC-23', 'Cooking Chart Thermograph'] },
      { code: 'EMP-30175', name: 'Bowman John', designation: 'Meat Trimming & Injection Operator', shift: 'SHIFT_A', dept: 'Processing', skills: ['Pork Belly Trimming', 'Brine Salt Concentration RC-66', 'Injector Needle Sanitizing'] },
      { code: 'EMP-3082', name: 'Robinson Romeo', designation: 'Grinding & Mixing Operator', shift: 'SHIFT_A', dept: 'Processing', skills: ['Beef Jerky Slicing RC-94', 'Spice Blending', 'Sifter Screen Inspection RC-68'] },
      { code: 'EMP-1019', name: 'Duffus Lewin', designation: 'Smokehouse Operator', shift: 'SHIFT_B', dept: 'Processing', skills: ['Smokehouse Micro-Cook Controls', 'Cooling Room Air Flow', 'CCP Verification'] },
      { code: 'EMP-70128', name: 'Desalvo Dennis', designation: 'Packaging Operator', shift: 'SHIFT_B', dept: 'Packaging', skills: ['Vacuum Chamber Waterbath Leak Check RC-92', 'Box Taping', 'Lot Stamping'] },
      { code: 'EMP-90111', name: 'Beckett Michael', designation: 'Tumbling & Curing Operator', shift: 'SHIFT_A', dept: 'Processing', skills: ['Vacuum Tumbler 1500L', 'Bacon Formula #82B', 'Ham Injection Formula #82A'] },
      { code: 'EMP-1002', name: 'Tyrecee Garraway', designation: 'Packaging Temp Employee', shift: 'SHIFT_A', dept: 'Packaging', skills: ['Carton Packing', 'GMP Compliance RC-1A'] },
      { code: 'EMP-2050', name: 'Nelson Dean', designation: 'Packaging Temp Employee', shift: 'SHIFT_B', dept: 'Packaging', skills: ['Shipper Taping', 'Pallet Jack Operation'] }
    ];

    for (const s of staffRoster) {
      await client.query(`
        INSERT INTO staff (id, tenant_id, plant_id, employee_code, name, designation, shift_code, is_available, certifications, created_at)
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          true,
          $7::jsonb,
          NOW()
        )
      `, [
        tenantId,
        plantId,
        s.code,
        s.name,
        s.designation,
        s.shift,
        JSON.stringify({
          department: s.dept,
          skills: s.skills,
          skillLevel: 'Certified',
          trainingStatus: 'Up to Date',
          plant: 'Plant 1 - Meat Processing & Smokehouse Facility',
          currentStatus: 'Active'
        })
      ]);
    }
    console.log(`✅ Seeded ${staffRoster.length} authentic employees into staff table`);

    // 4. Seed Authentic Meat Plant Work Orders from RC-57 & RC-15
    await client.query('DELETE FROM work_orders WHERE tenant_id = $1;', [tenantId]);

    const assetRes = await client.query('SELECT id, asset_code, name FROM assets WHERE tenant_id = $1;', [tenantId]);
    const assetMap = new Map(assetRes.rows.map(a => [a.asset_code, a.id]));

    const maintenanceUser = await client.query("SELECT id FROM users WHERE email = 'maintenance@maintenx.com' LIMIT 1;");
    const maintUserId = maintenanceUser.rows[0]?.id || null;

    const plantManagerUser = await client.query("SELECT id FROM users WHERE email = 'plant.manager@maintenx.com' LIMIT 1;");
    const pmUserId = plantManagerUser.rows[0]?.id || null;

    const workOrdersList = [
      {
        woNumber: 'WO-MEAT-2026-01',
        assetCode: 'EQ-SMK-03',
        title: 'Smokehouse #3 Burner Ignition & Draft Damper Calibration',
        desc: 'Damper mechanical linkage sticking during high-temperature thermal cook cycle. Inspect burner ignition sequence and calibrate damper servo.',
        type: 'CORRECTIVE',
        priority: 'P1_CRITICAL',
        status: 'IN_PROGRESS',
        estHours: 3.5,
        actHours: 1.5
      },
      {
        woNumber: 'WO-MEAT-2026-02',
        assetCode: 'EQ-GRN-01',
        title: 'Weiler Heavy-Duty Grinder Blade Rotary Sharpen & Plate Clearance Check',
        desc: 'Routine pre-run service per RC-12. Sharpen rotating knife head and verify shear plate clearance to prevent meat smearing.',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        status: 'COMPLETED',
        estHours: 2.0,
        actHours: 2.0
      },
      {
        woNumber: 'WO-MEAT-2026-03',
        assetCode: 'EQ-INJ-01',
        title: 'Ruhle Multi-Needle Injector Brine Line Pressure Test & Needle Inspection',
        desc: 'Perform ultrasonic cleaning of injection needles and replace 2 bent needles on head A. Verify brine pump manifold delivers 2.8 bar uniform pressure.',
        type: 'PREVENTIVE',
        priority: 'HIGH',
        status: 'COMPLETED',
        estHours: 2.5,
        actHours: 2.2
      },
      {
        woNumber: 'WO-MEAT-2026-04',
        assetCode: 'EQ-VAC-01',
        title: 'Multivac R535 Vacuum Thermoformer Heating Element & Seal Bar Maintenance',
        desc: 'Replace worn Teflon tape on upper sealing cross-bar. Verify vacuum pump reaches 5 mbar evacuation depth for Modified Atmosphere Packaging.',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        status: 'OPEN',
        estHours: 4.0,
        actHours: 0.0
      },
      {
        woNumber: 'WO-MEAT-2026-05',
        assetCode: 'EQ-MTD-01',
        title: 'Fortress Metal Detector Pneumatic Reject Cylinder Timing Verification',
        desc: 'Verify pneumatic kick-off arm reaction time within 150ms of test wand detection for 1.5mm Fe, 1.8mm Non-Fe, and 2.0mm SS per RC-40B.',
        type: 'CALIBRATION',
        priority: 'HIGH',
        status: 'COMPLETED',
        estHours: 1.5,
        actHours: 1.5
      }
    ];

    for (const wo of workOrdersList) {
      const assetId = assetMap.get(wo.assetCode) || assetRes.rows[0]?.id;
      if (assetId) {
        await client.query(`
          INSERT INTO work_orders (id, tenant_id, plant_id, wo_number, asset_id, title, description, type, priority, status, assigned_to, reported_by, estimated_hours, actual_hours, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13,
            NOW(),
            NOW()
          )
        `, [
          tenantId,
          plantId,
          wo.woNumber,
          assetId,
          wo.title,
          wo.desc,
          wo.type,
          wo.priority,
          wo.status,
          maintUserId,
          pmUserId,
          wo.estHours,
          wo.actHours
        ]);
      }
    }
    console.log(`✅ Seeded ${workOrdersList.length} authentic work orders from RC-57`);

    // 5. Seed Authentic Quality Holds from RC-28 HOLD Logs
    await client.query('DELETE FROM quality_holds WHERE tenant_id = $1;', [tenantId]);

    const holdsList = [
      {
        holdId: 'HOLD-2026-01',
        lotNumber: 'LOT-ING-20260412',
        batch: 'BAT-MEAT-2026-01',
        reason: 'Expired spices (Dextrose Monohydrate, 25kg X 4) quarantined per RC-28',
        severity: 'HIGH',
        status: 'ACTIVE_HOLD',
        heldBy: 'Stephanie Kuzmych (QA Manager)',
        notes: 'Quarantined in QA holding rack #3 pending supplier return per RC-34.'
      },
      {
        holdId: 'HOLD-2026-02',
        lotNumber: 'LOT-JRK-26FE03',
        batch: 'BAT-MEAT-2026-02',
        reason: 'GCM Teriyaki Beef Jerky 68g - Metal detector test wand reject audit (22 cases)',
        severity: 'CRITICAL',
        status: 'RELEASED',
        heldBy: 'Stephanie Kuzmych (QA Manager)',
        notes: '100% re-scanned through Fortress Metal Detector with zero non-conformance. Disposition approved.'
      },
      {
        holdId: 'HOLD-2026-03',
        lotNumber: 'LOT-HAM-008-22',
        batch: 'BAT-MEAT-2026-04',
        reason: 'Traditional Smoked Ham Formula #82A - Cooling curve CCP review (11 racks)',
        severity: 'HIGH',
        status: 'RELEASED',
        heldBy: 'Stephanie Kuzmych (QA Manager)',
        notes: 'Chilling lethality log reviewed by Stefan Crawford. Temperature declined from 54°C to 4°C within mandatory 5-hour limit. Released.'
      }
    ];

    for (const h of holdsList) {
      await client.query(`
        INSERT INTO quality_holds (id, tenant_id, plant_id, hold_id, lot_number, batch, reason, severity, status, held_by_name, notes, hold_at, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          NOW(),
          NOW(),
          NOW()
        )
      `, [tenantId, plantId, h.holdId, h.lotNumber, h.batch, h.reason, h.severity, h.status, h.heldBy, h.notes]);
    }
    console.log(`✅ Seeded ${holdsList.length} authentic quality holds from RC-28`);

    // 6. Seed Authentic Deviations from RC-29A Deviation Record Log
    await client.query('DELETE FROM deviations WHERE tenant_id = $1;', [tenantId]);

    const deviationsList = [
      {
        devNum: 'DEV-2026-01',
        title: 'QA IR Handheld Thermometer Dual-Point Calibration Offset',
        desc: 'Routine ice-point/boiling-point verification of handheld infrared thermometer showed +0.8°C offset exceeding ±0.5°C tolerance per RC-16A. Thermometer tagged out of service.',
        category: 'EQUIPMENT_CALIBRATION',
        severity: 'MINOR',
        status: 'CLOSED',
        reportedBy: 'Stephanie Kuzmych (QA Manager)'
      },
      {
        devNum: 'DEV-2026-02',
        title: 'Fortress Metal Detector Reject Kick-Off Timing Verification on Hot Pepperoni',
        desc: 'During hourly CCP check per RC-40B, 1.5mm Fe test wand rejection timing exhibited 180ms delay. Line immediately halted and pneumatic piston pressure adjusted to 6.2 bar.',
        category: 'FOOD_SAFETY_CCP',
        severity: 'MAJOR',
        status: 'CAPA_INITIATED',
        reportedBy: 'Douglas Andrew (Lead Hand)'
      }
    ];

    for (const d of deviationsList) {
      await client.query(`
        INSERT INTO deviations (id, tenant_id, plant_id, deviation_number, title, description, category, severity, status, reported_by_name, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          NOW(),
          NOW()
        )
      `, [tenantId, plantId, d.devNum, d.title, d.desc, d.category, d.severity, d.status, d.reportedBy]);
    }
    console.log(`✅ Seeded ${deviationsList.length} authentic deviations from RC-29A`);

    // 7. Seed Authentic Continuous Improvement RCA Investigations & CAPA
    await client.query('DELETE FROM ci_rca_investigations WHERE tenant_id = $1 OR plant_id = $2;', [tenantId, plantId]);
    await client.query("DELETE FROM ci_capa_actions WHERE rca_id LIKE 'RCA-%' OR id LIKE 'CAPA-%';");

    const rcaInvestigations = [
      {
        id: 'RCA-2026-01',
        title: 'Smokehouse #3 Draft Damper Sticking During Thermal Lethality Cycle',
        assetId: 'EQ-SMK-03',
        assetName: 'Smokehouse 3 (Enviro-Pak Heavy Thermal)',
        lineId: 'LINE-SMK-01',
        lineName: 'Thermal Smokehouse Line',
        severity: 'High',
        status: 'Root Cause Validated',
        currentPhase: 'Occurrence Cause',
        problemStatement: 'On batch PO-MEAT-2026-01, smokehouse #3 draft damper failed to open to 100% position during final 15-minute high heat drying step, prolonging cook cycle by 24 minutes.',
        leadInvestigator: 'Stefan Crawford (Plant Manager)',
        stage: 'PROCESSING',
        eventDate: '2026-09-18',
        whyTree: [
          { id: 'W1', question: 'Why did smokehouse #3 cook cycle extend by 24 minutes?', answer: 'The air exchange draft damper failed to open to full exhaust position.' },
          { id: 'W2', question: 'Why did the draft damper fail to open?', answer: 'Pneumatic rotary actuator experienced mechanical binding in high-temperature grease seal.' },
          { id: 'W3', question: 'Why did the grease seal bind?', answer: 'Standard lubricant degraded prematurely under 85°C continuous steam washdown.' },
          { id: 'W4', question: 'Why was standard lubricant used instead of high-temp food-grade synthetic?', answer: 'Lubrication standard spec lacked explicit high-temp rating requirement for smokehouse exhaust damper.' },
          { id: 'W5', question: 'Why was the spec missing the high-temp requirement?', answer: 'Root Cause: PM standard RC-12 lacked thermal application classification matrix for damper assemblies.' }
        ],
        eightD: {
          d4RootCause: 'Thermal degradation of non-heat-rated grease in smokehouse draft damper actuator linkage.',
          d5CorrectiveAction: 'Replaced actuator assembly and purged with Krytox high-temperature food-grade synthetic grease.',
          d7Prevention: 'Updated RC-12 PM standard to require synthetic PTFE high-temp grease inspection every 30 days.'
        }
      },
      {
        id: 'RCA-2026-02',
        title: 'Fortress Metal Detector 1.5mm Fe Test Wand Reject Synchronization Audit',
        assetId: 'EQ-MTD-01',
        assetName: 'Fortress Technology Phantom Metal Detector',
        lineId: 'LINE-PKG-01',
        lineName: 'Slicing & Packaging Line',
        severity: 'Critical',
        status: 'In Progress',
        currentPhase: 'Evidence',
        problemStatement: 'During hourly quality verification on Mild Pepperoni packaging, test wand detection reject arm actuated with 180ms delay due to low air line pressure.',
        leadInvestigator: 'Stephanie Kuzmych (QA Manager)',
        stage: 'PACKAGING',
        eventDate: '2026-09-19',
        whyTree: [
          { id: 'W1', question: 'Why did the pneumatic reject arm actuate late?', answer: 'Air line pressure dropped to 4.2 bar at the reject cylinder.' },
          { id: 'W2', question: 'Why did air line pressure drop?', answer: 'Shared pneumatic regulator was supplying both Multivac film tensioner and reject arm.' },
          { id: 'W3', question: 'Why were both units sharing the same regulator?', answer: 'Temporary air hose was installed during line rearrangement and never decoupled.' }
        ],
        eightD: {
          d4RootCause: 'Pneumatic volume drop across shared regulator during simultaneous Multivac cycle.',
          d5CorrectiveAction: 'Installed dedicated air accumulator tank and independent regulator set to 6.5 bar.',
          d7Prevention: 'Mandate independent air circuit certification on all CCP packaging equipment.'
        }
      }
    ];

    for (const r of rcaInvestigations) {
      await client.query(`
        INSERT INTO ci_rca_investigations (
          id, tenant_id, plant_id, title, asset_id, asset_name, line_id, line_name,
          severity, status, current_phase, problem_statement, lead_investigator, stage,
          event_date, days_active, why_tree, eight_d, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 2, $16::jsonb, $17::jsonb, NOW(), NOW()
        )
      `, [
        r.id,
        tenantId,
        plantId,
        r.title,
        r.assetId,
        r.assetName,
        r.lineId,
        r.lineName,
        r.severity,
        r.status,
        r.currentPhase,
        r.problemStatement,
        r.leadInvestigator,
        r.stage,
        r.eventDate,
        JSON.stringify(r.whyTree),
        JSON.stringify(r.eightD)
      ]);
    }
    console.log(`✅ Seeded ${rcaInvestigations.length} authentic continuous improvement RCA investigations`);

    // 8. Seed CAPA Actions
    const capaActions = [
      {
        id: 'CAPA-ACT-01',
        rcaId: 'RCA-2026-01',
        description: 'Install High-Temperature PTFE Sealed Cylinder on Smokehouse #3 Damper',
        actionType: 'Preventive',
        owner: 'David Markov (Maintenance Lead)',
        dueDate: '2026-10-05',
        priority: 'High',
        stage: 'PROCESSING',
        status: 'In Progress'
      },
      {
        id: 'CAPA-ACT-02',
        rcaId: 'RCA-2026-02',
        description: 'Install Dedicated 10L Air Accumulator & Dual Pressure Transducer on Metal Detector',
        actionType: 'Corrective',
        owner: 'Stephanie Kuzmych (QA Manager)',
        dueDate: '2026-09-30',
        priority: 'Critical',
        stage: 'PACKAGING',
        status: 'Completed'
      }
    ];

    for (const c of capaActions) {
      await client.query(`
        INSERT INTO ci_capa_actions (
          id, rca_id, description, action_type, owner, due_date, priority, stage, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )
      `, [
        c.id,
        c.rcaId,
        c.description,
        c.actionType,
        c.owner,
        c.dueDate,
        c.priority,
        c.stage,
        c.status
      ]);
    }
    console.log(`✅ Seeded ${capaActions.length} authentic CAPA actions`);

    // 9. Seed Vendors / Approved Contractors from RC-25 & RC-34
    await client.query('DELETE FROM purchasing_vendors WHERE tenant_id = $1;', [tenantId]);

    const vendors = [
      { code: 'VND-001', name: 'Winpak Packaging & Specialty Films Ltd', rating: '4.95', contact: 'orders@winpak.com', leadDays: 5 },
      { code: 'VND-002', name: 'Ontario Pork Producers Marketing Board', rating: '4.98', contact: 'supply@ontariopork.on.ca', leadDays: 2 },
      { code: 'VND-003', name: 'Canada Beef Processing Co', rating: '4.85', contact: 'commercial@canadabeef.ca', leadDays: 3 },
      { code: 'VND-004', name: 'Multivac Canada Inc', rating: '4.90', contact: 'service@multivac.ca', leadDays: 7 },
      { code: 'VND-005', name: 'Viscofan Canada Inc', rating: '4.75', contact: 'sales@viscofan.com', leadDays: 4 },
      { code: 'VND-006', name: 'Enviro-Pak Smokehouse Food Systems', rating: '4.88', contact: 'parts@enviro-pak.com', leadDays: 6 }
    ];

    for (const v of vendors) {
      await client.query(`
        INSERT INTO purchasing_vendors (id, tenant_id, vendor_code, name, rating, contact_email, lead_time_days, status)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ACTIVE')
      `, [tenantId, v.code, v.name, v.rating, v.contact, v.leadDays]);
    }
    console.log(`✅ Seeded ${vendors.length} authentic vendors from RC-25`);

    await client.query('COMMIT');
    console.log('🎉 ALL DATABASE DATA FOR MEAT COMPANY 1 SUCCESSFULLY SEEDED!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

seedCompleteMeatCompany().then(() => process.exit(0)).catch(() => process.exit(1));

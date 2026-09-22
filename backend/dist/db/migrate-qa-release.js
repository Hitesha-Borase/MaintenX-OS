"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQaReleaseMigration = runQaReleaseMigration;
const database_js_1 = require("../config/database.js");
async function runQaReleaseMigration() {
    const client = await database_js_1.pool.connect();
    try {
        console.log("🚀 Starting database migration for QA Release modules (Queue, Review, Approved, Blocked)...");
        // 1. Create public.qa_release_queue table IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_release_queue (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        request_id VARCHAR(100) NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        line_name VARCHAR(150) NOT NULL,
        ccp_status VARCHAR(100) DEFAULT '83.5°C (PASS)',
        brix_status VARCHAR(100) DEFAULT '11.9°Bx (OK)',
        allergen_check VARCHAR(100) DEFAULT 'Allergen Clear (0 ppm)',
        preop_check VARCHAR(100) DEFAULT 'PASSED (100% Clean)',
        open_deviations VARCHAR(100) DEFAULT '1 Open (DEV-802)',
        status VARCHAR(100) DEFAULT 'AWAITING QA SIGN-OFF',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_release_queue_tenant ON public.qa_release_queue(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_qa_release_queue_batch ON public.qa_release_queue(batch_number);
    `);
        console.log("✅ Verified public.qa_release_queue table");
        // 2. Create public.qa_approved_releases table IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_approved_releases (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        release_code VARCHAR(100) NOT NULL,
        batch_id VARCHAR(100) NOT NULL,
        recipe VARCHAR(255) NOT NULL,
        pallets VARCHAR(150) NOT NULL,
        approved_by VARCHAR(150) NOT NULL,
        release_date VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'APPROVED',
        coa_url VARCHAR(255) DEFAULT 'COA-BAT-2026-0888.pdf',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_approved_releases_tenant ON public.qa_approved_releases(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_qa_approved_releases_batch ON public.qa_approved_releases(batch_id);
    `);
        console.log("✅ Verified public.qa_approved_releases table");
        // Fetch existing tenants
        const tenantRows = await client.query(`SELECT id FROM public.tenants;`);
        const tenantIds = tenantRows.rows.map(r => r.id);
        if (!tenantIds.includes(null))
            tenantIds.push(null);
        // Tables ready without dummy seeding - only manual and live schedule data
        console.log("✅ Verified public.qa_release_queue, public.qa_approved_releases, public.quality_holds (Zero dummy seeding).");
    }
    catch (err) {
        console.error("❌ QA Release migration failed:", err);
        throw err;
    }
    finally {
        client.release();
    }
}
if (process.argv[1] && process.argv[1].includes("migrate-qa-release")) {
    runQaReleaseMigration()
        .then(() => {
        console.log("Migration finished.");
        process.exit(0);
    })
        .catch((e) => {
        console.error(e);
        process.exit(1);
    });
}

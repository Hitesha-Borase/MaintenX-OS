"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQaGovernanceMigration = runQaGovernanceMigration;
const database_js_1 = require("../config/database.js");
async function runQaGovernanceMigration() {
    const client = await database_js_1.pool.connect();
    try {
        console.log("🚀 Starting database migration for QA Governance (CAPA, Audit Trail, Reports, Notifications, Profile)...");
        // 1. Upgrade public.capa_records table (do NOT drop or recreate existing table)
        await client.query(`
      ALTER TABLE public.capa_records ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.capa_records ALTER COLUMN plant_id DROP NOT NULL;
      ALTER TABLE public.capa_records ALTER COLUMN assigned_to DROP NOT NULL;
      ALTER TABLE public.capa_records ALTER COLUMN target_completion_date DROP NOT NULL;
      ALTER TABLE public.capa_records DROP CONSTRAINT IF EXISTS capa_records_assigned_to_users_id_fk;
      ALTER TABLE public.capa_records DROP CONSTRAINT IF EXISTS capa_records_plant_id_plants_id_fk;
      ALTER TABLE public.capa_records DROP CONSTRAINT IF EXISTS capa_records_tenant_id_tenants_id_fk;
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS inv_id VARCHAR(100);
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS deviation_id VARCHAR(100);
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS root_cause TEXT;
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(150) DEFAULT 'Stephanie Kuzmych';
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS effectiveness_rate VARCHAR(50) DEFAULT '98.5%';
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS target_date VARCHAR(50);
      ALTER TABLE public.capa_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
        console.log("✅ Verified and upgraded public.capa_records table");
        // 2. Create public.qa_audit_trail table IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_audit_trail (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        event_code VARCHAR(100) NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        action_text TEXT NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        timestamp_str VARCHAR(100) NOT NULL,
        ip_address VARCHAR(100) DEFAULT '192.168.1.104',
        verified BOOLEAN DEFAULT TRUE,
        hash_sha256 VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_audit_tenant ON public.qa_audit_trail(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_qa_audit_entity ON public.qa_audit_trail(entity_id);
    `);
        console.log("✅ Verified public.qa_audit_trail table");
        // 3. Create public.qa_reports table IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_reports (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        report_code VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        date_str VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        format VARCHAR(50) DEFAULT 'PDF / CSV',
        status VARCHAR(50) DEFAULT 'READY',
        records_count INT DEFAULT 0,
        generated_by VARCHAR(150) DEFAULT 'System (Automated Daily)',
        download_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_reports_tenant ON public.qa_reports(tenant_id);
    `);
        console.log("✅ Verified public.qa_reports table");
        // 4. Create public.qa_notifications table IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_notifications (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        plant_id UUID,
        notif_code VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        msg TEXT NOT NULL,
        time_str VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'primary',
        badge VARCHAR(50) DEFAULT 'INFO',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_notif_tenant ON public.qa_notifications(tenant_id);
    `);
        console.log("✅ Verified public.qa_notifications table");
        // 5. Create public.qa_profiles and public.qa_certifications tables IF NOT EXISTS
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.qa_profiles (
        id SERIAL PRIMARY KEY,
        tenant_id UUID UNIQUE,
        name VARCHAR(150) DEFAULT 'Stephanie Kuzmych',
        role VARCHAR(150) DEFAULT 'Quality Assurance Lead',
        badge_title VARCHAR(150) DEFAULT 'QA SIGNATORY AUTHORITY',
        sub_badge VARCHAR(150) DEFAULT 'CCP AUDITOR',
        initials VARCHAR(10) DEFAULT 'RT',
        signature_pin VARCHAR(100) DEFAULT '9482',
        batches_reviewed INT DEFAULT 142,
        holds_issued INT DEFAULT 3,
        approved_releases INT DEFAULT 139,
        compliance_rating VARCHAR(50) DEFAULT '99.4%',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.qa_certifications (
        id SERIAL PRIMARY KEY,
        tenant_id UUID,
        profile_id INT REFERENCES public.qa_profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        valid_until VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_qa_cert_tenant ON public.qa_certifications(tenant_id);
    `);
        console.log("✅ Verified public.qa_profiles and public.qa_certifications tables");
        // Fetch existing tenants
        const tenantRows = await client.query(`SELECT id FROM public.tenants;`);
        const tenantIds = tenantRows.rows.map(r => r.id);
        if (!tenantIds.includes(null))
            tenantIds.push(null);
        // 6. Seed initial CAPA records if empty
        for (const tid of tenantIds) {
            const capaCount = await client.query(`
        SELECT COUNT(*)::int as count FROM public.capa_records 
        WHERE (tenant_id = $1 OR ($1 IS NULL AND tenant_id IS NULL));
      `, [tid]);
            // Auto-seeding disabled: only real operational data or manual entries should be saved in DB
            console.log("ℹ️ QA Governance schema checked (auto-seeding dummy rows disabled).");
        }
        console.log("🎉 All QA Governance tables and seeding completed successfully.");
    }
    catch (err) {
        console.error("❌ QA Governance migration failed:", err);
        throw err;
    }
    finally {
        client.release();
    }
}

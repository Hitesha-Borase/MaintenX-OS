const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function purge() {
  const client = await pool.connect();
  try {
    console.log("🧹 Starting quality dummy data purge...");

    const del1 = await client.query(`DELETE FROM public.batch_quality_reviews WHERE batch_number LIKE 'BAT-2026-089%' OR tenant_id IS NULL;`);
    console.log(`Deleted ${del1.rowCount} rows from batch_quality_reviews`);

    const del2 = await client.query(`DELETE FROM public.batch_history WHERE batch_id LIKE 'BAT-2026-088%' OR batch_id LIKE 'BAT-2026-087%' OR tenant_id IS NULL;`);
    console.log(`Deleted ${del2.rowCount} rows from batch_history`);

    const del3 = await client.query(`DELETE FROM public.batch_quality_records WHERE record_id LIKE 'REC-%' OR tenant_id IS NULL;`);
    console.log(`Deleted ${del3.rowCount} rows from batch_quality_records`);

    const del4 = await client.query(`DELETE FROM public.quality_holds WHERE hold_id IN ('BLK-101', 'HLD-501', 'HLD-502') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del4.rowCount} rows from quality_holds`);

    const del5 = await client.query(`DELETE FROM public.qa_release_queue WHERE request_id IN ('REL-101', 'REL-102') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del5.rowCount} rows from qa_release_queue`);

    const del6 = await client.query(`DELETE FROM public.qa_approved_releases WHERE release_code IN ('REL-201', 'REL-202') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del6.rowCount} rows from qa_approved_releases`);

    const del7 = await client.query(`DELETE FROM public.qa_disposition_records WHERE hold_id IN ('BLK-101', 'HLD-501', 'HLD-502') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del7.rowCount} rows from qa_disposition_records`);

    const del8 = await client.query(`DELETE FROM public.line_readiness WHERE tenant_id IS NULL;`);
    console.log(`Deleted ${del8.rowCount} rows from line_readiness`);

    const del9 = await client.query(`DELETE FROM public.cleaning_verifications WHERE tenant_id IS NULL;`);
    console.log(`Deleted ${del9.rowCount} rows from cleaning_verifications`);

    const del10 = await client.query(`DELETE FROM public.sanitation_cip_steps WHERE tenant_id IS NULL;`);
    console.log(`Deleted ${del10.rowCount} rows from sanitation_cip_steps`);

    const del11 = await client.query(`DELETE FROM public.capa_records WHERE capa_number IN ('CAPA-2026-011', 'CAPA-2026-012') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del11.rowCount} rows from capa_records`);

    const del12 = await client.query(`DELETE FROM public.ncrs WHERE ncr_number IN ('NCR-402', 'NCR-403') OR tenant_id IS NULL;`);
    console.log(`Deleted ${del12.rowCount} rows from ncrs`);

    console.log("✨ All quality dummy data successfully purged from database!");
  } catch (err) {
    console.error("Purge error:", err);
  } finally {
    client.release();
    pool.end();
  }
}
purge();

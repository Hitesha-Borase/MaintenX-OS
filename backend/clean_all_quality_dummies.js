const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function purgeAll() {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM public.quality_holds;`);
    console.log("Purged quality_holds");

    await client.query(`DELETE FROM public.deviations;`);
    console.log("Purged deviations");

    await client.query(`DELETE FROM public.capa_records;`);
    console.log("Purged capa_records");

    await client.query(`DELETE FROM public.ncrs;`);
    console.log("Purged ncrs");

    await client.query(`DELETE FROM public.qa_disposition_records;`);
    console.log("Purged qa_disposition_records");

    await client.query(`DELETE FROM public.batch_quality_reviews;`);
    console.log("Purged batch_quality_reviews");

    await client.query(`DELETE FROM public.batch_history;`);
    console.log("Purged batch_history");

    await client.query(`DELETE FROM public.batch_quality_records;`);
    console.log("Purged batch_quality_records");

    await client.query(`DELETE FROM public.qa_release_queue;`);
    console.log("Purged qa_release_queue");

    await client.query(`DELETE FROM public.qa_approved_releases;`);
    console.log("Purged qa_approved_releases");

    await client.query(`DELETE FROM public.line_readiness;`);
    console.log("Purged line_readiness");

    await client.query(`DELETE FROM public.cleaning_verifications;`);
    console.log("Purged cleaning_verifications");

    await client.query(`DELETE FROM public.sanitation_cip_steps;`);
    console.log("Purged sanitation_cip_steps");

    await client.query(`DELETE FROM public.allergen_audits;`);
    console.log("Purged allergen_audits");

    console.log("✅ All dummy quality records purged cleanly!");
  } catch (err) {
    console.error("Purge error:", err);
  } finally {
    client.release();
    pool.end();
  }
}
purgeAll();

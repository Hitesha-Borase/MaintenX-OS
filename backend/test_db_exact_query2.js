const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  try {
    const res = await pool.query(`
      SELECT 
        qs.id,
        qs.tenant_id,
        qs.sku_id,
        COALESCE(qs.parameter_name, 'Quality Parameter') AS parameter_name,
        COALESCE(qs.target_value, '0') AS target_value,
        COALESCE(qs.min_tolerance, '0') AS min_tolerance,
        COALESCE(qs.max_tolerance, '0') AS max_tolerance,
        COALESCE(qs.uom, '') AS uom,
        COALESCE(qs.is_ccp, false) AS is_ccp,
        COALESCE(qs.criticality, 'Quality Spec') AS criticality,
        COALESCE(qs.approval_status, 'Approved') AS approval_status,
        COALESCE(qs.revision, 'R1') AS revision,
        qs.created_at,
        s.sku_code,
        s.name AS sku_name
      FROM public.quality_specs qs
      LEFT JOIN public.skus s ON s.id = qs.sku_id
      ORDER BY qs.created_at DESC
    `);
    console.log("Success:", res.rows.length);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
  pool.end();
}
run();

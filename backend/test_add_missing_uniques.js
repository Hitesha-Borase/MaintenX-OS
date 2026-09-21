const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/kiaan/Maintenance-os/MaintenX-OS/backend/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  const queries = [
    "ALTER TABLE public.labour_standards ADD CONSTRAINT labour_standards_standard_id_key UNIQUE (standard_id);",
    "ALTER TABLE public.sanitation_classes ADD CONSTRAINT sanitation_classes_class_id_key UNIQUE (class_id);",
    "ALTER TABLE public.allergen_rules ADD CONSTRAINT allergen_rules_rule_id_key UNIQUE (rule_id);",
    "ALTER TABLE public.operations ADD CONSTRAINT operations_operation_code_key UNIQUE (operation_code);",
    "ALTER TABLE public.pack_configs ADD CONSTRAINT pack_configs_code_key UNIQUE (code);",
    "ALTER TABLE public.asset_types ADD CONSTRAINT asset_types_name_key UNIQUE (name);",
    "ALTER TABLE public.criticality_levels ADD CONSTRAINT criticality_levels_name_key UNIQUE (name);"
  ];
  for (const q of queries) {
    try {
      await pool.query(q);
      console.log("Success:", q.split(' ADD CONSTRAINT ')[1]);
    } catch(e) {
      console.log("Skipped or Error:", q.split(' ADD CONSTRAINT ')[1], e.message);
    }
  }
  pool.end();
}
run();

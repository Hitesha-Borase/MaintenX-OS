import { sql } from "drizzle-orm";
import { db } from "./src/db/index";

async function run() {
  const queries = [
    "ALTER TABLE public.labour_standards ADD CONSTRAINT uq_labour_std_id UNIQUE (standard_id);",
    "ALTER TABLE public.operations ADD CONSTRAINT uq_operations_code UNIQUE (operation_code);",
    "ALTER TABLE public.line_targets ADD CONSTRAINT uq_line_targets_id UNIQUE (target_id);",
    "ALTER TABLE public.sanitation_classes ADD CONSTRAINT uq_sanitation_class_id UNIQUE (class_id);",
    "ALTER TABLE public.allergen_rules ADD CONSTRAINT uq_allergen_rules_id UNIQUE (rule_id);",
    "ALTER TABLE public.asset_types ADD CONSTRAINT uq_asset_types_name UNIQUE (name);",
    "ALTER TABLE public.criticality_levels ADD CONSTRAINT uq_criticality_levels_name UNIQUE (name);",
    "ALTER TABLE public.employee_skills ADD CONSTRAINT uq_employee_skills_id UNIQUE (employee_id);",
    "ALTER TABLE public.ccp_limits ADD CONSTRAINT uq_ccp_limits_num UNIQUE (ccp_number);",
    "ALTER TABLE public.storage_resources ADD CONSTRAINT uq_storage_res_code UNIQUE (resource_code);"
  ];

  for (const q of queries) {
    try {
      await db.execute(sql.raw(q));
      console.log("Success: ", q);
    } catch (err: any) {
      console.log("Failed: ", q, err.message);
    }
  }
  process.exit(0);
}
run();

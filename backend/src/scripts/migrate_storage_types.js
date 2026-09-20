const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres:hitesha2004@localhost:5432/maintenx-os'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.storage_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Warehouse Storage',
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('Table public.storage_types created or verified.');

    const checkRes = await client.query('SELECT COUNT(*) FROM public.storage_types');
    if (parseInt(checkRes.rows[0].count, 10) === 0) {
      const seedTypes = [
        { code: 'ST-RACK', name: 'Selective Pallet Rack', cat: 'Racking & High-Bay', desc: 'Standard selective pallet rack with multi-tier beam levels' },
        { code: 'ST-SILO', name: 'Jacketed Silo', cat: 'Bulk Liquid Storage', desc: 'Stainless steel temperature-controlled jacketed tank/silo' },
        { code: 'ST-COLD', name: 'Refrigerated Staging Bay', cat: 'Cold Chain (2°C - 4°C)', desc: 'Insulated staging bay for perishable materials before processing' },
        { code: 'ST-MEZZ', name: 'Packaging Mezzanine', cat: 'Secondary Packaging', desc: 'Elevated mezzanine deck for corrugated boxes, foils, and caps' },
        { code: 'ST-FREEZE', name: 'Deep Freeze Bay', cat: 'Cold Chain (-18°C)', desc: 'Blast freezer and deep freeze storage node for frozen goods' },
        { code: 'ST-ASRS', name: 'Automated Storage & Retrieval (ASRS)', cat: 'Automated High-Bay', desc: 'High-density automated crane-assisted rack system' },
        { code: 'ST-FLOOR', name: 'Bulk Floor Staging', cat: 'Floor Staging Lane', desc: 'Marked ground buffer lane for WIP pallets and quick dispatch' }
      ];

      for (const item of seedTypes) {
        await client.query(`
          INSERT INTO public.storage_types (type_code, name, category, description, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'Active', NOW(), NOW())
        `, [item.code, item.name, item.cat, item.desc]);
      }
      console.log(`Seeded ${seedTypes.length} default storage types.`);
    } else {
      console.log(`Table public.storage_types already contains ${checkRes.rows[0].count} records.`);
    }

    const res = await client.query('SELECT id, type_code, name, category, status FROM public.storage_types ORDER BY created_at ASC');
    console.log('Current storage types:', res.rows);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();

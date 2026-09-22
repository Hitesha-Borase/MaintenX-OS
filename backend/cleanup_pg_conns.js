const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:root@localhost:5432/postgres' });
  try {
    await client.connect();
    console.log('Connected to postgres successfully.');
    const active = await client.query('SELECT pid, usename, client_addr, state, query FROM pg_stat_activity');
    console.log(`Total connections before cleanup: ${active.rows.length}`);

    const terminated = await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid != pg_backend_pid() AND state = 'idle'");
    console.log(`Terminated idle connections: ${terminated.rows.length}`);

    const remaining = await client.query('SELECT pid, usename, state FROM pg_stat_activity');
    console.log(`Remaining connections: ${remaining.rows.length}`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    try { await client.end(); } catch (e) {}
  }
}

main();

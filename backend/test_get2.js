async function test() {
  const res = await fetch('http://localhost:4000/api/v1/master-data/quality-specs');
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Full JSON:', JSON.stringify(data, null, 2));
}
test();

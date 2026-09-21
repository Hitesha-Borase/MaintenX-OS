async function test() {
  const res = await fetch('http://localhost:4000/api/v1/master-data/quality-specs');
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Total items:', data.data?.length);
  console.log('First item:', data.data?.[0]);
}
test();

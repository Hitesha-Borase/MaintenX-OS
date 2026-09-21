async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/labour-standards");
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Data length:", data.data?.length);
  if (data.data?.length > 0) {
    console.log("First item id:", data.data[0].id);
  }
}
test();

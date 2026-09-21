async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/line-targets");
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}
test();

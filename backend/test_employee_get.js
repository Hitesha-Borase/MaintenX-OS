async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/employee-skills");
  const data = await res.json();
  console.log("Data length:", data.data?.length);
  if (data.data?.length > 0) {
    console.log("First item:", data.data[0]);
  }
}
test();

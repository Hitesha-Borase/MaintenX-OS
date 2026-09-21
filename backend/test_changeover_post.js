async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/changeover-matrix", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: "CO-1234",
      matrixId: "CO-1234",
      fromSkuId: "SKU-001",
      fromSkuCode: "SKU-5001",
      fromFamily: "Fam A",
      toSkuId: "SKU-002",
      toSkuCode: "SKU-5002",
      toFamily: "Fam B",
      changeoverDurationMin: 45,
      sanitationClass: "Class A",
      allergenCleaningRequired: true,
      notes: "Test",
      status: "Active"
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}
test();

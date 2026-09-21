async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/labour-standards", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      standardId: "LBR-TEST",
      lineId: "LIN-TEST",
      lineName: "Test Line",
      standardCrew: 5,
      stdLaborHoursPer1kUnits: 1.5,
      directCostPerHour: "$20.00"
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}
test();

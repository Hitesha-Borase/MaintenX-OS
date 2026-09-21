async function test() {
  try {
    const res = await fetch("http://localhost:4000/api/v1/master-data/line-targets", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: "TGT-9999",
        plantId: "PLT-01",
        lineId: "LIN-01",
        lineName: "Test Line",
        skuId: "SKU-001",
        skuCode: "SKU-5001",
        skuName: "Test SKU",
        shift: "Morning",
        targetQuantity: 1000,
        plannedOEE: 85,
        stdRunRate: 500,
        status: "Active",
        effectiveDate: "2026-09-20"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();

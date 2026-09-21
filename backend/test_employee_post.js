async function test() {
  const res = await fetch("http://localhost:4000/api/v1/master-data/employee-skills", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeId: "EMP-001",
      name: "John Doe",
      email: "john@example.com",
      department: "Production",
      departmentId: "DEP-01",
      role: "Operator",
      plantId: "PLT-01",
      plantName: "Plant 1",
      skillLevel: "Level 1",
      skills: ["Assembly"],
      certifications: ["Safety"],
      assignedLineIds: ["LIN-01"]
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}
test();

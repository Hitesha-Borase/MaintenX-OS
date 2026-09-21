async function test() {
  try {
    const res = await fetch("http://localhost:4000/api/v1/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "admin@maintenx.com",
        password: "Password@123"
      })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();

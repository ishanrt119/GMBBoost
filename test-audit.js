async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: "647a9f8f2e2c3b4d5e6f7a8b" }) // We need a real businessId, let's fetch one
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch(e) {
    console.error(e);
  }
}
test();

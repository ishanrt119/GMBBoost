const http = require('http');

async function test() {
  const email = 'testuser2@example.com';
  const pass = 'password123';
  
  const resOnboard = await fetch('http://localhost:3000/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: pass,
      fullName: 'Test User',
      businessName: 'Test Business'
    })
  });
  const dataOnboard = await resOnboard.json();
  console.log('Onboard:', dataOnboard);
  
  const resLogin = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: pass
    })
  });
  const dataLogin = await resLogin.json();
  console.log('Login:', dataLogin);
}
test();

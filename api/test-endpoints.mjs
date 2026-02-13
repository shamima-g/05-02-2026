const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'mjones', password: 'Analyst123!' }),
});
const loginData = await loginRes.json();
const token = loginData.accessToken;

const r1 = await fetch('http://localhost:5000/api/v1/report-batches', {
  headers: { Authorization: `Bearer ${token}` },
});
const list = await r1.json();
console.log('LIST status:', r1.status, '| Batches:', list.items.length, '| Has fileSummary:', !!list.items[0].fileSummary);

const r2 = await fetch('http://localhost:5000/api/v1/report-batches/1', {
  headers: { Authorization: `Bearer ${token}` },
});
console.log('GET /report-batches/1:', r2.status);

const r3 = await fetch('http://localhost:5000/api/v1/report-batches/1/status', {
  headers: { Authorization: `Bearer ${token}` },
});
const status = await r3.json();
console.log('GET /report-batches/1/status:', r3.status, JSON.stringify(status));

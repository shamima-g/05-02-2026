// Quick smoke test for auth endpoints
const BASE = 'http://localhost:5000/api/v1';

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`PASS: ${name}`);
    if (result) console.log(`  ${result}`);
  } catch (err) {
    console.log(`FAIL: ${name} - ${err.message}`);
  }
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: await res.json() };
}

async function run() {
  console.log('=== InvestInsight Auth API Tests ===\n');

  // 1. Admin login
  let tokens;
  await test('Admin login returns tokens and user', async () => {
    const { status, data } = await post('/auth/login', { username: 'admin', password: 'Admin123!' });
    if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
    if (!data.accessToken) throw new Error('No access token');
    if (!data.refreshToken) throw new Error('No refresh token');
    if (data.user.roles[0] !== 'Administrator') throw new Error(`Wrong role: ${data.user.roles}`);
    tokens = data;
    return `User: ${data.user.displayName}, Roles: ${data.user.roles}, Perms: ${data.user.permissions.length}`;
  });

  // 2. GET /auth/me
  await test('GET /auth/me returns user from token', async () => {
    const { status, data } = await get('/auth/me', tokens.accessToken);
    if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
    if (data.username !== 'admin') throw new Error(`Wrong user: ${data.username}`);
    return `User: ${data.displayName}, Roles: ${data.roles}`;
  });

  // 3. Invalid credentials
  await test('Invalid password returns 401', async () => {
    const { status, data } = await post('/auth/login', { username: 'admin', password: 'wrong' });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
    return `Message: ${data.message}`;
  });

  // 4. Deactivated user
  await test('Deactivated user returns 403', async () => {
    const { status, data } = await post('/auth/login', { username: 'inactive', password: 'Inactive123!' });
    if (status !== 403) throw new Error(`Expected 403, got ${status}`);
    return `Message: ${data.message}`;
  });

  // 5. Unknown user
  await test('Unknown user returns 401', async () => {
    const { status } = await post('/auth/login', { username: 'nobody', password: 'test' });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });

  // 6. OperationsLead login
  await test('OperationsLead login with correct permissions', async () => {
    const { status, data } = await post('/auth/login', { username: 'sthomas', password: 'OpsLead123!' });
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.user.permissions.includes('batch.create')) throw new Error('Missing batch.create');
    if (!data.user.permissions.includes('file.upload')) throw new Error('Missing file.upload');
    return `User: ${data.user.displayName}, Perms: ${data.user.permissions.length}`;
  });

  // 7. Analyst login
  await test('Analyst login - no batch.create permission', async () => {
    const { status, data } = await post('/auth/login', { username: 'mjones', password: 'Analyst123!' });
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.user.permissions.includes('batch.create')) throw new Error('Should not have batch.create');
    return `User: ${data.user.displayName}, Perms: ${data.user.permissions.length}`;
  });

  // 8. Refresh token
  await test('Refresh token returns new tokens', async () => {
    const { status, data } = await post('/auth/refresh', { refreshToken: tokens.refreshToken });
    if (status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
    if (!data.accessToken) throw new Error('No new access token');
    return `New token obtained, User: ${data.user.displayName}`;
  });

  // 9. No auth header
  await test('GET /auth/me without token returns 401', async () => {
    const res = await fetch(`${BASE}/auth/me`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 10. All 7 users can login
  const users = [
    { username: 'sthomas', password: 'OpsLead123!', role: 'OperationsLead' },
    { username: 'mjones', password: 'Analyst123!', role: 'Analyst' },
    { username: 'lpatel', password: 'Approver1!', role: 'ApproverL1' },
    { username: 'rkim', password: 'Approver2!', role: 'ApproverL2' },
    { username: 'cnakamura', password: 'Approver3!', role: 'ApproverL3' },
    { username: 'admin', password: 'Admin123!', role: 'Administrator' },
    { username: 'viewer', password: 'Viewer123!', role: 'ReadOnly' },
  ];

  await test('All 7 BRD users can login with correct roles', async () => {
    for (const u of users) {
      const { status, data } = await post('/auth/login', { username: u.username, password: u.password });
      if (status !== 200) throw new Error(`${u.username} failed: status ${status}`);
      if (data.user.roles[0] !== u.role) throw new Error(`${u.username} role mismatch: ${data.user.roles[0]} !== ${u.role}`);
    }
    return `All 7 users authenticated successfully`;
  });

  console.log('\n=== Tests Complete ===');
}

run().catch(console.error);

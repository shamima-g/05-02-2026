// Smoke test for dashboard endpoints
const BASE = 'http://localhost:5000/api/v1';

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

async function loginAs(username, password) {
  const { data } = await post('/auth/login', { username, password });
  return data.accessToken;
}

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`PASS: ${name}`);
    if (result) console.log(`  ${result}`);
  } catch (err) {
    console.log(`FAIL: ${name} - ${err.message}`);
  }
}

async function run() {
  console.log('=== Dashboard API Tests ===\n');

  // Login as different users
  const opsToken = await loginAs('sthomas', 'OpsLead123!');
  const analystToken = await loginAs('mjones', 'Analyst123!');
  const l1Token = await loginAs('lpatel', 'Approver1!');
  const l2Token = await loginAs('rkim', 'Approver2!');
  const adminToken = await loginAs('admin', 'Admin123!');
  const viewerToken = await loginAs('viewer', 'Viewer123!');

  await test('OperationsLead gets file and validation pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', opsToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!Array.isArray(data)) throw new Error('Expected array');
    const types = data.map(a => a.type);
    if (!types.includes('file_alert')) throw new Error('Missing file_alert');
    if (!types.includes('validation')) throw new Error('Missing validation');
    return `${data.length} pending actions for OperationsLead`;
  });

  await test('Analyst gets master_data pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', analystToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    const types = data.map(a => a.type);
    if (!types.includes('master_data')) throw new Error('Missing master_data');
    return `${data.length} pending actions for Analyst`;
  });

  await test('ApproverL1 gets L1 approval pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', l1Token);
    if (status !== 200) throw new Error(`Status ${status}`);
    const approvalActions = data.filter(a => a.type === 'approval');
    return `${approvalActions.length} approval actions for L1 (should have batch in Level1Pending)`;
  });

  await test('ApproverL2 gets L2 approval pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', l2Token);
    if (status !== 200) throw new Error(`Status ${status}`);
    const approvalActions = data.filter(a => a.type === 'approval');
    if (approvalActions.length === 0) throw new Error('Expected L2 approval actions');
    return `${approvalActions.length} approval actions for L2`;
  });

  await test('Administrator gets admin pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', adminToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    const adminActions = data.filter(a => a.type === 'admin');
    if (adminActions.length === 0) throw new Error('Expected admin actions');
    return `${adminActions.length} admin actions`;
  });

  await test('ReadOnly gets no pending actions', async () => {
    const { status, data } = await get('/dashboard/pending-actions', viewerToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.length !== 0) throw new Error(`Expected 0 actions, got ${data.length}`);
    return '0 actions (correct for ReadOnly)';
  });

  await test('Dashboard activity returns recent entries', async () => {
    const { status, data } = await get('/dashboard/activity?limit=5', opsToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.length !== 5) throw new Error(`Expected 5, got ${data.length}`);
    return `${data.length} activity entries`;
  });

  await test('Data quality summary returns counts', async () => {
    const { status, data } = await get('/dashboard/data-quality-summary', opsToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (typeof data.missingRatings !== 'number') throw new Error('Missing missingRatings');
    if (typeof data.missingDurations !== 'number') throw new Error('Missing missingDurations');
    return `Ratings: ${data.missingRatings}, Durations: ${data.missingDurations}, Betas: ${data.missingBetas}, IndexPrices: ${data.missingIndexPrices}`;
  });

  await test('Report batches list returns all batches', async () => {
    const { status, data } = await get('/report-batches', opsToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.items || !data.meta) throw new Error('Expected paginated response');
    if (data.items.length !== 4) throw new Error(`Expected 4 batches, got ${data.items.length}`);
    return `${data.items.length} batches, total: ${data.meta.totalItems}`;
  });

  await test('Report batches filter by status', async () => {
    const { status, data } = await get('/report-batches?status=DataPreparation', opsToken);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (data.items.length !== 1) throw new Error(`Expected 1 batch, got ${data.items.length}`);
    if (data.items[0].status !== 'DataPreparation') throw new Error('Wrong status');
    return `1 batch in DataPreparation`;
  });

  await test('Unauthenticated request returns 401', async () => {
    const res = await fetch(`${BASE}/dashboard/pending-actions`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  console.log('\n=== Tests Complete ===');
}

run().catch(console.error);

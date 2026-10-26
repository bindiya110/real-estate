import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.MONGO_EMBEDDED_DB_PATH = '';
process.env.JWT_ACCESS_SECRET ||= 'test-access-secret-test-access-secret-123456';
process.env.JWT_REFRESH_SECRET ||= 'test-refresh-secret-test-refresh-secret-12345';

const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/database.js');
const { seed } = await import('../src/scripts/seed.js');

/** A cookie-aware client that also handles the CSRF double-submit token. */
async function client() {
  const agent = request.agent(app);
  const res = await agent.get('/api/v1/auth/csrf');
  const token = res.body.data.csrfToken;
  const wrap = (method) => (url) => agent[method](url).set('X-CSRF-Token', token);
  return { agent, get: (url) => agent.get(url), post: wrap('post'), patch: wrap('patch'), delete: wrap('delete') };
}

async function loginAs(email, password) {
  const c = await client();
  const res = await c.post('/api/v1/auth/login').send({ email, password });
  assert.equal(res.status, 200, res.body.message);
  return c;
}

before(async () => {
  await connectDB({ uri: '', embeddedPath: '' });
  await seed();
});

after(async () => {
  await disconnectDB();
});

describe('public properties', () => {
  test('lists only approved properties with pagination meta', async () => {
    const res = await request(app).get('/api/v1/properties?limit=5');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 5);
    assert.ok(res.body.meta.total >= 20);
    assert.ok(res.body.data.every((p) => p.status === 'approved'));
  });

  test('filters by listing type, city, price and bedrooms', async () => {
    const res = await request(app).get('/api/v1/properties?listingType=sale&city=bengaluru&minPrice=10000000&bedrooms=3&sort=price_asc');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    for (const p of res.body.data) {
      assert.equal(p.listingType, 'sale');
      assert.equal(p.city, 'Bengaluru');
      assert.ok(p.price >= 10000000 && p.bedrooms >= 3);
    }
    const prices = res.body.data.map((p) => p.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  test('rejects invalid query params and caps limit', async () => {
    assert.equal((await request(app).get('/api/v1/properties?sort=hack')).status, 400);
    assert.equal((await request(app).get('/api/v1/properties?limit=1000')).status, 400);
    assert.equal((await request(app).get('/api/v1/properties?city[$ne]=x')).status, 400);
  });

  test('supports text search', async () => {
    const res = await request(app).get('/api/v1/properties?q=penthouse');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.some((p) => /penthouse/i.test(p.title)));
  });

  test('hides non-approved properties from the public', async () => {
    const list = await request(app).get('/api/v1/properties?limit=48');
    const pendingSlug = 'compact-2-bhk-near-metro-bengaluru';
    assert.ok(!list.body.data.some((p) => p.slug === pendingSlug));
    assert.equal((await request(app).get(`/api/v1/properties/slug/${pendingSlug}`)).status, 404);
  });

  test('details include agent info without private fields', async () => {
    const res = await request(app).get('/api/v1/properties/slug/skyline-3-bhk-with-lake-view-bengaluru');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.agent.name);
    assert.equal(res.body.data.agent.passwordHash, undefined);
  });
});

describe('auth', () => {
  test('rejects state-changing requests without CSRF token', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'user@estatehub.dev', password: 'User@12345' });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'CSRF_INVALID');
  });

  test('register, me, logout flow uses HttpOnly cookies', async () => {
    const c = await client();
    const reg = await c.post('/api/v1/auth/register').send({ name: 'Test Person', email: 'Test@Example.com', password: 'Secret123' });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.data.user.email, 'test@example.com');
    assert.equal(reg.body.data.user.passwordHash, undefined);
    const cookies = reg.headers['set-cookie'].join(';');
    assert.match(cookies, /eh_access=.*HttpOnly/);

    const me = await c.get('/api/v1/auth/me');
    assert.equal(me.body.data.user.email, 'test@example.com');

    await c.post('/api/v1/auth/logout');
    const after = await c.get('/api/v1/auth/me');
    assert.equal(after.body.data.user, null);
  });

  test('returns generic error for bad credentials', async () => {
    const c = await client();
    const wrongPw = await c.post('/api/v1/auth/login').send({ email: 'user@estatehub.dev', password: 'nope' });
    const noUser = await c.post('/api/v1/auth/login').send({ email: 'ghost@estatehub.dev', password: 'nope' });
    assert.equal(wrongPw.status, 401);
    assert.equal(wrongPw.body.message, noUser.body.message);
  });

  test('refresh rotates tokens and detects reuse', async () => {
    const c = await loginAs('user@estatehub.dev', 'User@12345');
    const oldRefresh = c.agent.jar.getCookie('eh_refresh', { path: '/api/v1', domain: '127.0.0.1', secure: false, script: false });
    const first = await c.post('/api/v1/auth/refresh');
    assert.equal(first.status, 200);

    const attacker = request(app);
    const csrf = await attacker.get('/api/v1/auth/csrf');
    const csrfCookie = csrf.headers['set-cookie'][0].split(';')[0];
    const reuse = await attacker
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`eh_refresh=${oldRefresh?.value}`, csrfCookie])
      .set('X-CSRF-Token', csrf.body.data.csrfToken);
    assert.equal(reuse.status, 401);

    // The whole token family is revoked, so the legitimate session's refresh fails too.
    const second = await c.post('/api/v1/auth/refresh');
    assert.equal(second.status, 401);
  });

  test('password reset uses single-use tokens', async () => {
    const { getDevOutbox } = await import('../src/services/emailService.js');
    const c = await client();
    const res = await c.post('/api/v1/auth/forgot-password').send({ email: 'rohan@estatehub.dev' });
    assert.equal(res.status, 200);
    const token = getDevOutbox()[0].text.match(/token=([a-f0-9]{64})/)[1];

    const reset = await c.post('/api/v1/auth/reset-password').send({ token, password: 'NewPass123' });
    assert.equal(reset.status, 200);
    const again = await c.post('/api/v1/auth/reset-password').send({ token, password: 'NewPass456' });
    assert.equal(again.status, 400);
    await loginAs('rohan@estatehub.dev', 'NewPass123');
  });
});

describe('listings, favorites and inquiries', () => {
  test('user creates a pending listing and cannot edit others', async () => {
    const c = await loginAs('user@estatehub.dev', 'User@12345');
    const draft = await c.post('/api/v1/properties').send({
      title: 'Test Listing Apartment', description: 'A lovely test apartment with great light and views.', listingType: 'sale',
      propertyType: 'apartment', price: 5000000, city: 'Pune', area: 900, saveAsDraft: true, owner: '000000000000000000000000', status: 'approved',
    });
    assert.equal(draft.status, 201);
    assert.equal(draft.body.data.status, 'draft'); // status from the body is ignored (mass assignment)

    const submitWithoutImages = await c.patch(`/api/v1/properties/${draft.body.data._id}`).send({ saveAsDraft: false });
    assert.equal(submitWithoutImages.status, 400);

    const other = await request(app).get('/api/v1/properties/slug/contemporary-villa-with-private-pool-bengaluru');
    const forbidden = await c.patch(`/api/v1/properties/${other.body.data._id}`).send({ price: 1 });
    assert.equal(forbidden.status, 403);
    const forbiddenDelete = await c.delete(`/api/v1/properties/${other.body.data._id}`);
    assert.equal(forbiddenDelete.status, 403);
  });

  test('favorites toggle', async () => {
    const c = await loginAs('kavya@estatehub.dev', 'User@12345');
    const list = await request(app).get('/api/v1/properties?limit=1');
    const id = list.body.data[0]._id;
    assert.equal((await c.post(`/api/v1/favorites/${id}`)).status, 201);
    assert.equal((await c.post(`/api/v1/favorites/${id}`)).status, 201); // idempotent
    const ids = await c.get('/api/v1/favorites/ids');
    assert.deepEqual(ids.body.data, [id]);
    await c.delete(`/api/v1/favorites/${id}`);
    assert.deepEqual((await c.get('/api/v1/favorites/ids')).body.data, []);
  });

  test('guest inquiry goes to the listing agent, not a client-supplied recipient', async () => {
    const c = await client();
    const prop = await request(app).get('/api/v1/properties/slug/skyline-3-bhk-with-lake-view-bengaluru');
    const res = await c.post('/api/v1/inquiries').send({
      propertyId: prop.body.data._id, name: 'Guest', email: 'guest@test.com', message: 'Please call me about this flat.', recipient: '000000000000000000000000',
    });
    assert.equal(res.status, 201);
    const agentClient = await loginAs('arjun@estatehub.dev', 'Agent@12345');
    const inbox = await agentClient.get('/api/v1/users/me/inquiries?box=received');
    assert.ok(inbox.body.data.some((i) => i.email === 'guest@test.com'));
  });
});

describe('admin', () => {
  test('non-admins are blocked', async () => {
    const c = await loginAs('user@estatehub.dev', 'User@12345');
    assert.equal((await c.get('/api/v1/admin/dashboard')).status, 403);
    assert.equal((await request(app).get('/api/v1/admin/dashboard')).status, 401);
  });

  test('dashboard aggregates and approval workflow', async () => {
    const c = await loginAs('admin@estatehub.dev', 'Admin@12345');
    const dash = await c.get('/api/v1/admin/dashboard');
    assert.equal(dash.status, 200);
    assert.ok(dash.body.data.totals.properties >= 25);
    assert.equal(dash.body.data.charts.monthly.length, 6);

    const pending = await c.get('/api/v1/admin/properties?status=pending');
    const target = pending.body.data[0];
    const approved = await c.patch(`/api/v1/admin/properties/${target._id}/approve`);
    assert.equal(approved.body.data.status, 'approved');
    assert.equal((await request(app).get(`/api/v1/properties/slug/${target.slug}`)).status, 200);

    const rejected = await c.patch(`/api/v1/admin/properties/${target._id}/reject`).send({ reason: 'Duplicate listing' });
    assert.equal(rejected.body.data.status, 'rejected');
  });

  test('last admin cannot be demoted and admins cannot change their own role', async () => {
    const c = await loginAs('admin@estatehub.dev', 'Admin@12345');
    const me = await c.get('/api/v1/auth/me');
    const self = await c.patch(`/api/v1/admin/users/${me.body.data.user._id}/role`).send({ role: 'user' });
    assert.equal(self.status, 400);

    const users = await c.get('/api/v1/admin/users?q=kavya');
    const promoted = await c.patch(`/api/v1/admin/users/${users.body.data[0]._id}/role`).send({ role: 'agent' });
    assert.equal(promoted.body.data.role, 'agent');
    assert.equal(promoted.body.data.passwordHash, undefined);
  });
});

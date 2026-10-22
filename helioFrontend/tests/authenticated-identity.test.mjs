import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key), clear: () => values.clear() };
};
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.window = new EventTarget();
globalThis.document = new EventTarget();
const identity = await import('../src/api/authenticatedIdentity.js');
const { rememberAuthenticatedIdentity: remember, readAuthenticatedIdentity: read,
  loadAuthenticatedIdentity: load, captureAuthenticatedIdentity: capture, invalidateAuthenticatedIdentity: invalidate } = identity;
const profile = { id: 'a'.repeat(24), name: 'Dr. Anika Rao', email: 'anika@example.test', specialization: 'Neurology' };
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  window.dispatchEvent(new Event('doctor-auth-changed'));
});

test('captures real login profiles without changing authentication or storing another token', async () => {
  const token = 'synthetic-session-a';
  await capture('post', '/api/doctor-auth/login', { accessToken: token, doctor: profile }, '');
  assert.equal(localStorage.getItem('doctorAccessToken'), null);
  localStorage.setItem('doctorAccessToken', token);
  assert.equal(read('doctor').name, profile.name);
  assert.equal(read('doctor').specialization, profile.specialization);
  const cache = sessionStorage.getItem('clinq.doctor.identity.v1');
  assert(cache.includes(profile.name));
  assert(!cache.includes(token));
  assert.equal(JSON.parse(cache).fingerprint.length, 64);
});
test('only whitelisted identity fields are retained', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', { ...profile, password: 'PRIVATE', refreshToken: 'PRIVATE', role: 'admin' });
  assert.deepEqual(Object.keys(read('doctor')).sort(), ['_id', 'email', 'name', 'specialization']);
});
test('missing profile data is neutral and does not preserve a previous account', async () => {
  await capture('post', '/api/doctor-auth/login', { accessToken: 'session-a', doctor: profile });
  localStorage.setItem('doctorAccessToken', 'session-a');
  await capture('post', '/api/doctor-auth/login', { accessToken: 'session-b' });
  localStorage.setItem('doctorAccessToken', 'session-b');
  assert.equal(read('doctor'), null);
  assert.equal(sessionStorage.getItem('clinq.doctor.identity.v1'), null);
});
test('a changed token immediately makes old profile unreadable and cannot hydrate it', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', profile);
  localStorage.setItem('doctorAccessToken', 'session-b');
  assert.equal(read('doctor'), null);
  assert.equal(await load('doctor'), null);
  assert.equal(sessionStorage.getItem('clinq.doctor.identity.v1'), null);
});
test('late authenticated responses cannot restore another session profile', async () => {
  localStorage.setItem('doctorAccessToken', 'session-b');
  await remember('doctor', 'session-a', profile);
  await capture('get', '/api/doctor-auth/me', { doctor: profile }, 'session-a');
  assert.equal(read('doctor'), null);
});
test('logout removes only the matching role identity', async () => {
  for (const role of ['doctor', 'patient', 'clinic']) {
    localStorage.setItem(`${role}AccessToken`, `${role}-session`);
    await remember(role, `${role}-session`, profile);
  }
  localStorage.removeItem('doctorAccessToken');
  window.dispatchEvent(new Event('doctor-auth-changed'));
  assert.equal(read('doctor'), null);
  assert.equal(sessionStorage.getItem('clinq.doctor.identity.v1'), null);
  assert.equal(read('patient').name, profile.name);
  assert.equal(read('clinic').name, profile.name);
});
test('an invalidated session cannot reload its stored identity', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', profile);
  invalidate('doctor', 'session-a');
  assert.equal(await load('doctor'), null);
  assert.equal(sessionStorage.getItem('clinq.doctor.identity.v1'), null);
});
test('authenticated patient and clinic login responses use the correct source fields', async () => {
  for (const [role, root, field] of [['patient', 'auth', 'user'], ['clinic', 'cliniAuthRoutes', 'clinic']]) {
    await capture('post', `/api/${root}/login`, { accessToken: role, [field]: { ...profile, clinicName: 'Actual Clinic' } });
    localStorage.setItem(`${role}AccessToken`, role);
    assert.equal(read(role).email, profile.email);
    assert.equal(read(role).clinicName, 'Actual Clinic');
  }
});
test('partial normal dashboard profiles retain the same session account email', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', profile);
  await remember('doctor', 'session-a', { _id: profile.id, name: profile.name });
  assert.equal(read('doctor').email, profile.email);
  assert.equal(read('doctor').specialization, profile.specialization);
});
test('profile persistence cannot complete after the token is replaced', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  const saving = remember('doctor', 'session-a', profile);
  localStorage.setItem('doctorAccessToken', 'session-b');
  await saving;
  assert.equal(read('doctor'), null);
  assert.equal(sessionStorage.getItem('clinq.doctor.identity.v1'), null);
});
test('unrelated responses and forged JWT profile claims are never identity sources', async () => {
  localStorage.setItem('doctorAccessToken', `header.${btoa(JSON.stringify(profile))}.unverified`);
  await capture('get', '/api/appointments', { doctor: profile }, localStorage.getItem('doctorAccessToken'));
  assert.equal(await load('doctor'), null);
});
test('profile cache hydrates across module reload only for the exact token fingerprint', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', profile);
  const fresh = await import('../src/api/authenticatedIdentity.js?hydrate-test');
  assert.equal(await fresh.loadAuthenticatedIdentity('doctor').then(value => value.name), profile.name);
  localStorage.setItem('doctorAccessToken', 'session-b');
  assert.equal(await fresh.loadAuthenticatedIdentity('doctor'), null);
});
test('a normal response cannot replace the known account ID within the same session', async () => {
  localStorage.setItem('doctorAccessToken', 'session-a');
  await remember('doctor', 'session-a', profile);
  await remember('doctor', 'session-a', { ...profile, id: 'b'.repeat(24), name: 'Another Account' });
  assert.equal(read('doctor').name, profile.name);
});
test('clinic name aliases from normal dashboard responses update the real profile', async () => {
  localStorage.setItem('clinicAccessToken', 'clinic-session');
  await remember('clinic', 'clinic-session', { id: profile.id, clinicName: 'Previous Real Name', email: profile.email });
  await remember('clinic', 'clinic-session', { id: profile.id, name: 'Updated Real Name' });
  assert.equal(read('clinic').clinicName, 'Updated Real Name');
  assert.equal(read('clinic').email, profile.email);
});

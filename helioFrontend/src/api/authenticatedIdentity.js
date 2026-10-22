// Display-only identity from successful backend responses. Never decode a JWT
// for profile fields, persist another token, issue tokens or fetch a profile.
const roles = ['doctor', 'clinic', 'patient'];
const identities = new Map();
const pending = new Map();
const listeners = new Set();
const key = role => `clinq.${role}.identity.v1`;
const currentToken = role => localStorage.getItem(`${role}AccessToken`) || '';
const emit = () => listeners.forEach(listener => listener());
const removeStored = role => { try { sessionStorage.removeItem(key(role)); } catch { /* Display cache is optional. */ } };
const fingerprint = async token => Array.from(new Uint8Array(await crypto.subtle.digest(
  'SHA-256', new TextEncoder().encode(token),
)), byte => byte.toString(16).padStart(2, '0')).join('');

function profileFields(profile) {
  const id = profile?._id || profile?.id;
  if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) return null;
  const fields = { _id: id };
  for (const name of ['name', 'clinicName', 'email', 'specialization']) {
    if (Object.hasOwn(profile, name)) fields[name] = typeof profile[name] === 'string' ? profile[name].trim() : '';
  }
  return fields;
}

export function readAuthenticatedIdentity(role, token = currentToken(role)) {
  return token && token === currentToken(role) && identities.get(role)?.token === token
    ? identities.get(role).profile : null;
}

export async function rememberAuthenticatedIdentity(role, token, profile, login = false) {
  if (!roles.includes(role) || !token || (!login && currentToken(role) !== token)) return;
  const fields = profileFields(profile);
  const previous = identities.get(role);
  if (!login && previous?.token === token && previous.profile && fields && previous.profile._id !== fields._id) return;
  if (role === 'clinic' && fields && Object.hasOwn(fields, 'name') && !Object.hasOwn(fields, 'clinicName')) {
    fields.clinicName = fields.name;
  }
  const entry = { token, profile: fields ? {
    ...(previous?.token === token && previous.profile?._id === fields._id ? previous.profile : {}), ...fields,
  } : null };
  identities.set(role, entry);
  removeStored(role);
  emit();
  if (!entry.profile) return;
  try {
    const digest = await fingerprint(token);
    if (identities.get(role) !== entry || (!login && currentToken(role) !== token)) return;
    sessionStorage.setItem(key(role), JSON.stringify({ fingerprint: digest, profile: entry.profile }));
  } catch { /* A blocked cache must not break login or dashboard rendering. */ }
}

export async function loadAuthenticatedIdentity(role, token = currentToken(role)) {
  if (!token || token !== currentToken(role)) return null;
  if (identities.get(role)?.token === token) return readAuthenticatedIdentity(role, token);
  const existing = pending.get(role);
  if (existing?.token === token) return existing.promise;
  const promise = (async () => {
    let stored;
    try {
      stored = sessionStorage.getItem(key(role));
      const record = JSON.parse(stored);
      const digest = await fingerprint(token);
      // Ignore hydration after logout/account replacement or a newer response.
      if (token !== currentToken(role) || identities.get(role)?.token === token ||
          sessionStorage.getItem(key(role)) !== stored) return readAuthenticatedIdentity(role, token);
      const profile = record?.fingerprint === digest ? profileFields(record.profile) : null;
      identities.set(role, { token, profile });
      if (!profile) removeStored(role);
      emit();
      return profile;
    } catch {
      if (token === currentToken(role) && identities.get(role)?.token !== token) {
        identities.set(role, { token, profile: null });
        removeStored(role);
        emit();
      }
      return null;
    }
  })();
  pending.set(role, { token, promise });
  try { return await promise; } finally {
    if (pending.get(role)?.promise === promise) pending.delete(role);
  }
}

export function invalidateAuthenticatedIdentity(role, token) {
  if (token && token !== currentToken(role)) return;
  identities.set(role, { token: currentToken(role), profile: null });
  removeStored(role);
  emit();
}

function sync() {
  for (const role of roles) {
    const token = currentToken(role);
    if (!token) {
      identities.delete(role);
      removeStored(role);
    } else if (identities.get(role)?.token !== token) {
      identities.delete(role);
      void loadAuthenticatedIdentity(role, token);
    }
  }
  emit();
}

export function subscribeAuthenticatedIdentity(listener) {
  listeners.add(listener);
  sync();
  return () => listeners.delete(listener);
}

// Capture only the existing auth endpoints' successful responses. The profile
// is bound to the returned token (login) or the exact request token (/me).
export async function captureAuthenticatedIdentity(method, path, response, token) {
  const match = /^\/api\/(doctor-auth|auth|cliniAuthRoutes)\/(login|register|me)$/.exec(path);
  if (!match || response?.success === false) return;
  const role = ({ 'doctor-auth': 'doctor', auth: 'patient', cliniAuthRoutes: 'clinic' })[match[1]];
  const login = match[2] !== 'me';
  if (method.toLowerCase() !== (login ? 'post' : 'get')) return;
  const session = login ? response?.accessToken || response?.token || response?.accesstoken : token;
  const profile = role === 'doctor' ? response?.doctor : role === 'clinic' ? response?.clinic || response : response?.user || response;
  await rememberAuthenticatedIdentity(role, session, profile, login);
}

if (typeof window !== 'undefined') {
  const afterInteraction = () => queueMicrotask(sync);
  const storage = event => {
    if ((!event.storageArea || event.storageArea === localStorage) &&
        (event.key === null || roles.some(role => event.key === `${role}AccessToken`))) sync();
  };
  const events = ['doctor-auth-changed', 'clinic-auth-changed', 'patient-auth-changed', 'focus', 'pageshow'];
  events.forEach(event => window.addEventListener(event, sync));
  window.addEventListener('storage', storage);
  ['click', 'keyup', 'submit'].forEach(event => window.addEventListener(event, afterInteraction));
  document.addEventListener('visibilitychange', sync);
  import.meta.hot?.dispose(() => {
    events.forEach(event => window.removeEventListener(event, sync));
    window.removeEventListener('storage', storage);
    ['click', 'keyup', 'submit'].forEach(event => window.removeEventListener(event, afterInteraction));
    document.removeEventListener('visibilitychange', sync);
  });
}

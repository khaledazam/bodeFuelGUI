import storePersist from '@/redux/storePersist';

let inMemoryAccessToken = null;
let isSessionRedirecting = false;

function readPersistedAuth() {
  return storePersist.get('auth');
}

export function getAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  const auth = readPersistedAuth();
  const token = auth?.current?.token || null;

  if (token) {
    inMemoryAccessToken = token;
  }

  return token;
}

export function setAccessToken(token) {
  inMemoryAccessToken = token || null;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}

export function setPersistedAuth(authState) {
  storePersist.set('auth', authState);
  setAccessToken(authState?.current?.token);
}

export function clearPersistedAuth() {
  clearAccessToken();
  storePersist.remove('auth');
}

export function handleUnauthorizedSession() {
  clearPersistedAuth();
  storePersist.remove('isLogout');

  if (isSessionRedirecting) {
    return;
  }

  isSessionRedirecting = true;
  window.location.assign('/logout');
}

export function resetUnauthorizedRedirect() {
  isSessionRedirecting = false;
}

import { useSyncExternalStore } from 'react';
import { readAuthenticatedIdentity, subscribeAuthenticatedIdentity } from '../api/authenticatedIdentity';

export default function AuthenticatedIdentity({ role, children }) {
  const profile = useSyncExternalStore(subscribeAuthenticatedIdentity, () => readAuthenticatedIdentity(role));
  return children(profile);
}

import { request } from './client';
import { demoError, generateDashboardDemo, readDemoIdentity } from './dashboardDemoData';
import { invalidateAuthenticatedIdentity, loadAuthenticatedIdentity, rememberAuthenticatedIdentity } from './authenticatedIdentity';

// Both conditions are compile-time Vite constants. Production always uses the
// unchanged API client, even when the environment flag was set during build.
export const dashboardDemoEnabled = import.meta.env.DEV && import.meta.env.VITE_DASHBOARD_DEMO_MODE === 'true';

export async function requestDashboard(method, path, data, token = '') {
  const match = /^\/api\/dashboard\/(clinic|doctor|patient)(\?[^#]*)?$/.exec(path);
  if (!dashboardDemoEnabled) {
    const response = await request(method, path, data, token);
    if (match && method.toLowerCase() === 'get' && response?.success === true && response.dashboard === match[1]) {
      const kind = match[1];
      const ownKey = ({ clinic: 'clinicId', doctor: 'doctorId', patient: 'userId' })[kind];
      const filterKey = kind === 'clinic' ? 'doctorId' : 'clinicId';
      const filter = new URLSearchParams(match[2] || '').get(filterKey);
      const profile = response[kind];
      const id = profile?._id || profile?.id;
      const filters = response.appliedFilters;
      if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id) && filters?.[ownKey] === id &&
          Object.keys(filters).every(key => key === ownKey || key === filterKey) &&
          (filter ? filters[filterKey] === filter : !Object.hasOwn(filters, filterKey))) {
        await rememberAuthenticatedIdentity(kind, token, profile);
      }
    }
    return response;
  }
  if (method.toLowerCase() !== 'get' || !match) throw demoError(400, 'Only dashboard GET previews are supported.');
  let subjectId;
  try { subjectId = readDemoIdentity(token, match[1]); } catch (error) {
    invalidateAuthenticatedIdentity(match[1], token);
    throw error;
  }
  const profile = await loadAuthenticatedIdentity(match[1], token);
  return generateDashboardDemo({ kind: match[1], subjectId, search: match[2] || '', profile });
}

import api, { getListOrEmpty, extractItem } from './api';

// NOTE: organization.js is the one module that returns `organization` /
// `organizations` keys instead of `data` — every other module below uses
// `data`. This is a genuine backend inconsistency, documented in
// BACKEND_INTEGRATION_NOTES.md, and handled here rather than "fixed" on
// the frontend.

export async function getOrganizations(params = {}) {
  return getListOrEmpty(api.get('/organization/get', { params }), 'organizations', 'data');
}

export async function createOrganization(payload) {
  const response = await api.post('/organization/create', payload);
  return extractItem(response.data, 'organization', 'data');
}

export async function updateOrganization(payload) {
  const response = await api.put('/organization/update', payload);
  return extractItem(response.data, 'organization', 'data');
}

export async function deactivateOrganization(organizationId) {
  const response = await api.delete('/organization/deactivate', {
    data: { organizationId }
  });
  return extractItem(response.data, 'organization', 'data');
}

import api, { getListOrEmpty, extractItem } from './api';

// NOTE: the backend only exposes POST /create and GET /get for categories.
// There is no update or deactivate endpoint — the UI below reflects that
// (no edit/delete actions are offered for categories).

export async function getCategories(organizationId) {
  return getListOrEmpty(api.get('/category/get', { params: { organizationId } }));
}

export async function createCategory(payload) {
  // payload: { organization_name, name }
  const response = await api.post('/category/create', payload);
  return extractItem(response.data);
}

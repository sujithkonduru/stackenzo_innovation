import api, { getListOrEmpty, extractItem } from './api';

// NOTE: create/update/delete take `organization_name` (fuzzy ILIKE match)
// not organization_id, exactly as implemented in api/locations.js.

export async function getLocations(params = {}) {
  return getListOrEmpty(api.get('/locations/get', { params }));
}

export async function createLocation(payload) {
  // payload: { organization_name, name, code, address }
  const response = await api.post('/locations/create', payload);
  return extractItem(response.data);
}

export async function updateLocation(payload) {
  // payload: { locationId, name, code, address }
  const response = await api.put('/locations/update', payload);
  return extractItem(response.data);
}

export async function deactivateLocation(locationId) {
  const response = await api.delete('/locations/deactivate', {
    data: { locationId }
  });
  return extractItem(response.data);
}

import api, { getListOrEmpty, extractItem } from './api';

export async function createMaterialRequest(payload) {
  // payload: { organization_id, requested_by, project_name, purpose,
  //            items: [{ product_id, requested_quantity }] }
  const response = await api.post('/employee/request', payload);
  return extractItem(response.data);
}

export async function decideMaterialRequest(payload) {
  // payload: { request_id, approved_by, decision: 'APPROVED' | 'REJECTED' }
  const response = await api.put('/employee/decision', payload);
  return extractItem(response.data);
}

export async function getMaterialRequests(params = {}) {
  // params: organizationId, requestedBy, status, fromDate, toDate
  return getListOrEmpty(api.get('/employee/get', { params }));
}

export async function returnMaterial(payload) {
  // payload: { organization_id, request_id, location_id, returned_by,
  //            items: [{ product_id, batch_id, quantity, condition, reason }] }
  // condition must be WORKING | DAMAGED | SCRAP.
  //
  // WARNING: when condition is DAMAGED or SCRAP the backend inserts into an
  // `inventory_scrap` table that does not exist in the live schema
  // (confirmed against the database DDL). That branch will fail with a 500
  // until the backend either creates the table or removes that code path.
  // WORKING-condition returns are unaffected and work correctly.
  const response = await api.post('/employee/return', payload);
  return extractItem(response.data);
}

export async function getUserMaterialItems(params = {}) {
  // params: organization_id (required), user_id, product_id, status,
  //         start_date, end_date
  return getListOrEmpty(api.get('/employee/user-items', params ? { params } : undefined));
}

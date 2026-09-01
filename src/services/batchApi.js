import api, { getListOrEmpty, extractItem } from './api';

export async function getBatches(params = {}) {
  // params: { organizationId, productId, batchNumber }
  return getListOrEmpty(api.get('/product_batch/get', { params }));
}

export async function createBatch(payload) {
  // payload: { organization_name, product_id, batch_number, expiry_date,
  //            purchase_price, selling_price }
  const response = await api.post('/product_batch/create', payload);
  return extractItem(response.data);
}

export async function updateBatch(payload) {
  // payload: { batchId, batch_number, expiry_date, purchase_price, selling_price }
  const response = await api.put('/product_batch/update', payload);
  return extractItem(response.data);
}

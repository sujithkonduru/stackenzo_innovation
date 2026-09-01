import api, { getListOrEmpty, extractItem } from './api';

// NOTE: unlike locations/category/product, supplier.js takes
// `organization_id` (UUID) directly rather than organization_name.

export async function getSuppliers(params = {}) {
  return getListOrEmpty(api.get('/supplier/get', { params }));
}

export async function createSupplier(payload) {
  // payload: { organization_id, name, email, phone, address, tax_id }
  const response = await api.post('/supplier/create', payload);
  return extractItem(response.data);
}

export async function updateSupplier(payload) {
  // payload: { supplierId, name, email, phone, address, tax_id }
  const response = await api.put('/supplier/update', payload);
  return extractItem(response.data);
}

export async function deactivateSupplier(supplierId) {
  const response = await api.delete('/supplier/deactivate', {
    data: { supplierId }
  });
  return extractItem(response.data);
}

import api, { getListOrEmpty, extractItem } from './api';

export async function getProducts(params = {}) {
  return getListOrEmpty(api.get('/product/get', { params }));
}

export async function createProduct(payload) {
  // payload: { organization_name, category_name, name, description, sku,
  //            barcode, unit, manufacturer, reorder_level, has_expiry }
  const response = await api.post('/product/create', payload);
  return extractItem(response.data);
}

export async function updateProduct(payload) {
  // payload: { productId, categoryId, name, description, sku, barcode,
  //            unit, manufacturer, reorder_level, has_expiry }
  const response = await api.put('/product/update', payload);
  return extractItem(response.data);
}

export async function deactivateProduct(productId) {
  const response = await api.delete('/product/deactivate', {
    data: { productId }
  });
  return extractItem(response.data);
}

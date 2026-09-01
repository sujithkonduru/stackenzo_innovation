import api, { getListOrEmpty, extractItem } from './api';

export async function getInventory(params = {}) {
  // params: organizationId, locationId, productId, batchId, categoryId,
  //         name, sku, barcode, lowStock
  return getListOrEmpty(api.get('/inventory/get', { params }));
}

export async function addInventory(payload) {
  // payload: { organization_name, location_id, product_id, batch_id, quantity }
  const response = await api.post('/inventory/add', payload);
  return extractItem(response.data);
}

// There is no GET endpoint for stock_movements anywhere in the backend,
// even though purchases, sales, and material requests/returns all write to
// that table. This function is intentionally left unimplemented and
// isolated here so it is a one-line swap once the backend adds
// `GET /api/inventory/movements` (or similar).
export async function getStockMovements() {
  throw {
    isApiError: true,
    status: 501,
    message:
      'Stock movement history requires a backend endpoint that does not exist yet (no GET route reads the stock_movements table).'
  };
}

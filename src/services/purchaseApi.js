import api, { extractItem } from './api';

export async function createPurchase(payload) {
  // payload: { organization_name, supplier_id, location_id, invoice_number,
  //            purchase_date, discount, created_by, items: [{ product_id,
  //            batch_id, quantity, purchase_price, tax_percent, discount_percent }] }
  const response = await api.post('/purchase/create', payload);
  return extractItem(response.data);
}

// The backend only implements POST /purchase/create — there is no
// GET /purchase/get. Purchase history cannot be fetched until the backend
// adds it. This is intentionally left unimplemented rather than faked.
export async function getPurchases() {
  throw {
    isApiError: true,
    status: 501,
    message: 'Purchase history requires a GET endpoint that the backend does not expose yet.'
  };
}
